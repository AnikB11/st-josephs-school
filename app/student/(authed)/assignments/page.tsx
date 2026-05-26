import { BookOpen, Calendar, CheckCircle2 } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentSubmitter } from "@/components/student/assignment-submitter";
import { getStudentForCurrentUser } from "@/lib/student";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AssignmentRow = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  due_date: string | null;
  max_marks: number | null;
  created_at: string;
  classes: { grade: string; section: string } | null;
  subjects: { name: string; code: string | null } | null;
  teachers: { full_name: string } | null;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  pdf_url: string | null;
  remarks: string | null;
  marks_obtained: number | null;
  status: string;
  submitted_at: string;
};

export default async function StudentAssignmentsPage() {
  const student = await getStudentForCurrentUser();

  if (!student || !student.class_id) {
    return (
      <>
        <TopNav title="Assignments" subtitle="Your homework and submissions" />
        <div className="px-6 py-8">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            We couldn't find a class linked to your account. Please contact the school office.
          </div>
        </div>
      </>
    );
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: assignments }, { data: mySubs }] = await Promise.all([
    supabase
      .from("assignments")
      .select(
        "id,title,description,pdf_url,due_date,max_marks,created_at,classes(grade,section),subjects(name,code),teachers(full_name)",
      )
      .eq("class_id", student.class_id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("assignment_submissions")
      .select("id,assignment_id,pdf_url,remarks,marks_obtained,status,submitted_at")
      .eq("student_id", student.id),
  ]);

  const rows = (assignments as unknown as AssignmentRow[] | null) ?? [];
  const subs = ((mySubs as SubmissionRow[] | null) ?? []).reduce<Record<string, SubmissionRow>>(
    (acc, s) => {
      acc[s.assignment_id] = s;
      return acc;
    },
    {},
  );

  return (
    <>
      <TopNav title="Assignments" subtitle={`${rows.length} active for your class`} />
      <div className="space-y-4 px-6 py-8">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No assignments yet. Check back later.
          </div>
        ) : (
          rows.map((a) => {
            const sub = subs[a.id];
            return (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base inline-flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {a.title}
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                        {a.subjects && (
                          <Badge variant="secondary">{a.subjects.name}</Badge>
                        )}
                        {a.teachers && (
                          <span className="text-xs">by {a.teachers.full_name}</span>
                        )}
                        {a.due_date && (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" /> Due {formatDate(a.due_date)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {sub ? (
                      sub.status === "graded" ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {sub.marks_obtained ?? "—"}
                          {a.max_marks !== null && `/${a.max_marks}`}
                        </Badge>
                      ) : (
                        <Badge variant="warning">Submitted</Badge>
                      )
                    ) : (
                      <Badge variant="outline">Not submitted</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {a.description && (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.description}</p>
                  )}
                  <AssignmentSubmitter
                    assignmentId={a.id}
                    studentId={student.id}
                    assignmentPdfUrl={a.pdf_url}
                    submission={sub ?? null}
                    maxMarks={a.max_marks}
                  />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
