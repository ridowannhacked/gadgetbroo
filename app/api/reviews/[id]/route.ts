import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("Reviews", "canUpdate");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    
    // Only allow updating isVisible
    const { isVisible } = body;
    
    if (typeof isVisible !== "boolean") {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isVisible },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Review PATCH error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("Reviews", "canDelete");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
