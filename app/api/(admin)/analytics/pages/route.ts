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
  const sortBy = searchParams.get("sortBy") ?? "views" // views or page
  const sortOrder = searchParams.get("sortOrder") ?? "desc"
  const search = searchParams.get("search") ?? ""

  let since: Date | null = null
  if (range === "today") { since = new Date(); since.setHours(0, 0, 0, 0) }
  else if (range === "7d")  since = new Date(Date.now() - 7  * 864e5)
  else if (range === "30d") since = new Date(Date.now() - 30 * 864e5)

  const pvWhere: Prisma.PageViewWhereInput  = since ? { createdAt: { gte: since } } : {}
  const searchWhere: Prisma.PageViewWhereInput = search ? { page: { contains: search, mode: "insensitive" } } : {}

  // Get total count for pagination
  const totalPages = await prisma.pageView.groupBy({
    by: ["page"],
    where: { ...pvWhere, ...searchWhere },
  })

  // Get paginated data
  const pagesData = await prisma.pageView.groupBy({
    by: ["page"],
    _count: { id: true },
    where: { ...pvWhere, ...searchWhere },
    orderBy: sortBy === "page"
      ? { page: sortOrder as "asc" | "desc" }
      : { _count: { id: sortOrder as "asc" | "desc" } },
    skip: (page - 1) * limit,
    take: limit,
  })

  return NextResponse.json({
    data: pagesData.map((p) => ({ page: p.page, views: p._count.id })),
    pagination: {
      page,
      limit,
      total: totalPages.length,
      totalPages: Math.ceil(totalPages.length / limit),
    },
  })
}
