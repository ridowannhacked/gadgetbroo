/**
 * Runs a Prisma query and falls back to a default value instead of throwing.
 *
 * Why this exists: pages using `revalidate` (ISR) run their queries during
 * `next build` to prerender the page. If the DB is briefly unreachable at
 * build time (firewall blip, restart, network hiccup), that used to crash
 * the *entire* build — not just show stale/empty data for one section.
 * Wrapping build-time queries with this keeps the build resilient; ISR will
 * pick up real data again on the next revalidation once the DB is back.
 */
export async function safeQuery<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error("safeQuery: query failed, using fallback", error);
    return fallback;
  }
}
