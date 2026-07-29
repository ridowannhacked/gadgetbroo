// prisma/seed.ts
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";


async function main() {
  // Step 1 — Create roles
  const customerRole = await prisma.role.upsert({
    where: { name: "customer" },
    update: {},
    create: { name: "customer", description: "Default role for registered users" },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Full system access" },
  });

  console.log("✓ Roles seeded:", customerRole.name, adminRole.name);

  // Step 2 — Create admin user
  const existing = await prisma.user.findUnique({
    where: { email: "admin@gadgetbroo.com" },
  });

  if (!existing) {
    const hashedPassword = await auth.api.hashPassword({
      password: "Admin@1234!",
    });

    const userId = crypto.randomUUID();

    await prisma.user.create({
      data: {
        id: userId,
        name: "Admin",
        email: "admin@gadgetbroo.com",
        emailVerified: true,
        roleId: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: "admin@gadgetbroo.com",
        providerId: "email",
        userId: userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("✓ Admin user seeded");
  } else {
    console.log("⚠ Admin already exists, skipping");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
