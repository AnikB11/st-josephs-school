import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. Use ONLY in trusted server contexts
 * (API routes, server actions, cron jobs). Bypasses RLS.
 *
 * NOTE: We intentionally do not pass the `Database` generic here.
 * supabase-js's strict Database typing tends to fight hand-authored
 * types; the call sites cast their selected rows to concrete shapes
 * (`User`, `Notice`, etc) from `@/types/database` for safety.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
