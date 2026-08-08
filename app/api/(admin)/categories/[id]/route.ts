// app/api/(admin)/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";
import { updateCategorySchema } from "../../../../../zodSchemas/categorySchema";

import { checkPermission } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("Categories", "canUpdate");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (result.data.name || result.data.slug) {
      const conflict = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                result.data.name ? { name: result.data.name } : {},
                result.data.slug ? { slug: result.data.slug } : {},
              ],
            },
          ],
        },
      });

      if (conflict) {
        return NextResponse.json(
          {
            error:
              conflict.name === result.data.name
                ? "Name already taken"
                : "Slug already taken",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: result.data,
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkPermission("Categories", "canDelete");
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete — ${category._count.products} product(s) are using this category`,
        },
        { status: 400 }
      );
    }

    // DB only — no ImageKit folder delete
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
