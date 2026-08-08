// app/(main)/layout.tsx — Server Component
import { getServerSession } from "@/helpers/get-servesession";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import Navbar from "@/components/navbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <AuthSessionProvider
      user={session?.user ?? null}
      session={session?.session ?? null}
    >
      <Navbar />
      <main>{children}</main>
    </AuthSessionProvider>
  );
}
