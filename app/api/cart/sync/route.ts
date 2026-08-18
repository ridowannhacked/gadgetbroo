import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { items, action } = body; 
    // action: "sync" (upsert all), "add", "update", "remove", "clear"

    // Ensure cart exists
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    if (action === "clear") {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    } 
    else if (action === "remove" && items?.[0]?.variantId) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, variantId: items[0].variantId }
      });
    }
    else if (action === "sync" || action === "add" || action === "update") {
      // Upsert the provided items
      if (Array.isArray(items)) {
        for (const item of items) {
          if (!item.variantId || !item.quantity) continue;
          
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId }
          });
          if (!variant) continue; // Skip invalid variants
          
          const safeQty = Math.min(item.quantity, variant.stock);
          
          await prisma.cartItem.upsert({
            where: {
              cartId_variantId: { cartId: cart.id, variantId: item.variantId }
            },
            create: {
              cartId: cart.id,
              variantId: item.variantId,
              quantity: safeQty
            },
            update: {
              quantity: action === "add" 
                ? { increment: safeQty } 
                : safeQty // update/sync sets exact quantity
            }
          });
          
          // Double check stock limit after upsert
          const currentItem = await prisma.cartItem.findUnique({
            where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } }
          });
          if (currentItem && currentItem.quantity > variant.stock) {
            await prisma.cartItem.update({
              where: { id: currentItem.id },
              data: { quantity: variant.stock }
            });
          }
        }
      }
    }

    // Fetch the updated cart to return to the client
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true, images: { where: { isPrimary: true }, take: 1, select: { mediaFile: true } } }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("Cart Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true, images: { where: { isPrimary: true }, take: 1, select: { mediaFile: true } } }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error("Cart Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
