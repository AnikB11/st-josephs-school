import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { NoticesSlider, type NoticeCard } from "@/components/site/notices-slider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function fetchNotices(): Promise<NoticeCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("notices")
      .select("id,title,slug,category,is_pinned,published_at,body,pdf_url")
      .is("archived_at", null)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(20);
    return (data as NoticeCard[]) ?? [];
  } catch {
    return [];
  }
}

export async function NoticesPreview() {
  const notices = await fetchNotices();
  if (notices.length === 0) return null;

  return (
    <section className="container-wide py-24 sm:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Notices"
          title="What's happening on campus"
          description="Stay current with academic notices, events, and important announcements."
        />
        <Link href="/notices">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <NoticesSlider notices={notices} />
    </section>
  );
}
