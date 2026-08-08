// app/api/(admin)/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { createProductSchema } from "../../../../zodSchemas/productSchema";

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

export async function GET(request: NextRequest) {
  try {
    const session = await checkPermission("canView");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const featured = searchParams.get("featured");
    const stock = searchParams.get("stock"); // "in" | "low" | "out"
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

    const products = await prisma.product.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(categoryId && { categoryId }),
        ...(featured === "true" && { isFeatured: true }),
        ...(featured === "false" && { isFeatured: false }),
      },
      include: {
        category: { select: { name: true, slug: true } },
        variants: {
          select: { price: true, stock: true, isActive: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { mediaFile: { select: { url: true, name: true } } },
        },
        _count: { select: { variants: true, images: true } },
      },
      orderBy: { [sortBy]: sortDir },
    });

    // Compute stock status from variants
    const productsWithStock = products.map((p) => {
      const activeVariants = p.variants.filter((v) => v.isActive);
      const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
      const stockStatus =
        totalStock === 0 ? "out" : totalStock <= 5 ? "low" : "in";
      const lowestPrice = activeVariants.length > 0
        ? Math.min(...activeVariants.map((v) => Number(v.price)))
        : 0;
      return { ...p, totalStock, stockStatus, lowestPrice };
    });

    // Filter by stock status after computing
    const filtered = stock
      ? productsWithStock.filter((p) => p.stockStatus === stock)
      : productsWithStock;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("canCreate");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const result = createProductSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { variants, ...productData } = result.data;

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    // Check SKU uniqueness across all variants
    const skus = variants.map((v) => v.sku);
    const existingSkus = await prisma.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });
    if (existingSkus.length > 0) {
      return NextResponse.json(
        { error: `SKU already exists: ${existingSkus.map((s) => s.sku).join(", ")}` },
        { status: 400 }
      );
    }

    // Create product with variants in one transaction
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...productData,
          variants: {
            create: variants.map((v) => ({
              ...v,
              price: v.price, // Prisma Decimal handles this
            })),
          },
        },
        include: {
          variants: true,
          category: { select: { name: true, slug: true } },
        },
      });
      return created;
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
