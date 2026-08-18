// app/api/(admin)/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "../../../../src/generated/prisma/client";
import prisma from "../../../../lib/prisma";
import { checkPermission } from "../../../../lib/rbac";
import { createProductSchema } from "../../../../zodSchemas/productSchema";

export async function GET(request: NextRequest) {
  try {
    const session = await checkPermission("Products", "canView");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const featured = searchParams.get("featured");
    const stock = searchParams.get("stock"); // "in" | "low" | "out"
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
    
    // Pagination params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(featured === "true" && { isFeatured: true }),
      ...(featured === "false" && { isFeatured: false }),
      ...(stock === "out" && {
        variants: { none: { isActive: true, stock: { gt: 0 } } }
      }),
      ...(stock === "low" && {
        variants: { some: { isActive: true, stock: { gt: 0, lte: 5 } } }
      }),
      ...(stock === "in" && {
        variants: { some: { isActive: true, stock: { gt: 5 } } }
      }),
    };

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
        category: { select: { name: true, slug: true } },
        variants: {
          select: { id: true, name: true, sku: true, price: true, stock: true, isActive: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { mediaFile: { select: { url: true, name: true } } },
        },
        _count: { select: { variants: true, images: true } },
      },
      orderBy: { [sortBy]: sortDir },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Compute stock status from variants for the UI
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

    return NextResponse.json({
      products: productsWithStock,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("Products", "canCreate");
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

    // Auto-generate SKUs and Names if missing
    const processedVariants = variants.map((v, index) => {
      let variantName = v.name;
      if (!variantName) {
        variantName = v.attributes && Object.values(v.attributes).length > 0 
          ? Object.values(v.attributes).join(" - ") 
          : "Default Variant";
      }
      
      let sku = v.sku;
      if (!sku) {
        const baseSlug = productData.slug;
        let attrHash = index.toString().padStart(2, '0');
        if (v.attributes && Object.keys(v.attributes).length > 0) {
          const crypto = require("crypto");
          attrHash = crypto.createHash('md5').update(JSON.stringify(v.attributes)).digest('hex').substring(0, 6).toUpperCase();
        }
        sku = `${baseSlug.toUpperCase().substring(0, 10)}-${attrHash}`.replace(/[^A-Z0-9-]/g, "");
      }

      return { ...v, name: variantName, sku };
    });

    // Check SKU uniqueness across all variants
    const skus = processedVariants.map((v) => v.sku);
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

    // Convert options and tags if necessary
    const createData: any = { ...productData };
    if (createData.options === null) createData.options = Prisma.JsonNull;
    if (createData.options && typeof createData.options === 'object') {
      createData.options = createData.options;
    }

    // Create product with variants in one transaction
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...createData,
          variants: {
            create: processedVariants.map((v) => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              attributes: v.attributes ?? Prisma.JsonNull,
              isActive: v.isActive,
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
