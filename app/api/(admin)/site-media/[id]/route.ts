import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../../lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.siteMedia.update({
      where: { id },
      data: body,
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
    const session = await checkAdmin();
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
