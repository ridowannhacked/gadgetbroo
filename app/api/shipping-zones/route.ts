import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: [
        { stateName: 'asc' },
        { cityName: 'asc' }
      ]
    });
    return NextResponse.json({ success: true, data: zones });
  } catch (error: unknown) {
    console.error("Error fetching shipping zones:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stateName, cityName, deliveryFee, isActive } = body;

    if (!stateName || !cityName || deliveryFee === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const zone = await prisma.shippingZone.create({
      data: {
        stateName,
        cityName,
        deliveryFee: parseFloat(deliveryFee),
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json({ success: true, data: zone });
  } catch (error: unknown) {
    console.error("Error creating shipping zone:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: "A shipping zone for this state and city already exists." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
