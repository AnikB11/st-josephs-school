import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Child = {
  id: string;
  full_name: string;
  admission_number: string;
  classes: { grade: string; section: string } | null;
};

type AttendanceRow = { date: string; status: string };

async function getChildren(userId: string | undefined): Promise<Child[]> {
  if (!userId) return [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!parent) return [];
    const { data } = await supabase
      .from("students")
      .select("id,full_name,admission_number,classes(grade,section)")
      .eq("parent_id", (parent as { id: string }).id);
    return (data as unknown as Child[] | null) ?? [];
  } catch {
    return [];
  }
}

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

export default async function ParentAttendancePage() {
  const user = await getAuthUser();
  const children = await getChildren(user?.dbUser?.id);

  if (children.length === 0) {
    return (
      <>
        <TopNav title="Attendance" subtitle="Monthly attendance for your children" />
        <div className="px-6 py-8">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No children linked to your account yet. Please contact the school office to link your student.
          </div>
        </div>
      </>
    );
  }

  const today = new Date();
  const month = today.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const data = await Promise.all(
    children.map(async (c) => ({
      child: c,
      rows: await getMonthAttendance(c.id),
    })),
  );

  return (
    <>
      <TopNav title="Attendance" subtitle={`${month} · ${daysInMonth} calendar days`} />
      <div className="space-y-8 px-6 py-8">
        {data.map(({ child, rows }) => {
          const sum = summarize(rows);
          const byDate: Record<string, string> = {};
          rows.forEach((r) => (byDate[r.date] = r.status));

          return (
            <section key={child.id} className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    {child.full_name}
                  </h2>
                  <p className="font-mono text-xs text-slate-500">
                    {child.admission_number}
                    {child.classes && ` · Class ${child.classes.grade} · ${child.classes.section}`}
                  </p>
                </div>
                <Badge variant={sum.rate >= 75 ? "success" : "warning"}>{sum.rate}% attendance</Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">This month</CardTitle>
                  <CardDescription>
                    {sum.total} marked day{sum.total === 1 ? "" : "s"}
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
            </section>
          );
        })}
      </div>
    </>
  );
}
