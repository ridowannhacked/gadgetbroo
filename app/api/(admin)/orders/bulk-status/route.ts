import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";

export async function PATCH(request: NextRequest) {
  try {
    const session = await checkPermission("Orders", "canUpdate");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || !status) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updated = await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { status: status as import("@/src/generated/prisma/client").OrderStatus },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    console.error("Orders Bulk PATCH error:", error);
    return NextResponse.json({ error: "Failed to update orders" }, { status: 500 });
  }
}
