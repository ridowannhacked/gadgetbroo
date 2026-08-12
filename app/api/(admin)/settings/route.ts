import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";
import { storeSettingsSchema } from "@/zodSchemas/storeSettingsSchema";

export async function GET() {
  try {
    const session = await checkPermission("Settings", "canView");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let settings = await prisma.storeSettings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: "global",
          contactEmail: "mahamudul.dev@gmail.com",
          contactPhone: "+8801881835612",
          contactAddress: "Brothers Computer Zone, Sachibunia Bazar, Lobonchora,\nKhulna",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("Settings", "canUpdate");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    
    // Zod Validation
    const validationResult = storeSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten().fieldErrors }, 
        { status: 400 }
      );
    }

    const { bannerUrl, faviconUrl, contactEmail, contactPhone, contactAddress } = validationResult.data;

    const settings = await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: {
        bannerUrl,
        faviconUrl,
        contactEmail,
        contactPhone,
        contactAddress,
      },
      create: {
        id: "global",
        bannerUrl,
        faviconUrl,
        contactEmail,
        contactPhone,
        contactAddress,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
