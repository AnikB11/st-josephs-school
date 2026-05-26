import Link from "next/link";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AttendanceMarker, type Roster } from "@/components/admin/attendance-marker";
import { AttendanceFilters } from "@/components/admin/attendance-filters";
import { getTeacherContext, teacherIsClassTeacherOf } from "@/lib/teacher";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Cls = { id: string; grade: string; section: string };
type AttendanceStatus = "present" | "absent" | "late" | "excused";

async function getRoster(classId: string): Promise<Roster[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("students")
      .select("id,admission_number,full_name,roll_number,photo_url")
      .eq("class_id", classId)
      .eq("status", "active")
      .order("roll_number", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true });
    return (data as Roster[] | null) ?? [];
  } catch {
    return [];
  }
}

async function getExistingMarks(classId: string, date: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("attendance")
      .select("student_id,status")
      .eq("class_id", classId)
      .eq("date", date);
    const map: Record<string, AttendanceStatus> = {};
    ((data as { student_id: string; status: string }[] | null) ?? []).forEach((r) => {
      map[r.student_id] = r.status as AttendanceStatus;
    });
    return map;
  } catch {
    return {} as Record<string, AttendanceStatus>;
  }
}

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string; date?: string }>;
}) {
  const ctx = await getTeacherContext();
  const { class_id, date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = date ?? today;

  if (!ctx) {
    return (
      <>
        <TopNav title="Attendance" subtitle="" />
        <div className="px-6 py-8">
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              No teacher profile linked to your account.
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Only classes where the teacher is the class teacher
  const classTeacherAssignments = ctx.assignments.filter((a) => a.is_class_teacher && a.classes);
  const classes: Cls[] = Array.from(
    new Map(
      classTeacherAssignments.map((a) => [
        a.class_id,
        { id: a.classes!.id, grade: a.classes!.grade, section: a.classes!.section },
      ]),
    ).values(),
  );

  const canAccessSelected = class_id ? teacherIsClassTeacherOf(ctx, class_id) : false;
  const roster = class_id && canAccessSelected ? await getRoster(class_id) : [];
  const existing = class_id && canAccessSelected ? await getExistingMarks(class_id, selectedDate) : {};
  const selectedClass = classes.find((c) => c.id === class_id);

  return (
    <>
      <TopNav title="Attendance" subtitle="Mark daily attendance for your class" />
      <div className="space-y-6 px-6 py-8">
        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              You're not the class teacher of any class. Only the class teacher can mark
              attendance. If this is wrong, please ask the admin to update your assignment.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Mark attendance</CardTitle>
                <CardDescription>
                  Pick one of your classes and a date. Existing marks for that day load
                  automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceFilters
                  classes={classes}
                  selectedClassId={class_id}
                  selectedDate={selectedDate}
                />
              </CardContent>
            </Card>

            {!class_id ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                Pick a class to load its roster.
              </div>
            ) : !canAccessSelected ? (
              <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/30 p-12 text-center text-sm text-red-700">
                You're not the class teacher of this class.{" "}
                <Link href="/teacher/attendance" className="font-medium underline">
                  Pick another
                </Link>
                .
              </div>
            ) : roster.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                No active students in{" "}
                <span className="font-medium text-slate-700">
                  {selectedClass ? `Class ${selectedClass.grade}-${selectedClass.section}` : "this class"}
                </span>
                .
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  Marking <span className="font-medium text-slate-700">{roster.length} students</span>{" "}
                  for <span className="font-medium text-slate-700">{formatDate(selectedDate)}</span>
                  {selectedClass && (
                    <>
                      {" · "}Class {selectedClass.grade}-{selectedClass.section}
                    </>
                  )}
                </p>
                <AttendanceMarker
                  classId={class_id}
                  date={selectedDate}
                  roster={roster}
                  initial={existing}
                />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
