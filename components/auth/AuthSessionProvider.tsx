'use client';

/**
 * AuthSessionProvider
 *
 * Big Tech RSC → Client pattern:
 * - The server layout fetches the session ONCE via getServerSession() (React `cache`)
 * - It passes `user`, `session`, and `fullUser` (with role + permissions) as plain props
 * - Any client component calls `useAuthSession()` for immediate, zero-flicker data
 *
 * Why NOT Zustand for auth:
 * - Zustand starts as `null` on the client, causing a 400ms+ hydration flicker
 * - If a Better Auth cookie expires, Zustand never knows → stale UI shown to revoked sessions
 * - This pattern: server renders correct HTML, client receives the same value instantly
 */

import React, { createContext, useContext } from 'react';
import type { Session, User } from '@/lib/auth';
import type { Permission } from '@/lib/types';

// ── Shape of a role with its permissions (matches Prisma include) ────────────
export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: Permission[];
}

// ── Shape of the enriched user from the server layout ────────────────────────
export interface FullUserInContext {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  roleId?: string | null;
  role: RoleWithPermissions | null;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  /** Full user record with role.permissions — populated by admin layout only */
  fullUser: FullUserInContext | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  fullUser: null,
});

export function AuthSessionProvider({
  children,
  user,
  session,
  fullUser = null,
}: {
  children: React.ReactNode;
  user: User | null;
  session: Session | null;
  fullUser?: FullUserInContext | null;
}) {
  return (
    <AuthContext.Provider value={{ user, session, fullUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthSession
 *
 * Drop-in replacement for `useUserStore` in any client component.
 *
 * Usage:
 *   const { user } = useAuthSession();
 *   const { fullUser } = useAuthSession();
 *   // fullUser.role.permissions contains the RBAC data for sidebar filtering
 */
export const useAuthSession = () => useContext(AuthContext);

// ── Permission helper — safe to call in any client component ─────────────────
/**
 * hasPermission(permissions, resource, action)
 *
 * Checks whether the given permissions array grants access to a resource.
 *
 * Example:
 *   const { fullUser } = useAuthSession();
 *   if (!hasPermission(fullUser?.role?.permissions, 'Products', 'canView')) return null;
 */
export function hasPermission(
  permissions: Permission[] | null | undefined,
  resource: string,
  action: keyof Pick<Permission, 'canView' | 'canCreate' | 'canUpdate' | 'canDelete'>
): boolean {
  if (!permissions) return false;
  return permissions.some((p) => p.resource === resource && p[action] === true);
}
