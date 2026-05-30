import { cache } from "react";
import { createSupabaseStaticClient } from "@/lib/supabase/static";

export type CmsContent = {
  title: string | null;
  body: string | null;
  image_url: string | null;
};

const EMPTY: CmsContent = { title: null, body: null, image_url: null };

/**
 * Fetch a single website_content section. Returns nulls if missing — callers
 * should provide their own fallback strings.
 *
 * Uses the **static (anon) Supabase client** — no cookies, no auth headers.
 * That's the load-bearing detail: a Server Component that reaches into
 * `cookies()` is forced into per-request dynamic rendering, defeating any
 * `revalidate` / ISR on the calling page. With the cookie-less client, the
 * call participates in Next's data cache and the page can be cached at the
 * edge between revalidations. RLS policy `wc_select_public` grants `select`
 * on `website_content` to `anon`, so this is the right access level.
 *
 * Per-request deduplication via React's `cache()` is still useful when one
 * render calls `getCmsSection` repeatedly for the same key.
 */
export const getCmsSection = cache(async function getCmsSection(
  key: string,
): Promise<CmsContent> {
  try {
    const supabase = createSupabaseStaticClient();
    const { data } = await supabase
      .from("website_content")
      .select("title,body,image_url")
      .eq("section_key", key)
      .maybeSingle();
    return (data as CmsContent | null) ?? { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
});

/**
 * Fetch many sections at once. Returns a map keyed by section_key.
 * Per-request cached — multiple calls with the same `keys` array reuse the result.
 */
export const getCmsSections = cache(async function getCmsSections(
  keys: string[],
): Promise<Record<string, CmsContent>> {
  const map: Record<string, CmsContent> = {};
  keys.forEach((k) => (map[k] = { ...EMPTY }));
  try {
    const supabase = createSupabaseStaticClient();
    const { data } = await supabase
      .from("website_content")
      .select("section_key,title,body,image_url")
      .in("section_key", keys);
    (
      (data as {
        section_key: string;
        title: string | null;
        body: string | null;
        image_url: string | null;
      }[] | null) ?? []
    ).forEach(
      (r) => (map[r.section_key] = { title: r.title, body: r.body, image_url: r.image_url }),
    );
  } catch {
    /* ignore */
  }
  return map;
});
