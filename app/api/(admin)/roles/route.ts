import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { string, success } from "zod";
import { createRoleSchema } from "../../../../zodSchemas/createRoleSchema";
import { getServerSession } from "../../../../helpers/get-servesession";

export async function GET() {
  try {
    // Check session
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });
    if (fullUser?.role?.name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        users: true
      }
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {

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
    // get the body 
    const body = await request.json()
    // safeParse with the zod schema 
    const result = createRoleSchema.safeParse(body);


    if (!result.success) {
      return NextResponse.json(
        {
          error: "Only name and description are nedded and allowed"
        },
        { status: 400 }
      );
    }

    const { name, description } = result.data;


    const existing = await prisma.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ error: "Role name already exists" }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        name,
        description: description || "",
      },
      include: {
        permissions: true,
      },
    })

    if (!role) return NextResponse.json({ error: "Can't Crete role. Server Eroor" }, { status: 500 });
    return NextResponse.json({ success: `Role created successfully`, role }, { status: 200 })


  } catch (error) {
    return NextResponse.json({ error: "cann't added new role" }, { status: 500 })
  }
}
