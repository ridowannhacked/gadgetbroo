// app/api/(admin)/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";

import { checkPermission } from "@/lib/rbac";

/**
 * PATCH /api/user/[id]
 * Edit a user's email and/or role assignment.
 *
 * Body: { email?: string; roleId?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkPermission("Users", "canUpdate");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { email, roleId } = body as { email?: string; roleId?: string };

  if (!email && !roleId) {
    return NextResponse.json({ error: "Provide email and/or roleId to update" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Can't edit your own account this way (prevents lock-out)
  if (session.user.id === id) {
    return NextResponse.json({ error: "Use account settings to edit your own profile" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (email && email.trim() !== existing.email) {
    const conflict = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (conflict) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    updateData.email = email.trim();
    updateData.emailVerified = false; // reset verification on email change
  }

  if (roleId !== undefined) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    updateData.roleId = roleId;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { role: true },
  });

  return NextResponse.json({ user: updated });
}

/**
 * DELETE /api/user/[id]
 * Permanently delete a user account.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkPermission("Users", "canDelete");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  if (session.user.id === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: { select: { name: true } } },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.role?.name?.toLowerCase() === "admin") {
    return NextResponse.json({ error: "Cannot delete an admin account" }, { status: 400 });
  }

  // Cascade in schema handles Session and Account rows automatically
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
