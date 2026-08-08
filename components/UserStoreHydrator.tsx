/**
 * @deprecated UserStoreHydrator is DEPRECATED as of Phase 2 refactor.
 *
 * This component used `useEffect` to sync server session data into Zustand,
 * causing hydration flicker and state desync on session expiry.
 *
 * It is no longer mounted in any layout. Replaced by:
 *   components/auth/AuthSessionProvider.tsx  (RSC → Client React Context)
 *
 * Safe to delete this file once confirmed no lingering imports exist.
 */

export {};
