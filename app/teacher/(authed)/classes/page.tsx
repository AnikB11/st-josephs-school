import Link from "next/link";
import { ClipboardCheck, FileBarChart, Users } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeacherContext } from "@/lib/teacher";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ClassSummary = {
  classId: string;
  grade: string;
  section: string;
  subjects: { name: string; code: string | null }[];
  isClassTeacher: boolean;
  studentCount: number;
};

async function buildSummaries(
  assignments: NonNullable<Awaited<ReturnType<typeof getTeacherContext>>>["assignments"],
): Promise<ClassSummary[]> {
  const byClass = new Map<string, ClassSummary>();
  for (const a of assignments) {
    if (!a.classes) continue;
    const key = a.class_id;
    if (!byClass.has(key)) {
      byClass.set(key, {
        classId: key,
        grade: a.classes.grade,
        section: a.classes.section,
        subjects: [],
        isClassTeacher: false,
        studentCount: 0,
      });
    }
    const row = byClass.get(key)!;
    if (a.subjects) row.subjects.push({ name: a.subjects.name, code: a.subjects.code });
    if (a.is_class_teacher) row.isClassTeacher = true;
  }

  const classIds = Array.from(byClass.keys());
  if (classIds.length === 0) return [];

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("students")
    .select("class_id")
    .in("class_id", classIds)
    .eq("status", "active");

  ((data as { class_id: string }[] | null) ?? []).forEach((s) => {
    const row = byClass.get(s.class_id);
    if (row) row.studentCount += 1;
  });

  return Array.from(byClass.values()).sort((a, b) =>
    a.grade.localeCompare(b.grade, undefined, { numeric: true }) || a.section.localeCompare(b.section),
  );
}

export default async function TeacherClassesPage() {
  const ctx = await getTeacherContext();

  if (!ctx) {
    return (
      <>
        <TopNav title="My classes" subtitle="" />
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

  const summaries = await buildSummaries(ctx.assignments);

  return (
    <>
      <TopNav title="My classes" subtitle={`${summaries.length} ${summaries.length === 1 ? "class" : "classes"} assigned`} />
      <div className="space-y-6 px-6 py-8">
        {summaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            You haven't been assigned to any classes yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map((s) => (
              <Card key={s.classId}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-900">
                        Class {s.grade}-{s.section}
                      </h3>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" /> {s.studentCount} students
                      </p>
                    </div>
                    {s.isClassTeacher && <Badge variant="success">Class teacher</Badge>}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Subjects</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {s.subjects.length === 0 ? (
                        <span className="text-xs text-slate-400">— class teaching duty only —</span>
                      ) : (
                        s.subjects.map((sub) => (
                          <Badge key={sub.name} variant="secondary">
                            {sub.name}
                            {sub.code && (
                              <span className="ml-1 font-mono text-[10px] opacity-60">
                                {sub.code}
                              </span>
                            )}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {s.isClassTeacher && (
                      <Link
                        href={`/teacher/attendance?class_id=${s.classId}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" /> Attendance
                      </Link>
                    )}
                    <Link
                      href={`/teacher/results?class_id=${s.classId}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-primary/40 hover:text-primary"
                    >
                      <FileBarChart className="h-3.5 w-3.5" /> Marks
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
