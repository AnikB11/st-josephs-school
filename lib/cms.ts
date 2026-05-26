import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
 * Uses React's `cache()` for per-request deduplication. We deliberately avoid
 * `unstable_cache` here because the function reads cookies (via the server
 * Supabase client), which violates `unstable_cache`'s "pure function" contract
 * and makes `revalidateTag` invalidation unreliable. Each request hits the DB
 * once; subsequent calls within the same request are deduped.
 */
export const getCmsSection = cache(async function getCmsSection(
  key: string,
): Promise<CmsContent> {
  try {
    const supabase = await createSupabaseServerClient();
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
    const supabase = await createSupabaseServerClient();
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
