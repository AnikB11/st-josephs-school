import Link from "next/link";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AttendanceMarker, type Roster } from "@/components/admin/attendance-marker";
import { AttendanceFilters } from "@/components/admin/attendance-filters";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Cls = { id: string; grade: string; section: string };

async function listClasses(): Promise<Cls[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("classes")
      .select("id,grade,section")
      .order("grade", { ascending: true })
      .order("section", { ascending: true });
    return (data as Cls[] | null) ?? [];
  } catch {
    return [];
  }
}

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
    const map: Record<string, "present" | "absent" | "late" | "excused"> = {};
    ((data as { student_id: string; status: string }[] | null) ?? []).forEach((r) => {
      map[r.student_id] = r.status as "present" | "absent" | "late" | "excused";
    });
    return map;
  } catch {
    return {};
  }
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string; date?: string }>;
}) {
  const { class_id, date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = date ?? today;

  const classes = await listClasses();
  const roster = class_id ? await getRoster(class_id) : [];
  const existing = class_id ? await getExistingMarks(class_id, selectedDate) : {};
  const selectedClass = classes.find((c) => c.id === class_id);

  return (
    <>
      <TopNav title="Attendance" subtitle="Mark and review daily attendance" />
      <div className="space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Mark attendance</CardTitle>
            <CardDescription>
              Choose a class and date. Existing marks for that day are loaded automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceFilters classes={classes} selectedClassId={class_id} selectedDate={selectedDate} />
          </CardContent>
        </Card>

        {!class_id ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Pick a class to load its roster.
          </div>
        ) : roster.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No active students in{" "}
            <span className="font-medium text-slate-700">
              {selectedClass ? `Class ${selectedClass.grade} · ${selectedClass.section}` : "this class"}
            </span>
            . Add students from{" "}
            <Link href="/admin/students" className="text-primary hover:underline">
              Students
            </Link>
            .
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              Marking <span className="font-medium text-slate-700">{roster.length} students</span> for{" "}
              <span className="font-medium text-slate-700">{formatDate(selectedDate)}</span>
              {selectedClass && (
                <>
                  {" · "}Class {selectedClass.grade} · {selectedClass.section}
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
      </div>
    </>
  );
}
