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
    // Use Better Auth's signup API which handles password hashing internally
    const createdUser = await auth.api.signUpEmail({
      body: {
        name: "Admin",
        email: "admin@gadgetbroo.com",
        password: "Admin@1234!",
      },
    });

    // Override the "customer" role (assigned by after hook) to admin
    if (createdUser?.user?.id) {
      await prisma.user.update({
        where: { id: createdUser.user.id },
        data: { roleId: adminRole.id },
      });
    }

    console.log("✓ Admin user seeded");
  } else {
    console.log("⚠ Admin already exists, skipping");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
