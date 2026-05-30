import Link from "next/link";
import { FileBarChart, FileText } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewExamDialog } from "@/components/admin/new-exam-dialog";
import { ResultsFilters } from "@/components/admin/results-filters";
import {
  ResultPdfUploader,
  type StudentRosterRow,
  type ExistingResult,
} from "@/components/admin/result-pdf-uploader";
import { PublishResultsButton } from "@/components/admin/publish-results-button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Exam = { id: string; name: string; start_date: string | null; end_date: string | null; is_published: boolean };
type Cls = { id: string; grade: string; section: string };
type ResultRow = { student_id: string; pdf_url: string | null; status: "draft" | "published" };

async function getInitialData() {
  const supabase = createSupabaseAdminClient();
  const [exams, classes] = await Promise.all([
    supabase.from("exams").select("id,name,start_date,end_date,is_published").order("created_at", { ascending: false }),
    supabase.from("classes").select("id,grade,section").order("grade").order("section"),
  ]);
  return {
    exams: ((exams.data as Exam[] | null) ?? []),
    classes: ((classes.data as Cls[] | null) ?? []),
  };
}

async function getRoster(classId: string): Promise<StudentRosterRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("students")
    .select("id,full_name,admission_number,roll_number")
    .eq("class_id", classId)
    .eq("status", "active")
    .order("roll_number", { ascending: true, nullsFirst: false })
    .order("full_name", { ascending: true });
  return ((data as StudentRosterRow[] | null) ?? []);
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

export default async function ResultsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ exam_id?: string; class_id?: string }>;
}) {
  const params = await searchParams;
  const [{ exams, classes }, roster] = await Promise.all([
    getInitialData(),
    params.class_id ? getRoster(params.class_id) : Promise.resolve([] as StudentRosterRow[]),
  ]);

  const examOptions = exams.map((e) => ({ id: e.id, label: e.name }));
  const classOptions = classes.map((c) => ({ id: c.id, label: `Class ${c.grade} · ${c.section}` }));

  const selectedExam = exams.find((e) => e.id === params.exam_id);
  const selectedClass = classes.find((c) => c.id === params.class_id);

  const existing =
    params.exam_id
      ? await getExistingPdfs(params.exam_id, roster.map((r) => r.id))
      : {};

  const uploaded = roster.filter((s) => existing[s.id]).length;
  const published = roster.filter((s) => existing[s.id]?.status === "published").length;

  return (
    <>
      <TopNav title="Results" subtitle="Upload one PDF report card per student · publish per class" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Create an exam, pick a class, then upload one PDF report card per student. Each PDF
            contains all subjects for that student.
          </p>
          <NewExamDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pick exam and class</CardTitle>
            <CardDescription>
              Uploaded PDFs save as <Badge variant="warning">draft</Badge> and become visible to
              parents only after you publish.
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
            Pick an exam and a class above to upload PDF report cards.
            {exams.length === 0 && (
              <p className="mt-2 text-xs">
                You don&apos;t have any exams yet — create one with the <strong>New exam</strong> button.
              </p>
            )}
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
                <span className="font-medium text-slate-700">
                  {selectedClass && `Class ${selectedClass.grade} · ${selectedClass.section}`}
                </span>
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
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
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
                    </div>
                    <Link
                      href={`/admin/results?exam_id=${e.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <FileBarChart className="h-3.5 w-3.5" /> Upload PDFs
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
