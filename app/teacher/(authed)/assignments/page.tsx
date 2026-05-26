import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewAssignmentDialog } from "@/components/teacher/new-assignment-dialog";
import { AssignmentActions } from "@/components/teacher/assignment-actions";
import { getTeacherContext } from "@/lib/teacher";
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
  is_published: boolean;
  created_at: string;
  class_id: string;
  subject_id: string | null;
  classes: { grade: string; section: string } | null;
  subjects: { name: string; code: string | null } | null;
};

async function listMine(teacherId: string): Promise<AssignmentRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("assignments")
    .select(
      "id,title,description,pdf_url,due_date,max_marks,is_published,created_at,class_id,subject_id,classes(grade,section),subjects(name,code)",
    )
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as unknown as AssignmentRow[] | null) ?? [];
}

export default async function TeacherAssignmentsPage() {
  const ctx = await getTeacherContext();
  if (!ctx) {
    return (
      <>
        <TopNav title="Assignments" subtitle="" />
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

  const rows = await listMine(ctx.teacher.id);

  return (
    <>
      <TopNav title="Assignments" subtitle="Create and track student work" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Post assignments to classes and subjects you teach. Students submit a PDF; you can
            grade submissions inline.
          </p>
          <NewAssignmentDialog assignments={ctx.assignments} />
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              No assignments yet. Click <span className="font-medium text-slate-700">New assignment</span>{" "}
              to create your first.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {rows.map((a) => (
              <Card key={a.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base">
                      <Link href={`/teacher/assignments/${a.id}`} className="hover:text-primary">
                        {a.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                      {a.classes && (
                        <Badge variant="secondary">
                          Class {a.classes.grade}-{a.classes.section}
                        </Badge>
                      )}
                      {a.subjects && (
                        <span className="text-xs text-slate-600">
                          {a.subjects.name}
                          {a.subjects.code && (
                            <span className="ml-1 font-mono text-slate-400">{a.subjects.code}</span>
                          )}
                        </span>
                      )}
                      {a.due_date && (
                        <span className="text-xs">Due {formatDate(a.due_date)}</span>
                      )}
                      {a.max_marks !== null && (
                        <span className="text-xs">/ {a.max_marks} marks</span>
                      )}
                      {!a.is_published && <Badge variant="warning">Draft</Badge>}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {a.pdf_url && (
                      <a
                        href={a.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-primary/40 hover:text-primary"
                      >
                        <FileText className="h-3.5 w-3.5" /> PDF
                      </a>
                    )}
                    <Link
                      href={`/teacher/assignments/${a.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </Link>
                    <AssignmentActions id={a.id} isPublished={a.is_published} />
                  </div>
                </CardHeader>
                {a.description && (
                  <CardContent className="pt-0 text-sm text-slate-600 line-clamp-2">
                    {a.description}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
