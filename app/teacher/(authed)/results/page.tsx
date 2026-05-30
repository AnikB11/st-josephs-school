import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResultsFilters } from "@/components/admin/results-filters";
import {
  ResultPdfUploader,
  type StudentRosterRow,
  type ExistingResult,
} from "@/components/admin/result-pdf-uploader";
import { PublishResultsButton } from "@/components/admin/publish-results-button";
import { getTeacherContext, teacherCanAccess } from "@/lib/teacher";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Exam = { id: string; name: string };
type ResultRow = { student_id: string; pdf_url: string | null; status: "draft" | "published" };

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

async function getRoster(classId: string): Promise<StudentRosterRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("students")
      .select("id,full_name,admission_number,roll_number")
      .eq("class_id", classId)
      .eq("status", "active")
      .order("roll_number", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true });
    return (data as StudentRosterRow[] | null) ?? [];
  } catch {
    return [];
  }
}

async function getExistingPdfs(examId: string, studentIds: string[]) {
  if (studentIds.length === 0) return {};
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("results")
    .select("student_id,pdf_url,status")
    .eq("exam_id", examId)
    .in("student_id", studentIds)
    .not("pdf_url", "is", null);
  const map: Record<string, ExistingResult> = {};
  ((data as ResultRow[] | null) ?? []).forEach((r) => {
    if (r.pdf_url) {
      map[r.student_id] = {
        pdf_url: r.pdf_url,
        status: (r.status === "published" ? "published" : "draft") as "draft" | "published",
      };
    }
  });
  return map;
}

export default async function TeacherResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ exam_id?: string; class_id?: string }>;
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

  // Only show classes the teacher is assigned to
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
  const examOptions = exams.map((e) => ({ id: e.id, label: e.name }));

  const canAccess = params.class_id ? teacherCanAccess(ctx, params.class_id) : false;
  const roster = params.class_id && canAccess ? await getRoster(params.class_id) : ([] as StudentRosterRow[]);
  const existing =
    params.exam_id && canAccess
      ? await getExistingPdfs(params.exam_id, roster.map((r) => r.id))
      : {};

  const selectedExam = exams.find((e) => e.id === params.exam_id);
  const selectedClass = classOptions.find((c) => c.id === params.class_id);
  const uploaded = roster.filter((s) => existing[s.id]).length;
  const published = roster.filter((s) => existing[s.id]?.status === "published").length;

  return (
    <>
      <TopNav title="Results" subtitle="Upload one PDF report card per student in your classes" />
      <div className="space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Pick exam and class</CardTitle>
            <CardDescription>
              Only your assigned classes appear here. Uploaded PDFs save as{" "}
              <Badge variant="warning">draft</Badge> until you publish.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsFilters
              exams={examOptions}
              classes={classOptions}
              selected={params}
            />
          </CardContent>
        </Card>

        {!params.exam_id || !params.class_id ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            {exams.length === 0
              ? "No exams have been created yet. Ask the admin to create one."
              : classOptions.length === 0
                ? "You don't have any class assignments yet."
                : "Pick an exam and a class above to upload PDF report cards."}
          </div>
        ) : !canAccess ? (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/30 p-12 text-center text-sm text-red-700">
            You&apos;re not assigned to this class.
          </div>
        ) : roster.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No active students in this class.
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-5 py-4">
              <div className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">{selectedExam?.name}</span>
                {" · "}
                <span className="font-medium text-slate-700">{selectedClass?.label}</span>
                <span className="ml-3 inline-flex items-center gap-3">
                  <Badge variant="secondary">
                    {uploaded} / {roster.length} uploaded
                  </Badge>
                  <Badge variant={published === uploaded && uploaded > 0 ? "success" : "outline"}>
                    {published} published
                  </Badge>
                </span>
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

            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
              <ul className="divide-y divide-slate-100">
                {roster.map((s) => (
                  <ResultPdfUploader
                    key={s.id}
                    examId={params.exam_id!}
                    student={s}
                    existing={existing[s.id] ?? null}
                  />
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
