// app/(main)/layout.tsx
import { getServerSession } from "@/helpers/get-servesession";
import { UserStoreHydrator } from "@/components/UserStoreHydrator";
import Navbar from "@/components/navbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const user = session?.user ?? null;

  return (
    <>
      <UserStoreHydrator user={user} />
      <Navbar />
      <main>{children}</main>
    </>
  );
}
