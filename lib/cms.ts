import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CmsContent = { title: string | null; body: string | null };

/**
 * Fetch a single website_content section. Returns nulls if missing — callers
 * should provide their own fallback strings.
 */
export const getCmsSection = unstable_cache(
  async (key: string): Promise<CmsContent> => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("website_content")
      .select("title,body")
      .eq("section_key", key)
      .maybeSingle();
    return (data as CmsContent | null) ?? { title: null, body: null };
  } catch {
    return { title: null, body: null };
  }
  },
  ["cms-section"],
  { revalidate: 3600, tags: ["cms"] }
);

import { unstable_cache } from "next/cache";

/**
 * Fetch many sections at once. Returns a map keyed by section_key.
 */
export const getCmsSections = unstable_cache(
  async (keys: string[]): Promise<Record<string, CmsContent>> => {
  const map: Record<string, CmsContent> = {};
  keys.forEach((k) => (map[k] = { title: null, body: null }));
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("website_content")
      .select("section_key,title,body")
      .in("section_key", keys);
    ((data as { section_key: string; title: string | null; body: string | null }[] | null) ?? []).forEach(
      (r) => (map[r.section_key] = { title: r.title, body: r.body }),
    );
  } catch {
    /* ignore */
  }
  return map;
  },
  ["cms-sections"],
  { revalidate: 3600, tags: ["cms"] }
);
