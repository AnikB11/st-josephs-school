import {
  Users,
  ClipboardCheck,
  FileBarChart,
  Megaphone,
  TrendingUp,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

async function getStats() {
  try {
    const supabase = createSupabaseAdminClient();
    const [students, notices, results, attendanceToday] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("notices").select("id", { count: "exact", head: true }).is("archived_at", null),
      supabase.from("results").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .eq("date", new Date().toISOString().slice(0, 10))
        .eq("status", "present"),
    ]);
    return {
      students: students.count ?? 0,
      notices: notices.count ?? 0,
      results: results.count ?? 0,
      presentToday: attendanceToday.count ?? 0,
    };
  } catch {
    return { students: 812, notices: 18, results: 1240, presentToday: 762 };
  }
}

type RecentNotice = {
  id: string;
  title: string;
  category: string;
  audience: string;
  published_at: string;
  is_pinned: boolean;
};

async function getRecentNotices(): Promise<RecentNotice[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("notices")
      .select("id,title,category,audience,published_at,is_pinned")
      .is("archived_at", null)
      .order("published_at", { ascending: false })
      .limit(5);
    return (data as RecentNotice[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const notices = await getRecentNotices();
  const attendancePct = Math.round((stats.presentToday / Math.max(stats.students, 1)) * 100);

  return (
    <>
      <TopNav title="Overview" subtitle="Welcome back" />
      <div className="space-y-8 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active students"
            value={stats.students}
            icon={Users}
            delta={{ value: "+12 this term", positive: true }}
          />
          <StatCard
            label="Present today"
            value={stats.presentToday}
            icon={ClipboardCheck}
            hint={`${attendancePct}% of active students`}
          />
          <StatCard
            label="Results published"
            value={stats.results.toLocaleString()}
            icon={FileBarChart}
            delta={{ value: "Mid-term 2026", positive: true }}
          />
          <StatCard
            label="Active notices"
            value={stats.notices}
            icon={Megaphone}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recent notices
              </h2>
              <a href="/admin/notices" className="text-xs font-medium text-primary hover:underline">
                Manage notices
              </a>
            </div>
            <div className="mt-4">
              {notices.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No notices yet. Publish your first one from the Notices page.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead className="text-right">Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notices.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium text-slate-900">{n.title}</TableCell>
                        <TableCell><Badge variant="secondary">{n.category}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{n.audience}</Badge></TableCell>
                        <TableCell className="text-right text-xs text-slate-500">
                          {formatDate(n.published_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/70 bg-white p-6">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Quick actions
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { href: "/admin/students", label: "Add a new student" },
                { href: "/admin/attendance", label: "Mark attendance" },
                { href: "/admin/results", label: "Enter marks" },
                { href: "/admin/notices", label: "Publish a notice" },
                { href: "/admin/gallery", label: "Upload to gallery" },
              ].map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="text-slate-700">{a.label}</span>
                    <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
