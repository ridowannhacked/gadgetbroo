import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/rbac";
import { revalidatePath } from "next/cache";

import { createSiteMediaSchema } from "../../../../zodSchemas/siteMediaSchema";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
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
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const parsed = createSiteMediaSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, url, fileId, placement, linkUrl, isActive, sortOrder } = parsed.data;

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
