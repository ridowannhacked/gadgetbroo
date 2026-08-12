import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "You must be logged in to checkout." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      addressId,
      fullName,
      phone,
      line1,
      city,
      state,
      postalCode,
      saveAddress,
      paymentMethod,
      items,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

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

      // 2. Resolve the final Address and Shipping Zone
      let finalAddressId = "";
      let finalState = "";
      let finalCity = "";

      if (addressId) {
        // User selected an existing address
        const existingAddress = await tx.address.findUnique({
          where: { id: addressId },
        });

        if (!existingAddress || existingAddress.userId !== userId) {
          throw new Error("Invalid address selected.");
        }

        finalAddressId = existingAddress.id;
        finalState = existingAddress.state;
        finalCity = existingAddress.city;
      } else {
        // User provided a new address
        if (!fullName || !phone || !line1 || !city || !state) {
          throw new Error("Missing required address fields.");
        }

        // If they want to save it as default, we could unset others here.
        // For now, we'll just set it to default if it's their first address or if they chose saveAddress
        const newAddress = await tx.address.create({
          data: {
            userId,
            fullName,
            phone,
            line1,
            city,
            state,
            postalCode: postalCode || "0000",
            country: "BD",
            isDefault: saveAddress || false,
          }
        });

        finalAddressId = newAddress.id;
        finalState = newAddress.state;
        finalCity = newAddress.city;
      }

      // Look up Shipping Zone fee for the resolved location
      const shippingZone = await tx.shippingZone.findUnique({
        where: {
          stateName_cityName: {
            stateName: finalState,
            cityName: finalCity,
          }
        }
      });

      if (!shippingZone) {
        throw new Error("Shipping is not available to the selected destination.");
      }

      // Calculate final totals in cents
      const deliveryFeeCents = Math.round(Number(shippingZone.deliveryFee) * 100);
      const totalCents = subtotalCents + deliveryFeeCents;

      const subtotal = subtotalCents / 100;
      const total = totalCents / 100;

      // 3. Create the Final Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: finalAddressId,
          subtotal,
          total, // Subtotal + Delivery Fee (discount is 0 by default)
          paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "CASH_ON_DELIVERY",
          status: "PENDING",
          paymentStatus: "UNPAID",
          items: {
            create: orderItemsData
          }
        }
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: unknown) {
    console.error("Checkout Transaction Error:", error);
    // Return 400 Bad Request with the specific error message (e.g., "Out of stock")
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process checkout" }, { status: 400 });
  }
}
