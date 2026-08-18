// app/(main)/layout.tsx — Server Component
import { getServerSession } from "@/helpers/get-servesession";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import { CartSync } from "@/components/storefront/CartSync";
import VisitorTracker from "@/components/storefront/VisitorTracker";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <AuthSessionProvider
      user={session?.user ?? null}
      session={session?.session ?? null}
    >
      <CartSync />
      <VisitorTracker />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </AuthSessionProvider>
  );
}
