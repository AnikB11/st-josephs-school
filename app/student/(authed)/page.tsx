import Link from "next/link";
import {
  ClipboardCheck,
  FileBarChart,
  Megaphone,
  BookOpen,
  Calendar,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getStudentForCurrentUser } from "@/lib/student";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type NoticeRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  published_at: string;
};

async function getAttendanceSummary(studentId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const { data } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId)
      .gte("date", firstOfMonth);

    const rows = data ?? [];
    const present = rows.filter((r: { status: string }) => r.status === "present" || r.status === "late").length;
    const total = rows.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent: total - present, total, rate };
  } catch {
    return { present: 0, absent: 0, total: 0, rate: 0 };
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
    if (data && data.length > 0) {
      const row = data[0] as unknown as { exams: { name: string } | null };
      return row.exams?.name ?? "—";
    }
    return "—";
  } catch {
    return "—";
  }
}

async function getRecentNotices(): Promise<NoticeRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("notices")
      .select("id,title,slug,category,published_at")
      .is("archived_at", null)
      .in("audience", ["all", "students"])
      .order("published_at", { ascending: false })
      .limit(5);
    return (data as NoticeRow[] | null) ?? [];
  } catch {
    return [];
  }
}

async function getUpcomingEvents() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("events")
      .select("id,title,starts_at,location")
      .eq("is_published", true)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function StudentDashboardPage() {
  const student = await getStudentForCurrentUser();

  const [attendance, latestExam, notices, events] = await Promise.all([
    student ? getAttendanceSummary(student.id) : Promise.resolve(null),
    student ? getLatestExamName(student.id) : Promise.resolve("—"),
    getRecentNotices(),
    getUpcomingEvents(),
  ]);

  const firstName = student?.full_name?.split(" ")[0] ?? "Student";

  return (
    <>
      <TopNav title={`Hello, ${firstName}`} subtitle="Here's what's happening at school" />
      <div className="space-y-8 px-6 py-8">
        {/* Student info card */}
        {student && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-start">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary font-display text-xl">
                  {initials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  {student.full_name}
                </h2>
                <p className="mt-0.5 font-mono text-sm text-slate-500">
                  {student.admission_number}
                  {student.roll_number && ` · Roll ${student.roll_number}`}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {student.classes && (
                    <Badge variant="secondary">
                      Class {student.classes.grade}-{student.classes.section}
                    </Badge>
                  )}
                  <Badge variant={student.status === "active" ? "success" : "outline"}>
                    {student.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!student && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              We couldn't find a student record linked to your account. Please contact the school office.
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {student && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Attendance · this month"
              value={`${attendance?.rate ?? 0}%`}
              icon={ClipboardCheck}
              delta={{
                value: `${attendance?.present ?? 0}/${attendance?.total ?? 0} days`,
                positive: (attendance?.rate ?? 0) >= 75,
              }}
            />
            <StatCard
              label="Latest result"
              value={latestExam !== "—" ? "Published" : "Pending"}
              icon={FileBarChart}
              hint={latestExam}
            />
            <StatCard
              label="New notices"
              value={notices.length}
              icon={Megaphone}
              hint="Targeted to students"
            />
          </div>
        )}

        {/* Two-column: notices + events */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Notices */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recent notices
              </h2>
              <Link href="/student/notices" prefetch className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {notices.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No notices right now. Check back later.
                </p>
              ) : (
                notices.map((n) => (
                  <Link
                    key={n.id}
                    href={`/notices/${n.slug}`}
                    prefetch
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{n.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{n.category}</Badge>
                      <span className="hidden text-xs text-slate-500 sm:inline">
                        {formatDate(n.published_at)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Upcoming events
            </h2>
            <ul className="mt-4 space-y-3">
              {events.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No upcoming events.
                </p>
              ) : (
                events.map((e: { id: string; title: string; starts_at: string; location: string | null }) => (
                  <li
                    key={e.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
                  >
                    <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{e.title}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(e.starts_at)}
                        {e.location && ` · ${e.location}`}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        {/* Quick links */}
        {student && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick links</CardTitle>
              <CardDescription>Jump to the section you need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { href: "/student/attendance", label: "My Attendance", icon: ClipboardCheck },
                  { href: "/student/results", label: "My Results", icon: FileBarChart },
                  { href: "/student/notices", label: "Notices", icon: Megaphone },
                  { href: "/student/profile", label: "My Profile", icon: BookOpen },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <link.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-slate-700">{link.label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
