// app/(admin)/admin/layout.tsx — Server Component, handles auth
import { getServerSession } from '@/helpers/get-servesession';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import AdminLayoutClient from '../../../components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/sign-in');

  const fullUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: { permissions: true }, // ← include permissions for sidebar filtering
      },
    },
  });

  // ISSUE 6.2 FIX: Only require ANY assigned role to enter the shell.
  // Moderators, editors, etc. all pass here.
  // Individual pages / API routes enforce granular permissions themselves.
  if (!fullUser?.role) redirect('/forbidden');

  return (
    <AuthSessionProvider
      user={session.user}
      session={session.session}
      fullUser={fullUser}          // carries role + permissions for sidebar
    >
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AuthSessionProvider>
  );
}
