// app/api/(admin)/permissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../helpers/get-servesession";

const VALID_COLUMNS = ["canView", "canCreate", "canUpdate", "canDelete"] as const;
type PermColumn = (typeof VALID_COLUMNS)[number];

import { checkPermission } from "@/lib/rbac";

/**
 * PATCH /api/permissions
 *
 * Upserts a single permission toggle for a (roleId, resource) pair.
 *
 * Body: { roleId, resource, column, value }
 *   roleId   — the Role.id
 *   resource — e.g. "Products", "Orders", "Users", "Media", "Categories"
 *   column   — "canView" | "canCreate" | "canUpdate" | "canDelete"
 *   value    — boolean
 */
export async function PATCH(request: NextRequest) {
  const session = await checkPermission("Roles", "canUpdate");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { roleId, resource, column, value } = body;

  if (!roleId || !resource || !column) {
    return NextResponse.json(
      { error: "roleId, resource, and column are required" },
      { status: 400 }
    );
  }
  if (!VALID_COLUMNS.includes(column as PermColumn)) {
    return NextResponse.json(
      { error: `column must be one of: ${VALID_COLUMNS.join(", ")}` },
      { status: 400 }
    );
  }
  if (typeof value !== "boolean") {
    return NextResponse.json({ error: "value must be a boolean" }, { status: 400 });
  }

  // Role must exist
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  // Upsert the permission row — create if absent, update if present
  const permission = await prisma.permission.upsert({
    where: { roleId_resource: { roleId, resource } },
    create: {
      roleId,
      resource,
      canView: column === "canView" ? value : false,
      canCreate: column === "canCreate" ? value : false,
      canUpdate: column === "canUpdate" ? value : false,
      canDelete: column === "canDelete" ? value : false,
    },
    update: { [column]: value },
  });

  return NextResponse.json({ permission });
}

/**
 * POST /api/permissions/bulk
 * Batch-replaces all permissions for a role in a single transaction.
 *
 * Body: { roleId, permissions: { resource, canView, canCreate, canUpdate, canDelete }[] }
 */
export async function POST(request: NextRequest) {
  const session = await checkPermission("Roles", "canCreate");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { roleId, permissions } = body;

  if (!roleId || !Array.isArray(permissions)) {
    return NextResponse.json({ error: "roleId and permissions[] required" }, { status: 400 });
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  await prisma.$transaction(
    permissions.map((p: { resource: string; canView: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean }) =>
      prisma.permission.upsert({
        where: { roleId_resource: { roleId, resource: p.resource } },
        create: { roleId, resource: p.resource, canView: p.canView, canCreate: p.canCreate, canUpdate: p.canUpdate, canDelete: p.canDelete },
        update: { canView: p.canView, canCreate: p.canCreate, canUpdate: p.canUpdate, canDelete: p.canDelete },
      })
    )
  );

  const updated = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });

  return NextResponse.json({ role: updated });
}
