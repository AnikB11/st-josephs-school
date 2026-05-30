import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a static-safe Supabase client for Server Components.
 * Because it doesn't read cookies or authentication headers,
 * it is safe to use in static generation and ISR pages without
 * forcing dynamic rendering at request time.
 *
 * Memoized per Node instance (the client is stateless and just wraps an
 * HTTP fetcher — see lib/supabase/admin.ts for the connection-pool note).
 */

let cached: SupabaseClient | null = null;

export function createSupabaseStaticClient(): SupabaseClient {
  if (cached) return cached;
  if (!URL || !ANON) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables");
  }
  cached = createClient(URL, ANON, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
