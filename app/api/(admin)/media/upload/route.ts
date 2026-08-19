import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/rbac";
import { MediaService } from "@/lib/services/mediaService";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * POST /api/media/upload
 *
 * Accepts multipart/form-data with a "file" field and uploads it to Garage
 * directly from the server. The browser never talks to Garage — this avoids
 * relying on Garage's cross-origin preflight support, which is unreliable
 * behind its current edge/proxy (mirrors the working pattern in the sibling
 * octetit project's /api/upload).
 *
 * Returns: { url, fileKey }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("Media", "canCreate");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only images and videos are supported" },
        { status: 400 }
      );
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File exceeds the ${maxBytes / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = MediaService.buildFileKey(file.name);
    const uploadData = await MediaService.uploadFile(fileKey, buffer, file.type);

    return NextResponse.json(uploadData);
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
