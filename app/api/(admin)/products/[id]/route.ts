import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";
import ImageKit from "imagekit";
import { updateProductSchema } from "../../../../../zodSchemas/productSchema";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

async function checkPermission(action: "canView" | "canCreate" | "canUpdate" | "canDelete") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: { include: { permissions: true } } },
  });
  if (user?.role?.name === "admin") return session;
  const hasPerm = user?.role?.permissions.some(p => p.resource === "Products" && p[action] === true);
  return hasPerm ? session : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("canView");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: { where: { isDeleted: false } },
        images: {
          include: { mediaFile: true },
          orderBy: { isPrimary: "desc" },
        }
      }
    });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("canUpdate");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    
    const result = updateProductSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

    const { variants, ...productData } = result.data;

    if (productData.slug) {
      const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
      if (existing && existing.id !== id) return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    if (variants && variants.length > 0) {
      const skus = variants.map((v) => v.sku);
      const existingSkus = await prisma.productVariant.findMany({
        where: { sku: { in: skus }, productId: { not: id } },
        select: { sku: true },
      });
      if (existingSkus.length > 0) return NextResponse.json({ error: `SKU already exists: ${existingSkus.map(s => s.sku).join(", ")}` }, { status: 400 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      if (variants) {
        const existingVariants = await tx.productVariant.findMany({ where: { productId: id, isDeleted: false } });
        const existingVariantIds = existingVariants.map(v => v.id);
        const incomingIds = variants.map(v => v.id).filter(Boolean) as string[];

        const variantsToDelete = existingVariantIds.filter(vId => !incomingIds.includes(vId));
        
        for (const vId of variantsToDelete) {
          const hasOrders = await tx.orderItem.count({ where: { variantId: vId } });
          if (hasOrders > 0) {
            await tx.productVariant.update({ where: { id: vId }, data: { isDeleted: true, deletedAt: new Date() } });
          } else {
            await tx.productVariant.delete({ where: { id: vId } });
          }
        }

        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: { name: v.name, sku: v.sku, price: v.price, stock: v.stock, color: v.color, storage: v.storage, size: v.size, isActive: v.isActive }
            });
          } else {
            await tx.productVariant.create({
              data: { ...v, price: v.price, productId: id }
            });
          }
        }
      }

      return await tx.product.update({
        where: { id },
        data: productData,
        include: { variants: { where: { isDeleted: false } } }
      });
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("canDelete");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { select: { id: true, mediaFileId: true, mediaFile: { select: { fileId: true, id: true } } } },
        variants: { select: { id: true, _count: { select: { orderItems: true } } } },
      },
    });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const orderItemCount = product.variants.reduce((sum, v) => sum + v._count.orderItems, 0);
    if (orderItemCount > 0) {
      await prisma.$transaction([
        prisma.product.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } }),
        prisma.productVariant.updateMany({ where: { productId: id }, data: { isDeleted: true, deletedAt: new Date() } })
      ]);
      return NextResponse.json({ success: true, message: "Product soft-deleted because it exists in previous orders.", softDeleted: true });
    }

    const mediaFileIds = product.images.map((img) => img.mediaFileId);
    
    // 1. Delete the product (this cascades and deletes associated ProductImage and ProductVariant records)
    await prisma.product.delete({ where: { id } });

    // 2. Now check if the MediaFiles are orphaned and delete them
    for (const mediaFileId of mediaFileIds) {
      const usageCount = await prisma.productImage.count({ where: { mediaFileId } });
      if (usageCount === 0) {
        const mf = await prisma.mediaFile.findUnique({ where: { id: mediaFileId } });
        if (mf?.fileId) {
          try {
            await imagekit.deleteFile(mf.fileId);
          } catch (err) {
            console.error("ImageKit file not found or already deleted:", err);
          }
          await prisma.mediaFile.delete({ where: { id: mediaFileId } });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Product and its media permanently deleted", softDeleted: false });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
