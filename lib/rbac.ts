import { headers } from "next/headers";
import { auth } from "./auth";
import prisma from "./prisma";

export type PermissionAction = "canView" | "canCreate" | "canUpdate" | "canDelete";

export async function checkPermission(resource: string, action: PermissionAction) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: { include: { permissions: true } } },
  });
  
  // Super admin always has access
  if (user?.role?.name?.toLowerCase() === "admin") return session;
  
  // Check granular permission
  const hasPerm = user?.role?.permissions.some(
    (p) => p.resource === resource && p[action] === true
  );
  
  return hasPerm ? session : null;
}

/**
 * Validates that the current user is at least an Admin.
 * Returns the session if true, null if false.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (user?.role?.name?.toLowerCase() === "admin") return session;
  return null;
}
