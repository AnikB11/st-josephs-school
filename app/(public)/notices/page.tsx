import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Pin } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/types/database";

export const metadata: Metadata = {
  title: "Notices",
  description: "Announcements, academic notices, and events from the school office.",
};

async function fetchNotices(): Promise<Notice[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("notices")
      .select("*")
      .is("archived_at", null)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false });
    return (data as Notice[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function NoticesPage() {
  const notices = await fetchNotices();

  return (
    <section className="container-wide py-20 sm:py-28">
      <SectionHeading
        eyebrow="Notices"
        title="School announcements."
        description="Academic, administrative, and event notices — pinned items appear first."
      />

      <div className="mt-12 space-y-3">
        {notices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-4 text-sm text-slate-600">
              No notices have been published yet. Check back soon.
            </p>
          </div>
        ) : (
          notices.map((n) => (
            <Link
              key={n.id}
              href={`/notices/${n.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 transition-all hover:border-primary/40 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {n.is_pinned && (
                      <Badge variant="default">
                        <Pin className="mr-1 h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                    <Badge variant="secondary">{n.category}</Badge>
                    <Badge variant="outline">{n.audience}</Badge>
                  </div>
                  <h3 className="font-display mt-2 text-base font-semibold text-slate-900 group-hover:text-primary">
                    {n.title}
                  </h3>
                  {n.body && (
                    <p className="mt-1 line-clamp-1 text-sm text-slate-600">{n.body}</p>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-500">{formatDate(n.published_at)}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
