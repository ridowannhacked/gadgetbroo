import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { checkPermission } from "@/lib/rbac"
import { Prisma } from "@/src/generated/prisma/client"

export async function GET(req: Request) {
  const session = await checkPermission("Dashboard", "canView")
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") ?? "7d"
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "50")
  const sortBy = searchParams.get("sortBy") ?? "lastSeen" // lastSeen, pageCount, country
  const sortOrder = searchParams.get("sortOrder") ?? "desc"
  const filterCountry = searchParams.get("country") ?? ""
  const filterDevice = searchParams.get("device") ?? ""
  const filterEvents = searchParams.get("events") ?? "" // cart, checkout, both, none

  let since: Date | null = null
  if (range === "today") { since = new Date(); since.setHours(0, 0, 0, 0) }
  else if (range === "7d")  since = new Date(Date.now() - 7  * 864e5)
  else if (range === "30d") since = new Date(Date.now() - 30 * 864e5)

  const pvWhere: Prisma.PageViewWhereInput = since ? { createdAt: { gte: since } } : {}

  // Get total count
  const totalSessions = await prisma.pageView.groupBy({
    by: ["sessionId"],
    where: pvWhere,
  })

  let sessions;
  const skip = (page - 1) * limit;
  const take = limit;

  if (sortBy === "pageCount") {
    sessions = await prisma.pageView.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _max: { createdAt: true, page: true, country: true, city: true },
      _min: { ip: true, device: true, browser: true },
      where: pvWhere,
      orderBy: { _count: { id: sortOrder as "asc" | "desc" } },
      skip, take
    });
  } else if (sortBy === "country") {
    sessions = await prisma.pageView.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _max: { createdAt: true, page: true, country: true, city: true },
      _min: { ip: true, device: true, browser: true },
      where: pvWhere,
      orderBy: { _max: { country: sortOrder as "asc" | "desc" } },
      skip, take
    });
  } else {
    sessions = await prisma.pageView.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _max: { createdAt: true, page: true, country: true, city: true },
      _min: { ip: true, device: true, browser: true },
      where: pvWhere,
      orderBy: { _max: { createdAt: sortOrder as "asc" | "desc" } },
      skip, take
    });
  }

  // Get events for these sessions
  const sessionIds = sessions.map((s) => s.sessionId)
  const sessionEvents = sessionIds.length
    ? await prisma.analyticsEvent.findMany({
        where: { sessionId: { in: sessionIds }, event: { in: ["add_to_cart", "checkout"] } },
        select: { sessionId: true, event: true },
      })
    : []

  const evMap = new Map<string, Set<string>>()
  for (const e of sessionEvents) {
    if (!evMap.has(e.sessionId)) evMap.set(e.sessionId, new Set())
    evMap.get(e.sessionId)!.add(e.event)
  }

  // Map sessions to visitor data
  let visitors = sessions.map((s) => ({
    sessionId: s.sessionId,
    ip: s._min.ip ?? "",
    country: s._max.country ?? "",
    city: s._max.city ?? "",
    device: s._min.device ?? "",
    browser: s._min.browser ?? "",
    pageCount: s._count.id,
    lastPage: s._max.page ?? "",
    lastSeen: s._max.createdAt,
    hasCart: evMap.get(s.sessionId)?.has("add_to_cart") ?? false,
    hasCheckout: evMap.get(s.sessionId)?.has("checkout") ?? false,
  }))

  // Apply filters
  if (filterCountry) {
    visitors = visitors.filter((v) => v.country.toLowerCase().includes(filterCountry.toLowerCase()))
  }
  if (filterDevice) {
    visitors = visitors.filter((v) => v.device.toLowerCase() === filterDevice.toLowerCase())
  }
  if (filterEvents) {
    if (filterEvents === "cart") {
      visitors = visitors.filter((v) => v.hasCart)
    } else if (filterEvents === "checkout") {
      visitors = visitors.filter((v) => v.hasCheckout)
    } else if (filterEvents === "both") {
      visitors = visitors.filter((v) => v.hasCart && v.hasCheckout)
    } else if (filterEvents === "none") {
      visitors = visitors.filter((v) => !v.hasCart && !v.hasCheckout)
    }
  }

  return NextResponse.json({
    data: visitors,
    pagination: {
      page,
      limit,
      total: totalSessions.length,
      totalPages: Math.ceil(totalSessions.length / limit),
    },
  })
}
