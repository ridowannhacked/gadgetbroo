import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { getServerSession } from "../../../helpers/get-servesession";
import prisma from "../../../lib/prisma";
import DashboardProfileUI from "./DashboardProfileUI";

export const metadata: Metadata = {
  title: "My Profile - GadgetBroo",
};

export default async function DashboardPage() {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) unauthorized();

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });

  if (!fullUser) return <p>User not found</p>;

  return <DashboardProfileUI fullUser={fullUser} />;
}
