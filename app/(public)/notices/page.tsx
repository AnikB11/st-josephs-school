import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/motion/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/types/database";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Notices",
  description: "Announcements, academic notices, and events from the school office.",
};

export const revalidate = 60;

const PAGE_SIZE = 20;

async function fetchNotices(page: number): Promise<{ notices: Notice[]; total: number }> {
  try {
    const supabase = createSupabaseStaticClient();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from("notices")
      .select("id,title,slug,category,audience,is_pinned,published_at,body", { count: "exact" })
      .is("archived_at", null)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .range(from, to);

    return {
      notices: (data as Notice[] | null) ?? [],
      total: count ?? 0,
    };
  } catch {
    return { notices: [], total: 0 };
  }
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const [{ notices, total }, cms] = await Promise.all([
    fetchNotices(currentPage),
    getCmsSections(["notices_hero_image"]),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const HERO_IMG = resolveImage("notices_hero_image", cms.notices_hero_image);

  return (
    <>
      <PageHero
        eyebrow="Notices"
        title="School announcements."
        description="Academic, administrative, and event notices — pinned items appear first."
        image={HERO_IMG}
      />

      <section className="container-wide py-24 sm:py-32">
        <div className="space-y-3">
          {notices.length === 0 ? (
            <Reveal>
              <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-16 text-center">
                <FileText className="mx-auto h-10 w-10 text-[hsl(var(--ink-soft))]/40" />
                <p className="mt-5 text-sm text-[hsl(var(--ink-soft))]">
                  No notices have been published yet. Check back soon.
                </p>
              </div>
            </Reveal>
          ) : (
            notices.map((n, i) => (
              <Reveal key={n.id} delay={(i % 6) * 0.04}>
                <Link
                  href={`/notices/${n.slug}`}
                  className="group flex flex-col gap-3 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6 transition-all hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {n.is_pinned && (
                          <Badge
                            variant="default"
                            className="bg-[hsl(var(--primary))] text-[hsl(var(--ivory))]"
                          >
                            <Pin className="mr-1 h-3 w-3" />
                            Pinned
                          </Badge>
                        )}
                        <Badge variant="secondary">{n.category}</Badge>
                        <Badge variant="outline">{n.audience}</Badge>
                      </div>
                      <h3 className="font-display mt-3 text-lg font-semibold text-[hsl(var(--ink))] group-hover:text-[hsl(var(--primary))]">
                        {n.title}
                      </h3>
                      {n.body && (
                        <p className="mt-1 line-clamp-1 text-sm text-[hsl(var(--ink-soft))]">
                          {n.body}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[hsl(var(--ink-soft))]">
                    {formatDate(n.published_at)}
                  </span>
                </Link>
              </Reveal>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {currentPage > 1 ? (
              <Link href={`/notices?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm" className="rounded-full">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="rounded-full">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
            )}
            <span className="px-3 text-sm text-[hsl(var(--ink-soft))]">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link href={`/notices?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm" className="rounded-full">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="rounded-full">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
