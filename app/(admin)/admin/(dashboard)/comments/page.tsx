import prisma from "@/lib/prisma";
import AdminCommentsClient from "./AdminCommentsClient";
import { getServerSession } from "@/helpers/get-servesession";
import { redirect } from "next/navigation";

export default async function AdminCommentsPage() {
  const session = await getServerSession();
  
  // Authorization is generally handled by middleware/layout, but we fetch user role here too
  const fullUser = session?.user?.id ? await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: { include: { permissions: true } } }
  }) : null;

  if (!fullUser) redirect('/login');
  const isAdmin = fullUser.role?.name?.toLowerCase() === 'admin';
  const hasReviewsPermission = isAdmin || fullUser.role?.permissions.some(p => p.resource === 'Reviews' && p.canView);
  
  if (!hasReviewsPermission) {
    return <div className="p-8 text-foreground">You do not have permission to view this page.</div>;
  }

  const comments = await prisma.comment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <AdminCommentsClient initialComments={comments} />;
}
