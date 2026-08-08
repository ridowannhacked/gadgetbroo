import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/helpers/get-servesession";
import { checkPermission } from "@/lib/rbac";

/**
 * POST /api/media/check-duplicate
 *
 * Accepts: { hash: string }  — SHA-256 hex of the raw file buffer (computed in-browser)
 * Returns:
 *   { duplicate: true,  file: MediaFile } — exact match found, reuse this existing record
 *   { duplicate: false }                  — unique file, proceed to upload
 *
 * Zero network bytes transferred for duplicates — dedup check happens before upload.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("Media", "canCreate");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { hash } = body;

    if (!hash || typeof hash !== "string" || hash.length !== 64) {
      return NextResponse.json(
        { error: "A valid 64-char SHA-256 hex hash is required" },
        { status: 400 }
      );
    }

    const existingFile = await prisma.mediaFile.findUnique({
      where: { hash },
      include: {
        images: {
          select: {
            isPrimary: true,
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (existingFile) {
      return NextResponse.json({ duplicate: true, file: existingFile });
    }

    return NextResponse.json({ duplicate: false });
  } catch (error) {
    console.error("check-duplicate error:", error);
    return NextResponse.json(
      { error: "Failed to verify file uniqueness" },
      { status: 500 }
    );
  }
}
