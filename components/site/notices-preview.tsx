import Link from "next/link";
import { ArrowRight, FileText, Megaphone, Pin } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/types/database";

async function fetchNotices(): Promise<Notice[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("notices")
      .select("*")
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
    <section className="container-wide py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Notices"
          title="What's happening on campus"
          description="Stay current with academic notices, events, and important announcements."
        />
        <Link href="/notices">
          <Button variant="outline" size="sm">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notices.slice(0, 3).map((n) => (
          <Link key={n.id} href={`/notices/${n.slug}`} className="group">
            <article className="h-full rounded-2xl border border-slate-200/70 bg-white p-6 transition-all hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
              <div className="flex items-center gap-2">
                <Badge variant={n.is_pinned ? "default" : "secondary"}>
                  {n.is_pinned && <Pin className="mr-1 h-3 w-3" />}
                  {n.category}
                </Badge>
                <span className="text-xs text-slate-500">
                  {formatDate(n.published_at)}
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold leading-snug text-slate-900 group-hover:text-primary">
                {n.title}
              </h3>
              {n.body && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{n.body}</p>
              )}
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-primary">
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
        ))}
      </div>
    </section>
  );
}
