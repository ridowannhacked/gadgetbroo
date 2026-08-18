import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/helpers/get-servesession";
import { updateCommentSchema } from "@/zodSchemas/commentSchema";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id }
    });

    if (!comment) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });
    const isAdmin = fullUser?.role?.name?.toLowerCase() === 'admin';

    const rawBody = await req.json();
    const parsed = updateCommentSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const body = parsed.data;

    // Check permissions
    if (isAdmin) {
      // Admin can update isPublic, adminReply, and potentially the body.
      const updatedComment = await prisma.comment.update({
        where: { id: params.id },
        data: {
          ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
          ...(body.adminReply !== undefined && { adminReply: body.adminReply }),
        }
      });
      return NextResponse.json({ success: true, data: updatedComment });
    } else if (comment.userId === session.user.id) {
      // User can only update their own comment body
      if (!body.body || body.body.trim() === "") {
        return NextResponse.json({ success: false, error: "Comment body is required" }, { status: 400 });
      }
      const updatedComment = await prisma.comment.update({
        where: { id: params.id },
        data: {
          body: body.body.trim()
        }
      });
      return NextResponse.json({ success: true, data: updatedComment });
    } else {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  } catch (error: unknown) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.id }
    });

    if (!comment) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });
    const isAdmin = fullUser?.role?.name?.toLowerCase() === 'admin';

    // Only author or admin can delete
    if (isAdmin || comment.userId === session.user.id) {
      await prisma.comment.delete({
        where: { id: params.id }
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  } catch (error: unknown) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
