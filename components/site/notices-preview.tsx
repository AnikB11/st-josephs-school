import Link from "next/link";
import { ArrowRight, FileText, Megaphone, Pin } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/types/database";

async function fetchNotices(): Promise<Notice[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("notices")
      .select("id,title,slug,category,is_pinned,published_at,body,pdf_url")
      .is("archived_at", null)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(4);
    return (data as Notice[]) ?? [];
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

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {notices.slice(0, 3).map((n, i) => (
          <Reveal key={n.id} delay={i * 0.08}>
            <Link href={`/notices/${n.slug}`} className="group block h-full">
              <article className="h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.25)]">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={n.is_pinned ? "default" : "secondary"}
                    className={
                      n.is_pinned
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--ivory))]"
                        : ""
                    }
                  >
                    {n.is_pinned && <Pin className="mr-1 h-3 w-3" />}
                    {n.category}
                  </Badge>
                  <span className="text-xs text-[hsl(var(--ink-soft))]" suppressHydrationWarning>
                    {formatDate(n.published_at)}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold leading-snug text-[hsl(var(--ink))] group-hover:text-[hsl(var(--primary))]">
                  {n.title}
                </h3>
                {n.body && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                    {n.body}
                  </p>
                )}
                <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))]">
                  {n.pdf_url ? (
                    <>
                      <FileText className="h-3.5 w-3.5" /> Read PDF
                    </>
                  ) : (
                    <>
                      <Megaphone className="h-3.5 w-3.5" /> Read notice
                    </>
                  )}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </article>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
