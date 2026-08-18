"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/helpers/get-servesession";
import { revalidatePath } from "next/cache";
import { addressSchema } from "@/zodSchemas/addressSchema";

export async function addAddress(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData.entries());
  const parsed = addressSchema.safeParse({
    ...data,
    isDefault: formData.get("isDefault") === "true"
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const addressCount = await prisma.address.count({
    where: { userId: session.user.id, isDeleted: false }
  });

  const isDefault = addressCount === 0 || parsed.data.isDefault;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDeleted: false },
      data: { isDefault: false }
    });
  }

  await prisma.address.create({
    data: {
      userId: session.user.id,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode || "",
      country: parsed.data.country,
      isDefault,
    }
  });

  revalidatePath("/dashboard/addresses");
  revalidatePath("/checkout");
}

export async function updateAddress(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData.entries());
  const parsed = addressSchema.safeParse({
    ...data,
    isDefault: formData.get("isDefault") === "true"
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id || existing.isDeleted) {
    throw new Error("Forbidden");
  }

  const isDefault = parsed.data.isDefault;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDeleted: false },
      data: { isDefault: false }
    });
  }

  await prisma.address.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode || "",
      country: parsed.data.country,
      isDefault: isDefault ? true : existing.isDefault,
    }
  });

  revalidatePath("/dashboard/addresses");
  revalidatePath("/checkout");
}

export async function deleteAddress(id: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id || existing.isDeleted) {
    throw new Error("Forbidden");
  }

  // SOFT DELETE: Prevents breaking Order history if user deletes their address
  await prisma.address.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), isDefault: false }
  });
  
  if (existing.isDefault) {
    const nextAddress = await prisma.address.findFirst({
      where: { userId: session.user.id, isDeleted: false },
      orderBy: { createdAt: "desc" }
    });
    if (nextAddress) {
      await prisma.address.update({
        where: { id: nextAddress.id },
        data: { isDefault: true }
      });
    }
  }

  revalidatePath("/dashboard/addresses");
  revalidatePath("/checkout");
}

export async function setDefaultAddress(id: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id || existing.isDeleted) {
    throw new Error("Forbidden");
  }

  await prisma.address.updateMany({
    where: { userId: session.user.id, isDeleted: false },
    data: { isDefault: false }
  });

  await prisma.address.update({
    where: { id },
    data: { isDefault: true }
  });

  revalidatePath("/dashboard/addresses");
  revalidatePath("/checkout");
}
