import { TopNav } from "@/components/dashboard/topnav";
import { CmsDashboardClient } from "@/components/admin/cms-dashboard-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ALL_IMAGE_KEYS } from "@/lib/cms-images";

export const dynamic = "force-dynamic";

type CmsRow = {
  section_key: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
};

const TEXT_SECTION_KEYS = [
  "hero_headline",
  "principal_message",
  "about_intro",
  "academics_intro",
  "admissions_intro",
  "contact_intro",
  "gallery_intro",
  "notices_intro",
  "footer_social_facebook",
  "footer_social_instagram",
  "footer_social_youtube",
  "whatsapp_number",
  "whatsapp_message",
];

const SECTION_KEYS = [...TEXT_SECTION_KEYS, ...ALL_IMAGE_KEYS];

async function getAll(): Promise<Record<string, CmsRow>> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("website_content")
      .select("section_key,title,body,image_url")
      .in("section_key", SECTION_KEYS);
    const map: Record<string, CmsRow> = {};
    ((data as CmsRow[] | null) ?? []).forEach((r) => (map[r.section_key] = r));
    return map;
  } catch {
    return {};
  }
}

export default async function CmsPage() {
  const map = await getAll();

  return (
    <>
      <TopNav title="Website CMS" subtitle="Edit copy and images on the public website" />
      <div className="space-y-6 px-6 py-8">
        <CmsDashboardClient initialData={map} />
      </div>
    </>
  );
}
