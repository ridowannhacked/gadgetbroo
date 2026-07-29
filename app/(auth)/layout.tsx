import { ReactNode } from "react";
import { getServerSession } from "../../helpers/get-servesession";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: ReactNode }) {

  const session = await getServerSession()
  if (session?.user) redirect('/')

  return children;
}
