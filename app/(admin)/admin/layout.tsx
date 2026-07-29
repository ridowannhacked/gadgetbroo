import { getServerSession } from "@/helpers/get-servesession";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) redirect("/sign-in");

  const fullUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!fullUser?.role || fullUser.role.name !== "admin") redirect("/");

  return <>{children}</>;
}
