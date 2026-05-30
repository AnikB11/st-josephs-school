import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. Use ONLY in trusted server contexts
 * (API routes, server actions, cron jobs). Bypasses RLS.
 *
 * --- Why no connection pool ---
 * supabase-js doesn't hold a Postgres TCP connection — every call is an
 * HTTP request to PostgREST. Pooling lives on Supabase's side (pgbouncer
 * in transaction mode). Node's keep-alive handles connection reuse to
 * PostgREST. There is therefore nothing to "pool" client-side; what we
 * memoize below is just the JS client *object* so we don't reallocate it
 * per request under load. If anyone ever introduces direct `pg`/`postgres`
 * connections in the future (e.g. for a raw-SQL job), they must NOT use
 * them in middleware/edge runtimes and must respect Supabase's connection
 * cap (60 on the free tier; use port 6543 / pgbouncer transaction mode).
 *
 * NOTE: We intentionally do not pass the `Database` generic here.
 * supabase-js's strict Database typing tends to fight hand-authored
 * types; the call sites cast their selected rows to concrete shapes
 * (`User`, `Notice`, etc) from `@/types/database` for safety.
 */

let cached: SupabaseClient | null = null;

export function createSupabaseAdminClient(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  return cached;
}
