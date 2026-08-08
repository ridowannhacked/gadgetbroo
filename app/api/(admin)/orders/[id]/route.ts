import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";
const OrderStatus = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PaymentStatus = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("Orders", "canView");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, id: true } },
        address: true,
        items: true,
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("Orders", "canUpdate");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    
    // Only allow updating specific fields
    const { status, paymentStatus, trackingNumber, adminNotes } = body;
    
    const data: any = {};
    if (status && OrderStatus.includes(status)) data.status = status;
    if (paymentStatus && PaymentStatus.includes(paymentStatus)) data.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    if (adminNotes !== undefined) data.adminNotes = adminNotes;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data,
    });

    // Optionally log this in AuditLogs
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "ORDER_STATUS_UPDATED",
        entity: "Order",
        entityId: order.id,
        metadata: data,
      }
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
