import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "../../helpers/get-servesession";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: ReactNode }) {

  const session = await getServerSession()
  if (session?.user) redirect('/')

  return (
    <div className="relative min-h-screen bg-[#0b0f19]">
      <header className="absolute top-0 left-0 w-full p-6 z-50">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-bold tracking-wider text-white">
            G<span className="hidden sm:inline">ADGET</span>
            <span className="text-blue-500">B<span className="hidden sm:inline">ROO</span></span>
          </h1>
        </Link>
      </header>
      {children}
    </div>
  );
}
