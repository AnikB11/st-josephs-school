import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieSet = { name: string; value: string; options?: CookieOptions };

/**
 * Server-side Supabase client.
 *
 * Reads the Supabase Auth session from Next's cookie store so RLS sees
 * the calling user. When no session is present, requests hit Supabase
 * with the anon role (also the safe default during build / static
 * analysis).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: CookieSet[]) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Calling set from a Server Component is fine to ignore.
          }
        },
      },
    },
  );
}
