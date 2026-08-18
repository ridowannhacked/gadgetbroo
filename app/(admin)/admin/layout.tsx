// app/(admin)/admin/layout.tsx — Server Component, handles auth
import { getServerSession } from '@/helpers/get-servesession';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import AdminLayoutClient from '../../../components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/');

  const fullUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: { permissions: true }, // ← include permissions for sidebar filtering
      },
    },
  });

  // Check if user has ANY permissions before allowing access to the shell
  let hasAdminAccess = false;
  if (fullUser?.role) {
    if (fullUser.role.name.toLowerCase() === "admin") {
      hasAdminAccess = true;
    } else if (fullUser.role.permissions) {
      hasAdminAccess = fullUser.role.permissions.some(
        (p) => p.canView || p.canCreate || p.canUpdate || p.canDelete
      );
    }
  }

  if (!hasAdminAccess) redirect('/');

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
