import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/types/database";

async function getNotice(slug: string): Promise<Notice | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notices")
    .select("*")
    .eq("slug", slug)
    .is("archived_at", null)
    .maybeSingle();
  return (data as Notice | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const notice = await getNotice(slug);
  if (!notice) return { title: "Notice" };
  return {
    title: notice.title,
    description: notice.body?.slice(0, 160) ?? undefined,
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const notice = await getNotice(slug);
  if (!notice) notFound();

  return (
    <section className="container-wide py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/notices"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> All notices
        </Link>

        <article className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {notice.is_pinned && (
              <Badge variant="default">
                <Pin className="mr-1 h-3 w-3" /> Pinned
              </Badge>
            )}
            <Badge variant="secondary">{notice.category}</Badge>
            <Badge variant="outline">For {notice.audience}</Badge>
            <span className="text-xs text-slate-500">
              {formatDate(notice.published_at)}
            </span>
          </div>

          <h1 className="heading mt-5 text-balance text-3xl font-semibold sm:text-4xl">
            {notice.title}
          </h1>

          {notice.body && (
            <div className="lead mt-6 whitespace-pre-wrap text-base leading-relaxed">
              {notice.body}
            </div>
          )}

          {notice.pdf_url && (
            <a
              href={notice.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex"
            >
              <Button variant="outline" size="lg">
                <FileText className="h-4 w-4" /> Open attachment
              </Button>
            </a>
          )}

          {notice.expires_at && (
            <p className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              This notice expires on {formatDate(notice.expires_at)}.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
