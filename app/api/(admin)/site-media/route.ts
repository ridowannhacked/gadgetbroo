import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

// Basic auth check for admin routes
async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });
  if (user?.role?.name === "admin") return session;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const banners = await prisma.siteMedia.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch site media" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { title, url, fileId, placement, linkUrl, isActive, sortOrder } = body;

    if (!title || !url || !fileId || !placement) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMedia = await prisma.siteMedia.create({
      data: {
        title,
        url,
        fileId,
        placement,
        linkUrl,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    revalidatePath("/");

    return NextResponse.json({ media: newMedia }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create site media" }, { status: 500 });
  }
}
