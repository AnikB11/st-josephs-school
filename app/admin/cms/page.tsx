import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CmsSectionForm } from "@/components/admin/cms-section-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CmsRow = { section_key: string; title: string | null; body: string | null };

const SECTIONS: { key: string; title: string; placeholder?: string }[] = [
  { key: "hero_headline", title: "Hero headline", placeholder: "Where tradition meets tomorrow." },
  {
    key: "principal_message",
    title: "Principal's message",
    placeholder: "A short note from the principal…",
  },
  { key: "about_intro", title: "About — introduction", placeholder: "Our story in 2–3 sentences." },
];

async function getAll(): Promise<Record<string, CmsRow>> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("website_content")
      .select("section_key,title,body")
      .in(
        "section_key",
        SECTIONS.map((s) => s.key),
      );
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
      <TopNav title="Website CMS" subtitle="Edit copy that appears on the public website" />
      <div className="space-y-6 px-6 py-8">
        {SECTIONS.map((s) => {
          const row = map[s.key];
          return (
            <Card key={s.key}>
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription className="font-mono text-xs">
                  section_key: {s.key}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CmsSectionForm
                  sectionKey={s.key}
                  initialTitle={row?.title ?? ""}
                  initialBody={row?.body ?? ""}
                  placeholder={s.placeholder}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
