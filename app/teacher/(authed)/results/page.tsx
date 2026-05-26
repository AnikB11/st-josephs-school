import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResultsFilters } from "@/components/admin/results-filters";
import { MarksEntry, type RosterRow } from "@/components/admin/marks-entry";
import { PublishResultsButton } from "@/components/admin/publish-results-button";
import { getTeacherContext, teacherCanAccess } from "@/lib/teacher";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Exam = { id: string; name: string };
type ResultRow = { student_id: string; marks_obtained: number; max_marks: number; status: string };

async function getExams(): Promise<Exam[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("exams")
      .select("id,name")
      .order("created_at", { ascending: false });
    return (data as Exam[] | null) ?? [];
  } catch {
    return [];
  }
}

async function getRoster(classId: string): Promise<RosterRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("students")
      .select("id,full_name,admission_number,roll_number")
      .eq("class_id", classId)
      .eq("status", "active")
      .order("roll_number", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true });
    return (data as RosterRow[] | null) ?? [];
  } catch {
    return [];
  }
}

async function getExistingMarks(examId: string, subjectId: string, studentIds: string[]) {
  if (studentIds.length === 0) return {};
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("results")
    .select("student_id,marks_obtained,max_marks,status")
    .eq("exam_id", examId)
    .eq("subject_id", subjectId)
    .in("student_id", studentIds);
  const map: Record<string, { marks_obtained: number; max_marks: number; status: string }> = {};
  ((data as ResultRow[] | null) ?? []).forEach((r) => {
    map[r.student_id] = {
      marks_obtained: Number(r.marks_obtained),
      max_marks: Number(r.max_marks),
      status: r.status,
    };
  });
  return map;
}

export default async function TeacherResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ exam_id?: string; class_id?: string; subject_id?: string }>;
}) {
  const ctx = await getTeacherContext();
  const params = await searchParams;

  if (!ctx) {
    return (
      <>
        <TopNav title="Results" subtitle="" />
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

  const exams = await getExams();

  // Only show classes and subjects the teacher is assigned to
  const classMap = new Map<string, { id: string; label: string }>();
  ctx.assignments.forEach((a) => {
    if (a.classes && !classMap.has(a.class_id)) {
      classMap.set(a.class_id, {
        id: a.class_id,
        label: `Class ${a.classes.grade}-${a.classes.section}`,
      });
    }
  });
  const classOptions = Array.from(classMap.values());

  // Subjects are filtered by the selected class
  const subjectOptions = params.class_id
    ? ctx.assignments
        .filter((a) => a.class_id === params.class_id && a.subjects)
        .map((a) => ({
          id: a.subjects!.id,
          label: a.subjects!.name + (a.subjects!.code ? ` (${a.subjects!.code})` : ""),
        }))
    : [];

  const examOptions = exams.map((e) => ({ id: e.id, label: e.name }));

  const selectedSubject = params.subject_id
    ? ctx.assignments.find((a) => a.subjects?.id === params.subject_id)?.subjects ?? null
    : null;

  const canAccess =
    params.class_id && params.subject_id
      ? teacherCanAccess(ctx, params.class_id, params.subject_id)
      : false;

  const roster =
    params.class_id && canAccess ? await getRoster(params.class_id) : ([] as RosterRow[]);
  const existing =
    params.exam_id && params.subject_id && canAccess
      ? await getExistingMarks(params.exam_id, params.subject_id, roster.map((r) => r.id))
      : {};

  return (
    <>
      <TopNav title="Marks entry" subtitle="Enter & publish marks for your subjects" />
      <div className="space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Pick exam, class, subject</CardTitle>
            <CardDescription>
              Only your assigned classes and subjects appear here. Marks save as{" "}
              <Badge variant="warning">draft</Badge> until you publish.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsFilters
              exams={examOptions}
              classes={classOptions}
              subjects={subjectOptions}
              selected={params}
            />
          </CardContent>
        </Card>

        {!params.exam_id || !params.class_id || !params.subject_id ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            {exams.length === 0
              ? "No exams have been created yet. Ask the admin to create one."
              : classOptions.length === 0
              ? "You don't have any subject assignments yet."
              : "Pick exam, class, and subject above to enter marks."}
          </div>
        ) : !canAccess ? (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/30 p-12 text-center text-sm text-red-700">
            You're not assigned to this subject in this class.
          </div>
        ) : roster.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No active students in this class.
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {exams.find((e) => e.id === params.exam_id)?.name}
                </span>
                {" · "}
                <span className="font-medium text-slate-700">
                  {classOptions.find((c) => c.id === params.class_id)?.label}
                </span>
                {" · "}
                <span className="font-medium text-slate-700">{selectedSubject?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <PublishResultsButton
                  examId={params.exam_id}
                  classId={params.class_id}
                  label="Publish class"
                />
                <PublishResultsButton
                  examId={params.exam_id}
                  classId={params.class_id}
                  unpublish
                  label="Unpublish class"
                />
              </div>
            </div>
            <MarksEntry
              examId={params.exam_id}
              classId={params.class_id}
              subjectId={params.subject_id}
              maxMarks={selectedSubject?.max_marks ?? 100}
              roster={roster}
              initial={existing}
            />
          </section>
        )}
      </div>
    </>
  );
}
