// app/api/(admin)/user/[id]/set-password/route.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY WE BYPASS auth.api.setUserPassword():
//
//   BetterAuth's built-in admin plugin checks for a flat `role` string field
//   on the User model (e.g. user.role === "admin"). GadgetBroo uses a custom
//   RBAC system where User has a `roleId` FK to a Role table, so BetterAuth
//   cannot detect admin status and returns 403 FORBIDDEN every time.
//
// THE FIX:
//   1. Verify the caller is allowed via our own RBAC Permission table.
//   2. Hash the new password ourselves using bcryptjs (same algo BetterAuth uses).
//   3. Write directly to the Account table via Prisma — no BetterAuth involvement.
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "better-auth/crypto";
import prisma from "../../../../../../lib/prisma";
import { getServerSession } from "../../../../../../helpers/get-servesession";
import { z } from "zod";
import { passwordSchema } from "../../../../../../zodSchemas/passwordSchema";

// Uses the same passwordSchema enforced during user sign-up:
//   - Minimum 8 characters
//   - At least one special character
const bodySchema = z.object({
  newPassword: passwordSchema,
});

/**
 * POST /api/user/[id]/set-password
 *
 * Administrative password override — requires the caller to have
 * `canUpdate` permission on the "Users" resource in the RBAC table.
 *
 * Body: { newPassword: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── 1. Authenticate caller ──────────────────────────────────────────────
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. RBAC check — must have canUpdate on "Users" resource ────────────
  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });

  // "admin" role name is the super-admin fallback (has all permissions by convention)
  const isAdminRole = caller?.role?.name === "admin";
  const hasUpdateUsers = caller?.role?.permissions?.some(
    (p) => p.resource === "Users" && p.canUpdate === true
  );

  if (!isAdminRole && !hasUpdateUsers) {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to reset user passwords." },
      { status: 403 }
    );
  }

  // ── 3. Validate request body ───────────────────────────────────────────
  const { id: targetUserId } = await params;
  const rawBody = await request.json();
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { newPassword } = parsed.data;

  // ── 4. Verify target user exists ───────────────────────────────────────
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ── 5. Confirm target has a credential (email/password) account ────────
  const credentialAccount = await prisma.account.findFirst({
    where: { userId: targetUserId, providerId: "credential" },
  });
  if (!credentialAccount) {
    return NextResponse.json(
      {
        error:
          "This user signed up via OAuth (Google, etc.) and has no password record. " +
          "You cannot set a password for OAuth-only accounts.",
      },
      { status: 400 }
    );
  }

  // ── 6. Hash + write directly to Account table (bypasses BetterAuth RBAC) ─
  const hashedPassword = await hashPassword(newPassword);

  await prisma.account.updateMany({
    where: { userId: targetUserId, providerId: "credential" },
    data: { password: hashedPassword },
  });

  return NextResponse.json({
    success: true,
    message: `Password updated for ${targetUser.email}`,
  });
}
