import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { checkPermission } from "@/lib/rbac"

export async function GET(req: Request) {
  // We can use a general permission check, e.g., for the Dashboard or a generic admin check
  const session = await checkPermission("Dashboard", "canView")
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") ?? "7d"

  let since: Date | null = null
  if (range === "today") { since = new Date(); since.setHours(0, 0, 0, 0) }
  else if (range === "7d")  since = new Date(Date.now() - 7  * 864e5)
  else if (range === "30d") since = new Date(Date.now() - 30 * 864e5)

  const pvWhere  = since ? { createdAt: { gte: since } } : {}
  const evWhere  = since ? { createdAt: { gte: since } } : {}
  const ordWhere = since ? { createdAt: { gte: since } } : {}

  const [
    totalViews,
    uniqueSessionsArr,
    topPages,
    topCountries,
    deviceBreakdown,
    cartCount,
    checkoutCount,
    orderCount,
    recentSessions,
  ] = await Promise.all([
    prisma.pageView.count({ where: pvWhere }),
    prisma.pageView.findMany({ where: pvWhere, select: { sessionId: true }, distinct: ["sessionId"] }),
    prisma.pageView.groupBy({
      by: ["page"],
      _count: { id: true },
      where: pvWhere,
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["country"],
      _count: { id: true },
      where: { ...pvWhere, country: { not: "" } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({ by: ["device"], _count: { id: true }, where: pvWhere }),
    prisma.analyticsEvent.count({ where: { ...evWhere, event: "add_to_cart" } }),
    prisma.analyticsEvent.count({ where: { ...evWhere, event: "checkout" } }),
    prisma.order.count({ where: ordWhere }),
    prisma.pageView.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _max: { createdAt: true, page: true, country: true, city: true },
      _min: { ip: true, device: true, browser: true },
      where: pvWhere,
      orderBy: { _max: { createdAt: "desc" } },
      take: 10,
    }),
  ])

  const sessionIds = recentSessions.map((s) => s.sessionId)
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

  return NextResponse.json({
    overview: {
      pageViews: totalViews,
      uniqueVisitors: uniqueSessionsArr.length,
      cartEvents: cartCount,
      checkoutEvents: checkoutCount,
      orders: orderCount,
    },
    topPages: topPages.map((p) => ({ page: p.page, views: p._count.id })),
    countries: topCountries.map((c) => ({ country: c.country, views: c._count.id })),
    devices: Object.fromEntries(deviceBreakdown.map((d) => [d.device, d._count.id])),
    visitors: recentSessions.map((s) => ({
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
    })),
  })
}
