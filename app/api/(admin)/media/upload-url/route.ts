import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/rbac";
import { MediaService } from "@/lib/services/mediaService";

export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("Media", "canCreate");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const fileName = body.fileName || "unnamed.bin";
    const fileType = body.fileType || "application/octet-stream";
    const type = body.type === "video" ? "video" : "image"; // General category

    const envPrefix = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const folder = type === "video"
        ? `${envPrefix}/gadgetbroo/products/videos`
        : `${envPrefix}/gadgetbroo/products/images`;

    const uploadData = await MediaService.generatePresignedUrl(fileName, fileType, folder);

    return NextResponse.json(uploadData);
  } catch (error) {
    console.error("Upload URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
