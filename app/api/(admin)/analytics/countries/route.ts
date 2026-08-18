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
  const sortBy = searchParams.get("sortBy") ?? "views" // views or country
  const sortOrder = searchParams.get("sortOrder") ?? "desc"
  const search = searchParams.get("search") ?? ""

  let since: Date | null = null
  if (range === "today") { since = new Date(); since.setHours(0, 0, 0, 0) }
  else if (range === "7d")  since = new Date(Date.now() - 7  * 864e5)
  else if (range === "30d") since = new Date(Date.now() - 30 * 864e5)

  const pvWhere: Prisma.PageViewWhereInput = since ? { createdAt: { gte: since } } : {}
  const searchWhere: Prisma.PageViewWhereInput = search ? { country: { contains: search, mode: "insensitive" } } : {}

  // Get total count for pagination
  const totalCountries = await prisma.pageView.groupBy({
    by: ["country"],
    where: { ...pvWhere, ...searchWhere, country: { not: "" } },
  })

  // Get paginated data
  const countriesData = await prisma.pageView.groupBy({
    by: ["country"],
    _count: { id: true },
    where: { ...pvWhere, ...searchWhere, country: { not: "" } },
    orderBy: sortBy === "country"
      ? { country: sortOrder as "asc" | "desc" }
      : { _count: { id: sortOrder as "asc" | "desc" } },
    skip: (page - 1) * limit,
    take: limit,
  })

  return NextResponse.json({
    data: countriesData.map((c) => ({ country: c.country, views: c._count.id })),
    pagination: {
      page,
      limit,
      total: totalCountries.length,
      totalPages: Math.ceil(totalCountries.length / limit),
    },
  })
}
