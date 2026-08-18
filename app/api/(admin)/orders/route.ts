import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const session = await checkPermission("Orders", "canView");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const district = searchParams.get("district") || "";
    const city = searchParams.get("city") || "";
    const fromDate = searchParams.get("from") || "";
    const toDate = searchParams.get("to") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
        ]
      });
    }

    if (status) {
      where.AND.push({ status: status as import("@/src/generated/prisma/client").OrderStatus });
    }

    if (district) {
      where.AND.push({ address: { state: district } });
    }

    if (city) {
      where.AND.push({ address: { city: city } });
    }

    if (fromDate || toDate) {
      const dateFilter: any = {};
      if (fromDate) dateFilter.gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        dateFilter.lte = to;
      }
      where.AND.push({ createdAt: dateFilter });
    }

    const [rawOrders, total] = await Promise.all([
      prisma.order.findMany({
        where: where.AND.length > 0 ? where : {},
        include: {
          user: { select: { name: true, email: true } },
          address: { select: { state: true, city: true } },
          _count: { select: { items: true } },
          items: {
            take: 1,
            select: { imageSnapshot: true, productName: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: where.AND.length > 0 ? where : {} }),
    ]);

    const orders = rawOrders.map((o) => ({
      ...o,
      orderCode: `#${o.id.slice(-8).toUpperCase()}`,
      district: o.address?.state || "",
      city: o.address?.city || "",
      customerName: o.customerName || o.user?.name || "Unknown",
      customerPhone: o.customerPhone || o.user?.email || "Unknown",
    }));

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
