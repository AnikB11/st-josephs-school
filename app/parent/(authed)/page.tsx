import { ClipboardCheck, FileBarChart, Megaphone, RefreshCw } from "lucide-react";
import Link from "next/link";
import { TopNav } from "@/components/dashboard/topnav";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { getStudentForCurrentUser } from "@/lib/student";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function getMonthAttendanceRate(studentId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const { data } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId)
      .gte("date", firstOfMonth);
    const rows = data ?? [];
    const present = rows.filter((r: { status: string }) => r.status === "present" || r.status === "late").length;
    return rows.length ? Math.round((present / rows.length) * 100) : 0;
  } catch {
    return 0;
  }
}

async function getLatestExamName(studentId: string): Promise<string> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("results")
      .select("exams(name)")
      .eq("student_id", studentId)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1);
    const row = data?.[0] as unknown as { exams: { name: string } | null } | undefined;
    return row?.exams?.name ?? "—";
  } catch {
    return "—";
  }
}

async function getRecentNoticeCount(): Promise<number> {
  try {
    const supabase = createSupabaseAdminClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("notices")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null)
      .in("audience", ["all", "parents"])
      .gte("published_at", sevenDaysAgo);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function ParentDashboardPage() {
  const student = await getStudentForCurrentUser();

  if (!student) {
    return (
      <>
        <TopNav title="Parent portal" subtitle="Sign in to see your child's activity" />
        <div className="px-6 py-8">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            We couldn't find an active student for this session. Please sign in again.
          </div>
        </div>
      </>
    );
  }

  const [attendanceRate, latestExam, noticeCount] = await Promise.all([
    getMonthAttendanceRate(student.id),
    getLatestExamName(student.id),
    getRecentNoticeCount(),
  ]);

  return (
    <>
      <TopNav
        title={`Hello, parent`}
        subtitle={`Viewing ${student.full_name} · ${student.admission_number}`}
      />
      <div className="space-y-8 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Attendance · this month"
            value={`${attendanceRate}%`}
            icon={ClipboardCheck}
            delta={{ value: attendanceRate >= 75 ? "On track" : "Below target", positive: attendanceRate >= 75 }}
          />
          <StatCard
            label="Latest result"
            value={latestExam !== "—" ? "Published" : "Pending"}
            icon={FileBarChart}
            hint={latestExam}
          />
          <StatCard
            label="New notices · 7 days"
            value={noticeCount}
            icon={Megaphone}
            hint="Targeted to parents"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Currently viewing</CardTitle>
                <CardDescription>One child per sign-in.</CardDescription>
              </div>
              <Link
                href="/parent/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Switch student
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-display">
                  {initials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-slate-900">{student.full_name}</p>
                <p className="font-mono text-xs text-slate-500">{student.admission_number}</p>
              </div>
              <Badge variant={student.status === "active" ? "success" : "secondary"} className="ml-auto">
                {student.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
