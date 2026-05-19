import { Pin } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewNoticeDialog } from "@/components/admin/new-notice-dialog";
import { NoticeActions } from "@/components/admin/notice-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/types/database";

export const dynamic = "force-dynamic";

async function getNotices(): Promise<Notice[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(100);
    return (data as Notice[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function NoticesAdminPage() {
  const notices = await getNotices();

  return (
    <>
      <TopNav title="Notices" subtitle="Publish and manage school announcements" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Notices auto-archive when they expire, then delete after the retention window.
          </p>
          <NewNoticeDialog />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          {notices.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No notices yet. Publish your first to share with parents and students.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        {n.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                        {n.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{n.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{n.audience}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(n.published_at)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {n.expires_at ? formatDate(n.expires_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.archived_at ? "secondary" : "success"}>
                        {n.archived_at ? "Archived" : "Live"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <NoticeActions
                        id={n.id}
                        isArchived={Boolean(n.archived_at)}
                        isPinned={n.is_pinned}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </>
  );
}
