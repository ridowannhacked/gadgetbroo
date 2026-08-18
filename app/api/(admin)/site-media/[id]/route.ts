import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

import { updateSiteMediaSchema } from "@/zodSchemas/siteMediaSchema";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSiteMediaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.siteMedia.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/");

    return NextResponse.json({ media: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    await prisma.siteMedia.delete({
      where: { id },
    });

    revalidatePath("/");

    // Note: We leave the raw ImageKit file alone so it remains in the Media Library for other uses.
    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
