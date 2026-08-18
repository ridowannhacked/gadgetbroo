import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/helpers/get-servesession";
import { createCommentSchema } from "@/zodSchemas/commentSchema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

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
      isAdmin = fullUser?.role?.name?.toLowerCase() === 'admin';
    }

    const whereClause = isAdmin 
      ? { productId }
      : {
          productId,
          OR: [
            { isPublic: true },
            ...(userId ? [{ userId: userId }] : [])
          ]
        };

    const [comments, totalCount] = await prisma.$transaction([
      prisma.comment.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, image: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.comment.count({ where: whereClause })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: comments,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: unknown) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { productId, body: commentBody } = parsed.data;

    const comment = await prisma.comment.create({
      data: {
        productId,
        userId: session.user.id,
        body: commentBody.trim(),
        isPublic: false,
      },
      include: {
        user: { select: { name: true, image: true } }
      }
    });

    return NextResponse.json({ success: true, data: comment });
  } catch (error: unknown) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
