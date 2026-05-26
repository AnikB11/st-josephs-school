import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStudentForCurrentUser } from "@/lib/student";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AttendanceRow = { date: string; status: string };

async function getMonthAttendance(studentId: string): Promise<AttendanceRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const { data } = await supabase
      .from("attendance")
      .select("date,status")
      .eq("student_id", studentId)
      .gte("date", firstOfMonth)
      .order("date", { ascending: true });
    return (data as AttendanceRow[] | null) ?? [];
  } catch {
    return [];
  }
}

async function getYearAttendance(studentId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
    const { data } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId)
      .gte("date", startOfYear);

    const rows = data ?? [];
    const present = rows.filter((r: { status: string }) => r.status === "present" || r.status === "late").length;
    const absent = rows.filter((r: { status: string }) => r.status === "absent").length;
    const excused = rows.filter((r: { status: string }) => r.status === "excused").length;
    const total = rows.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, excused, total, rate };
  } catch {
    return { present: 0, absent: 0, excused: 0, total: 0, rate: 0 };
  }
}

function summarize(rows: AttendanceRow[]) {
  const acc = { present: 0, absent: 0, late: 0, excused: 0 };
  rows.forEach((r) => {
    if (r.status in acc) acc[r.status as keyof typeof acc]++;
  });
  const total = rows.length;
  const rate = total > 0 ? Math.round(((acc.present + acc.late) / total) * 100) : 0;
  return { ...acc, total, rate };
}

const STATUS_COLOR: Record<string, string> = {
  present: "bg-emerald/10 text-emerald",
  absent: "bg-red-100 text-red-600",
  late: "bg-amber-100 text-amber-700",
  excused: "bg-slate-100 text-slate-600",
};

export default async function StudentAttendancePage() {
  const student = await getStudentForCurrentUser();

  if (!student) {
    return (
      <>
        <TopNav title="Attendance" subtitle="Your monthly attendance" />
        <div className="px-6 py-8">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No student record found for your account. Please contact the school office.
          </div>
        </div>
      </>
    );
  }

  const [rows, yearStats] = await Promise.all([
    getMonthAttendance(student.id),
    getYearAttendance(student.id),
  ]);
  const sum = summarize(rows);
  const byDate: Record<string, string> = {};
  rows.forEach((r) => (byDate[r.date] = r.status));

  const today = new Date();
  const month = today.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <>
      <TopNav title="Attendance" subtitle={`${month} · ${student.full_name}`} />
      <div className="space-y-8 px-6 py-8">
        {/* Student info */}
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              {student.full_name}
            </h2>
            <p className="font-mono text-xs text-slate-500">
              {student.admission_number}
              {student.classes && ` · Class ${student.classes.grade}-${student.classes.section}`}
            </p>
          </div>
          <Badge variant={sum.rate >= 75 ? "success" : "warning"}>{sum.rate}% this month</Badge>
        </div>

        {/* Year summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-to-date summary</CardTitle>
            <CardDescription>{yearStats.total} days marked in {today.getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-emerald/5 p-4">
                <p className="text-xs text-slate-500">Present</p>
                <p className="font-display text-2xl font-semibold text-emerald">{yearStats.present}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-slate-500">Absent</p>
                <p className="font-display text-2xl font-semibold text-red-500">{yearStats.absent}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs text-slate-500">Excused</p>
                <p className="font-display text-2xl font-semibold text-amber-600">{yearStats.excused}</p>
              </div>
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs text-slate-500">Overall rate</p>
                <p className="font-display text-2xl font-semibold text-primary">{yearStats.rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This month</CardTitle>
            <CardDescription>
              {sum.total} marked day{sum.total === 1 ? "" : "s"} — {sum.present} present, {sum.absent} absent
              {sum.late > 0 && `, ${sum.late} late`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald/5 p-4">
              <p className="text-xs text-slate-500">Present</p>
              <p className="font-display text-2xl font-semibold text-emerald">{sum.present}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-slate-500">Absent</p>
              <p className="font-display text-2xl font-semibold text-red-500">{sum.absent}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs text-slate-500">Late</p>
              <p className="font-display text-2xl font-semibold text-amber-600">{sum.late}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Excused</p>
              <p className="font-display text-2xl font-semibold text-slate-700">{sum.excused}</p>
            </div>
          </CardContent>
        </Card>

        {/* Day-by-day calendar grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Day by day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isoDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const status = byDate[isoDate];
                return (
                  <div
                    key={day}
                    title={status ? `${formatDate(isoDate)} — ${status}` : formatDate(isoDate)}
                    className={cn(
                      "aspect-square rounded-md grid place-items-center text-xs font-medium",
                      status ? STATUS_COLOR[status] : "bg-slate-50 text-slate-300",
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald" /> Present
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-red-500" /> Absent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-amber-500" /> Late
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-slate-300" /> Not yet marked
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
