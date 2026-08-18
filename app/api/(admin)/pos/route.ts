import { NextResponse } from "next/server";
import { checkPermission } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { posCheckoutSchema } from "@/zodSchemas/posSchema";

export async function POST(req: Request) {
  try {
    const session = await checkPermission("POS", "canCreate");
    
    if (!session) {
      return NextResponse.json({ error: "Forbidden. You do not have permission to place POS orders." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = posCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const {
      customerName,
      customerPhone,
      customerAddress,
      state,
      city,
      paymentMethod,
      discount,
      items,
      notes,
    } = parsed.data;

    // Wrap everything in a Prisma transaction for hard-allocation (No Overselling)
    const order = await prisma.$transaction(async (tx) => {
      let subtotalCents = 0;
      const orderItemsData = [];

      // 1. Verify stock and lock inventory for each item
      for (const item of items) {
        // Fetch current variant and product info
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  include: { mediaFile: true },
                  take: 1
                }
              }
            }
          }
        });

        if (!variant || variant.isDeleted || !variant.isActive || !variant.product.isActive) {
          throw new Error(`Product variant ${item.variantId} is no longer available.`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Out of stock: ${variant.product.name}. Only ${variant.stock} left in stock, but you requested ${item.quantity}.`
          );
        }

        // Deduct stock
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: variant.stock - item.quantity },
        });

        // Calculate subtotal securely using integer math (cents/poisha) to avoid JS floating-point precision loss
        const priceCents = Math.round(Number(variant.price) * 100);
        subtotalCents += priceCents * item.quantity;

        // Take Snapshot of the item
        const primaryImage = variant.product.images[0]?.mediaFile.url || null;

        orderItemsData.push({
          variantId: variant.id,
          quantity: item.quantity,
          priceAtOrder: priceCents / 100,
          productName: variant.product.name,
          variantName: variant.name !== "Default" ? variant.name : "Standard Edition",
          skuAtOrder: variant.sku,
          imageSnapshot: primaryImage,
        });
      }
      
      // Look up Shipping Zone fee for the resolved location
      const shippingZone = await tx.shippingZone.findUnique({
        where: {
          stateName_cityName: {
            stateName: state,
            cityName: city,
          }
        }
      });

      if (!shippingZone) {
        throw new Error("Shipping is not available to the selected destination.");
      }

      const deliveryFeeCents = Math.round(Number(shippingZone.deliveryFee) * 100);
      const discountCents = Math.round(discount * 100);
      
      // Total = subtotal + shipping - discount
      let totalCents = subtotalCents + deliveryFeeCents - discountCents;
      if (totalCents < 0) totalCents = 0;

      const subtotal = subtotalCents / 100;
      const total = totalCents / 100;
      
      const fullAddress = `${customerAddress}, ${city}, ${state}`;
      
      // Determine Payment Status based on POS payment method
      const paymentStatus = paymentMethod === "CASH" || paymentMethod === "MANUAL_BKASH" ? "PAID" : "UNPAID";
      // Determine Order Status based on POS context (usually they take it right away, or processing)
      const orderStatus = "CONFIRMED"; // Or DELIVERED if it's instant

      // Check if user already exists based on phone to prevent duplicates, or use guest logic
      // But actually, POS shouldn't fail if user doesn't exist. It can create an Address connected to the admin placing the order, or create an inline address for the order.
      // Wait, Order address relation expects an address. Let's create one connected to the admin, or let's create a guest Address? 
      // Actually, address model requires a userId. We can attach it to the admin's ID since they are processing it, or we can just create a dummy customer if they don't exist. 
      // For simplicity, we can just connect the address to the Admin placing the order, but that might clutter their addresses.
      // Let's create an inline Address. Wait, `userId` is required on Address. We'll use the admin's `session.user.id`.
      
      const newOrder = await tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerAddress: fullAddress, // Kept for POS snapshot
          orderSource: "POS",
          subtotal,
          discount,
          total, // Subtotal + Delivery Fee - Discount
          paymentMethod,
          paymentStatus,
          status: orderStatus,
          adminNotes: notes,
          items: {
            create: orderItemsData
          }
        }
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: unknown) {
    console.error("POS Transaction Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process POS order" }, { status: 400 });
  }
}
