import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await req.json();
    const { stateName, cityName, deliveryFee, isActive } = body;

    const updatedZone = await prisma.shippingZone.update({
      where: { id: params.id },
      data: {
        ...(stateName && { stateName }),
        ...(cityName && { cityName }),
        ...(deliveryFee !== undefined && { deliveryFee: parseFloat(deliveryFee) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({ success: true, data: updatedZone });
  } catch (error: any) {
    console.error("Error updating shipping zone:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: "A shipping zone for this state and city already exists." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await prisma.shippingZone.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting shipping zone:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
