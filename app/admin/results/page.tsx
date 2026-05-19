import Link from "next/link";
import { FileBarChart } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewExamDialog } from "@/components/admin/new-exam-dialog";
import { NewSubjectDialog } from "@/components/admin/new-subject-dialog";
import { ResultsFilters } from "@/components/admin/results-filters";
import { MarksEntry, type RosterRow } from "@/components/admin/marks-entry";
import { PublishResultsButton } from "@/components/admin/publish-results-button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Exam = { id: string; name: string; start_date: string | null; end_date: string | null; is_published: boolean };
type Cls = { id: string; grade: string; section: string };
type Subject = { id: string; name: string; code: string | null; grade: string | null; max_marks: number };
type ResultRow = { student_id: string; marks_obtained: number; max_marks: number; status: string };

async function getInitialData() {
  const supabase = createSupabaseAdminClient();
  const [exams, classes, subjects] = await Promise.all([
    supabase.from("exams").select("id,name,start_date,end_date,is_published").order("created_at", { ascending: false }),
    supabase.from("classes").select("id,grade,section").order("grade").order("section"),
    supabase.from("subjects").select("id,name,code,grade,max_marks").order("name"),
  ]);
  return {
    exams: ((exams.data as Exam[] | null) ?? []),
    classes: ((classes.data as Cls[] | null) ?? []),
    subjects: ((subjects.data as Subject[] | null) ?? []),
  };
}

async function getRoster(classId: string): Promise<RosterRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("students")
    .select("id,full_name,admission_number,roll_number")
    .eq("class_id", classId)
    .eq("status", "active")
    .order("roll_number", { ascending: true, nullsFirst: false })
    .order("full_name", { ascending: true });
  return ((data as RosterRow[] | null) ?? []);
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

export default async function ResultsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ exam_id?: string; class_id?: string; subject_id?: string }>;
}) {
  const params = await searchParams;
  const { exams, classes, subjects } = await getInitialData();

  const examOptions = exams.map((e) => ({ id: e.id, label: e.name }));
  const classOptions = classes.map((c) => ({ id: c.id, label: `Class ${c.grade} · ${c.section}` }));
  const subjectOptions = subjects.map((s) => ({
    id: s.id,
    label: s.name + (s.code ? ` (${s.code})` : ""),
  }));

  const selectedExam = exams.find((e) => e.id === params.exam_id);
  const selectedClass = classes.find((c) => c.id === params.class_id);
  const selectedSubject = subjects.find((s) => s.id === params.subject_id);

  const roster =
    params.class_id ? await getRoster(params.class_id) : ([] as RosterRow[]);
  const existing =
    params.exam_id && params.subject_id
      ? await getExistingMarks(
          params.exam_id,
          params.subject_id,
          roster.map((r) => r.id),
        )
      : {};

  return (
    <>
      <TopNav title="Results" subtitle="Enter marks per class · publish to parents" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Create an exam and a few subjects, then pick exam + class + subject to enter marks.
          </p>
          <div className="flex flex-wrap gap-2">
            <NewSubjectDialog />
            <NewExamDialog />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Marks entry</CardTitle>
            <CardDescription>
              Pick exam + class + subject. Marks save as <Badge variant="warning">draft</Badge> and only
              become visible to parents after you publish.
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
            Pick exam, class, and subject above to enter marks.
            {exams.length === 0 && (
              <p className="mt-2 text-xs">
                You don't have any exams yet — create one with the <strong>New exam</strong> button.
              </p>
            )}
            {subjects.length === 0 && (
              <p className="mt-2 text-xs">
                You don't have any subjects yet — add some with <strong>Add subject</strong>.
              </p>
            )}
          </div>
        ) : roster.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No active students in this class.
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">{selectedExam?.name}</span>
                {" · "}
                <span className="font-medium text-slate-700">
                  {selectedClass && `Class ${selectedClass.grade} · ${selectedClass.section}`}
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

        {/* Reference list */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Exams</CardTitle>
              <CardDescription>{exams.length} total</CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <p className="text-sm text-slate-500">None yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {exams.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{e.name}</p>
                        <p className="text-xs text-slate-500">
                          {e.start_date && e.end_date
                            ? `${formatDate(e.start_date)} → ${formatDate(e.end_date)}`
                            : e.start_date
                              ? formatDate(e.start_date)
                              : "—"}
                        </p>
                      </div>
                      <Link
                        href={`/admin/results?exam_id=${e.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <FileBarChart className="h-3.5 w-3.5" /> Enter marks
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>{subjects.length} total</CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <p className="text-sm text-slate-500">None yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <span className="font-medium text-slate-900">{s.name}</span>
                        {s.code && (
                          <span className="ml-2 font-mono text-xs text-slate-500">{s.code}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        Max {s.max_marks}
                        {s.grade && ` · Grade ${s.grade}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
