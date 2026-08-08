// app/api/(imagekit)/imagekit-upload-auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { checkPermission } from "@/lib/rbac";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET(request: NextRequest) {
  try {
    const session = await checkPermission("Media", "canCreate");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    ) {
      return NextResponse.json(
        { error: "ImageKit environment variables are missing" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    // Only allow: image | video
    const type = searchParams.get("type") === "video" ? "video" : "image";
    const folder =
      type === "video"
        ? "/gadgetbroo/products/videos"
        : "/gadgetbroo/products/images";

    const authParams = imagekit.getAuthenticationParameters();

    return NextResponse.json({
      ...authParams,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      folder,
      type,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload credentials" },
      { status: 500 }
    );
  }
}
