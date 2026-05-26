import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradeSubmissions } from "@/components/teacher/grade-submissions";
import { getTeacherContext } from "@/lib/teacher";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AssignmentDetail = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  due_date: string | null;
  max_marks: number | null;
  is_published: boolean;
  class_id: string;
  teacher_id: string | null;
  classes: { grade: string; section: string } | null;
  subjects: { name: string; code: string | null } | null;
};

type SubmissionRow = {
  id: string;
  pdf_url: string | null;
  remarks: string | null;
  marks_obtained: number | null;
  status: string;
  submitted_at: string;
  graded_at: string | null;
  students: { id: string; full_name: string; admission_number: string; roll_number: string | null } | null;
};

type StudentRow = {
  id: string;
  full_name: string;
  admission_number: string;
  roll_number: string | null;
};

export default async function TeacherAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getTeacherContext();
  const supabase = createSupabaseAdminClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select(
      "id,title,description,pdf_url,due_date,max_marks,is_published,class_id,teacher_id,classes(grade,section),subjects(name,code)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!assignment) notFound();
  const a = assignment as unknown as AssignmentDetail;

  // Teachers can only see their own assignment detail
  if (ctx && a.teacher_id && a.teacher_id !== ctx.teacher.id) {
    return (
      <>
        <TopNav title="Assignment" subtitle="" />
        <div className="px-6 py-8">
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              This assignment was created by another teacher.
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const [{ data: students }, { data: submissions }] = await Promise.all([
    supabase
      .from("students")
      .select("id,full_name,admission_number,roll_number")
      .eq("class_id", a.class_id)
      .eq("status", "active")
      .order("roll_number", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true }),
    supabase
      .from("assignment_submissions")
      .select(
        "id,pdf_url,remarks,marks_obtained,status,submitted_at,graded_at,students(id,full_name,admission_number,roll_number)",
      )
      .eq("assignment_id", id)
      .order("submitted_at", { ascending: true }),
  ]);

  const studentRoster = (students as StudentRow[] | null) ?? [];
  const subs = (submissions as unknown as SubmissionRow[] | null) ?? [];

  return (
    <>
      <TopNav title={a.title} subtitle="Assignment & submissions" />
      <div className="space-y-6 px-6 py-8">
        <Link
          href="/teacher/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to assignments
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{a.title}</CardTitle>
                <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                  {a.classes && (
                    <Badge variant="secondary">
                      Class {a.classes.grade}-{a.classes.section}
                    </Badge>
                  )}
                  {a.subjects && (
                    <span className="text-xs">
                      {a.subjects.name}
                      {a.subjects.code && (
                        <span className="ml-1 font-mono text-slate-400">{a.subjects.code}</span>
                      )}
                    </span>
                  )}
                  {!a.is_published && <Badge variant="warning">Draft</Badge>}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {a.due_date && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Due {formatDate(a.due_date)}
                  </span>
                )}
                {a.max_marks !== null && <span>Max {a.max_marks}</span>}
                {a.pdf_url && (
                  <a
                    href={a.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-primary/40 hover:text-primary"
                  >
                    <FileText className="h-3.5 w-3.5" /> Attachment
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
          {a.description && (
            <CardContent className="text-sm text-slate-700 whitespace-pre-wrap">
              {a.description}
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Submissions ({subs.length}/{studentRoster.length})
            </CardTitle>
            <CardDescription>Grade and leave feedback inline</CardDescription>
          </CardHeader>
          <CardContent>
            <GradeSubmissions
              assignmentId={a.id}
              maxMarks={a.max_marks}
              roster={studentRoster}
              submissions={subs}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
