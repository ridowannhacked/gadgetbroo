import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { z } from "zod";
import { passwordSchema } from "@/zodSchemas/passwordSchema";

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden: Only the admin can update their profile." }, { status: 403 });

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, currentPassword, newPassword } = parsed.data;

    if (!name && !email && !newPassword) {
       return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    // Update Name and Email
    if (name || email) {
      if (email && email !== session.user.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });
    }

    // Update Password
    if (newPassword) {
      if (!currentPassword) {
         return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }

      const passCheck = passwordSchema.safeParse(newPassword);
      if (!passCheck.success) {
        return NextResponse.json({ error: passCheck.error.issues[0].message }, { status: 400 });
      }

      const account = await prisma.account.findFirst({
        where: { userId: session.user.id, providerId: "credential" },
      });
      if (!account || !account.password) {
        return NextResponse.json({ error: "No password set for this account (OAuth user)" }, { status: 400 });
      }

      const isValid = await verifyPassword({ hash: account.password, password: currentPassword });
      if (!isValid) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });

      const hashed = await hashPassword(newPassword);
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashed },
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
