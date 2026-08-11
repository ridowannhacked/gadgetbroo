import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/helpers/get-servesession";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const session = await getServerSession();
    const userId = session?.user?.id;
    
    let isAdmin = false;
    if (userId) {
      const fullUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
      isAdmin = fullUser?.role?.name === 'admin';
    }

    // Fetch comments based on visibility rules
    // Rule: You can see the comment IF it is public, OR if you are the author, OR if you are an admin.
    const comments = await prisma.comment.findMany({
      where: {
        productId: productId,
        OR: [
          { isPublic: true },
          ...(userId ? [{ userId: userId }] : []),
          ...(isAdmin ? [{}] : []) // If admin, match anything (this overrides OR since it includes all) Wait, actually if isAdmin is true, we should just not have an OR filter, or `{}` matches all.
        ]
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    // Fix logic: if admin, we want to fetch all comments for the product.
    const finalComments = isAdmin 
      ? await prisma.comment.findMany({
          where: { productId },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" }
        })
      : comments;

    return NextResponse.json({ success: true, data: finalComments });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, body: commentBody } = body;

    if (!productId || !commentBody || commentBody.trim() === "") {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // By default, comments are NOT public
    const comment = await prisma.comment.create({
      data: {
        productId,
        userId: session.user.id,
        body: commentBody.trim(),
        isPublic: false,
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
