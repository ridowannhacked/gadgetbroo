// app/api/(admin)/products/[id]/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../../../lib/auth";
import prisma from "../../../../../../lib/prisma";

import { checkPermission } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkPermission("Products", "canCreate");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: productId } = await params;
  const { url, fileId, name, fileType, size, width, height, isPrimary } = await request.json();

  if (!url || !fileId) {
    return NextResponse.json({ error: "url and fileId required" }, { status: 400 });
  }

  // Upsert MediaFile — if already exists (chosen from library), just get its id
  const mediaFile = await prisma.mediaFile.upsert({
    where: { fileId },
    update: {},
    create: {
      fileId,
      url,
      name: name ?? fileId,
      fileType: fileType ?? "image",
      size: size ?? 0,
      width: width ?? null,
      height: height ?? null,
    },
  });

  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const image = await prisma.productImage.create({
    data: {
      productId,
      mediaFileId: mediaFile.id,
      isPrimary: !!isPrimary,
    },
  });

  return NextResponse.json({ image }, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkPermission("Products", "canUpdate");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: productId } = await params;
  const { imageId } = await request.json();

  await prisma.productImage.updateMany({
    where: { productId, isPrimary: true },
    data: { isPrimary: false },
  });

  const image = await prisma.productImage.update({
    where: { id: imageId },
    data: { isPrimary: true },
  });

  return NextResponse.json({ image });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkPermission("Products", "canDelete");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { imageId } = await request.json();
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { mediaFile: { select: { fileId: true } } },
  });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best-effort delete from ImageKit (only if not shared with other products)
  if (image.mediaFile?.fileId) {
    const usageCount = await prisma.productImage.count({
      where: { mediaFileId: image.mediaFileId, id: { not: imageId } },
    });
    if (usageCount === 0) {
      await fetch(`https://api.imagekit.io/v1/files/${image.mediaFile.fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.IMAGEKIT_PRIVATE_KEY + ":"
          ).toString("base64")}`,
        },
      }).catch(console.error);
    }
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  return NextResponse.json({ success: true });
}
