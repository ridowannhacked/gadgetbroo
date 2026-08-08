/**
 * @deprecated useUserStore is DEPRECATED as of Phase 2 refactor.
 *
 * ❌ DO NOT use this store for authentication state.
 *
 * Auth state is now managed via the RSC → Client React Context pattern:
 *   import { useAuthSession } from '@/components/auth/AuthSessionProvider';
 *   const { user, session } = useAuthSession();
 *
 * Why this was deprecated:
 * - Caused ~400ms hydration flicker (Zustand initialises as `null` on the client)
 * - Created state desync when Better Auth cookies expired or were revoked by admin
 * - The server already has the source of truth — no reason to re-sync it client-side
 *
 * Zustand is still used for TRANSIENT CLIENT-ONLY UI state:
 *   - Shopping cart items:  lib/stores/useCartStore.ts ✅
 *   - Mobile nav drawer:   managed locally in AdminLayoutClient.tsx ✅
 */

// This file intentionally exports nothing. Delete it once all consumers are migrated.
export {};
