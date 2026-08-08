import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "../../../../lib/prisma";
import { auth, User } from "../../../../lib/auth";
import { authClient } from "../../../../lib/auth-client";
import { CreateUserSchema } from "../../../../zodSchemas/createUserSchema";

export async function GET() {

  try {
    // Check session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    if (fullUser?.role?.name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allUsers = await prisma.user.findMany({
      include: {
        role: true,
      },

    });
    if (!allUsers) return NextResponse.json({ error: "Server error" }, { status: 500 })

    return NextResponse.json(allUsers)
  } catch (error) {
    return NextResponse.json({ error: "Couldn't fetch data" }, { status: 500 })
  }


}

export async function POST(request: NextRequest) {
  type user = {
    user: User
  }

  try {
    // Check session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    if (fullUser?.role?.name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reqData = await request.json()

    const result = CreateUserSchema.safeParse(reqData)

    if (!result.success) return NextResponse.json({ error: "Give the acctual data needed to signup" }, { status: 400 })


    const { name, email, password, roleId } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });

    // auth.api on the server — creates auth credential + user row
    const signUpRes = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!signUpRes?.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Assign role if specified
    if (roleId) {
      const selectedRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (selectedRole) {
        await prisma.user.update({
          where: { id: signUpRes.user.id },
          data: { roleId },
        });
      }
    }

    // Fetch the created user with role
    const newUser = await prisma.user.findUnique({
      where: { id: signUpRes.user.id },
      include: { role: true },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Can't create user" }, { status: 500 });
  }
}
