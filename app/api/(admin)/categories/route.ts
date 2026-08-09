// app/api/(admin)/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { checkPermission } from "../../../../lib/rbac";
import { createCategorySchema } from "../../../../zodSchemas/categorySchema";

export async function GET() {
  try {
    const session = await checkPermission("Categories", "canView");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkPermission("Categories", "canCreate");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = createCategorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, slug, description, image, isActive } = result.data;

    // Check uniqueness
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.name === name ? "Category name already exists" : "Slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        isActive,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
