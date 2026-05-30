import Link from "next/link";
import { FileText } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type NoticeListItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_pinned: boolean;
  published_at: string;
  pdf_url: string | null;
};

async function getNotices() {
  try {
    const supabase = await createSupabaseServerClient();
    // List view doesn't need the body text — that's only loaded on
    // /notices/[slug]. Skipping it keeps the payload tiny when there
    // are dozens of long notices.
    const { data } = await supabase
      .from("notices")
      .select("id,title,slug,category,is_pinned,published_at,pdf_url")
      .is("archived_at", null)
      .in("audience", ["all", "students"])
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(100);
    return (data as NoticeListItem[]) ?? [];
  } catch {
    return [];
  }
}

export default async function StudentNoticesPage() {
  const notices = await getNotices();

  return (
    <>
      <TopNav title="Notices" subtitle="Announcements relevant to students" />
      <div className="space-y-3 px-6 py-8">
        {notices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No notices for students right now. New announcements will appear here.
          </div>
        ) : (
          notices.map((n) => (
            <Link
              key={n.id}
              href={`/notices/${n.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 transition-colors hover:border-primary/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{n.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{n.category}</Badge>
                  {n.is_pinned && <Badge variant="default">Pinned</Badge>}
                  <span className="text-xs text-slate-500">{formatDate(n.published_at)}</span>
                </div>
              </div>
              {n.pdf_url && (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  PDF
                </Badge>
              )}
            </Link>
          ))
        )}
      </div>
    </>
  );
}
