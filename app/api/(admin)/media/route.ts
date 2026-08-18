import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

import { checkPermission } from "@/lib/rbac";

/**
 * GET /api/media
 *
 * Reads EXCLUSIVELY from PostgreSQL — zero ImageKit SDK calls.
 * 5ms Postgres query vs 400–1200ms ImageKit API round-trip.
 *
 * Query params:
 *   search  — filter by filename (case-insensitive contains)
 *   type    — "image" | "video" | omit for all
 *   limit   — max results (default 60, max 100)
 *   skip    — pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const session = await checkPermission("Media", "canView");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type"); // "image" | "video" | null
    const page = Number(searchParams.get("page") || 1);
    const limit = Math.min(Number(searchParams.get("limit") || 60), 100);
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? { name: { contains: search, mode: "insensitive" as const } } : {},
        type ? { fileType: type } : {},
      ],
    };

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            select: {
              isPrimary: true,
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      prisma.mediaFile.count({ where }),
    ]);

    const formattedFiles = files.map((f) => ({
      fileId: f.fileId,
      name: f.name,
      url: f.url,
      filePath: f.filePath,
      fileType: f.fileType,
      mimeType: f.mimeType,
      size: f.size,
      width: f.width,
      height: f.height,
      hash: f.hash,
      createdAt: f.createdAt,
      products: f.images.map((img) => ({
        id: img.product.id,
        name: img.product.name,
        slug: img.product.slug,
        isPrimary: img.isPrimary,
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ files: formattedFiles, total, page, limit, totalPages });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json(
      { error: "Failed to load media library" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media
 *
 * Registers a newly uploaded ImageKit asset in PostgreSQL.
 * Called by MediaPickerDialog after a successful ImageKit direct upload.
 *
 * Body: { url, fileId, name, filePath, fileType, mimeType, size, width, height, hash }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("Media", "canCreate");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    if (!data.url || !data.fileId || !data.name) {
      return NextResponse.json(
        { error: "url, fileId, and name are required" },
        { status: 400 }
      );
    }

    // Upsert by fileId — idempotent in case of network retry
    const newMedia = await prisma.mediaFile.upsert({
      where: { fileId: data.fileId },
      update: {
        url: data.url,
        name: data.name,
        filePath: data.filePath || "/gadgetbroo/products",
        fileType: data.fileType || "image",
        mimeType: data.mimeType || null,
        size: data.size || 0,
        width: data.width || null,
        height: data.height || null,
        hash: data.hash || null,
      },
      create: {
        url: data.url,
        fileId: data.fileId,
        name: data.name,
        filePath: data.filePath || "/gadgetbroo/products",
        fileType: data.fileType || "image",
        mimeType: data.mimeType || null,
        size: data.size || 0,
        width: data.width || null,
        height: data.height || null,
        hash: data.hash || null,
      },
    });

    return NextResponse.json({ success: true, file: newMedia }, { status: 201 });
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json(
      { error: "Failed to register media asset" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media
 *
 * Deletes from both ImageKit CDN and PostgreSQL.
 * Blocked if the file is still linked to any product.
 *
 * Body: { fileId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await checkPermission("Media", "canDelete");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    // Block deletion if still used by a product
    const linked = await prisma.productImage.findFirst({
      where: { mediaFile: { fileId } },
      select: { id: true, product: { select: { name: true } } },
    });

    if (linked) {
      return NextResponse.json(
        {
          error: `File is used by product "${linked.product.name}". Remove it from the product before deleting.`,
        },
        { status: 400 }
      );
    }

    // Delete from ImageKit CDN first, then clean DB record
    try {
      await imagekit.deleteFile(fileId);
    } catch (err) {
      console.error("ImageKit file not found or already deleted:", err);
    }
    await prisma.mediaFile.delete({ where: { fileId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete media asset" },
      { status: 500 }
    );
  }
}
