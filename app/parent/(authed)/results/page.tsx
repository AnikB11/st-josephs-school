import { Download, FileText } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PdfPagesPreview } from "@/components/site/pdf-pages-preview";
import { getStudentForCurrentUser } from "@/lib/student";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Child = {
  id: string;
  full_name: string;
  admission_number: string;
  classes: { grade: string; section: string } | null;
};

type ResultRow = {
  pdf_url: string;
  published_at: string | null;
  exams: { id: string; name: string } | null;
};

async function getChildren(): Promise<Child[]> {
  const student = await getStudentForCurrentUser();
  if (!student) return [];
  return [
    {
      id: student.id,
      full_name: student.full_name,
      admission_number: student.admission_number,
      classes: student.classes,
    },
  ];
}

/**
 * Fetch published PDFs for ALL children in one round-trip. Today `getChildren`
 * returns a single child, but the moment that helper expands to support
 * multiple linked students per parent, the previous `Promise.all(children.map(...))`
 * pattern would become a classic N+1. Batching now keeps it at one query.
 */
async function getPublishedPdfsForStudents(
  studentIds: string[],
): Promise<Map<string, ResultRow[]>> {
  const grouped = new Map<string, ResultRow[]>();
  studentIds.forEach((id) => grouped.set(id, []));
  if (studentIds.length === 0) return grouped;
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("results")
      .select("student_id,pdf_url,published_at,exams(id,name)")
      .in("student_id", studentIds)
      .eq("status", "published")
      .not("pdf_url", "is", null)
      .order("published_at", { ascending: false });
    const rows =
      (data as unknown as (ResultRow & { student_id: string })[] | null) ?? [];
    for (const r of rows) {
      const list = grouped.get(r.student_id);
      if (list) list.push(r);
    }
    return grouped;
  } catch {
    return grouped;
  }
}

export default async function ParentResultsPage() {
  const children = await getChildren();
  const resultsByStudent = await getPublishedPdfsForStudents(
    children.map((c) => c.id),
  );

  return (
    <>
      <TopNav title="Results" subtitle="Published examination results" />
      <div className="space-y-8 px-6 py-8">
        {children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            We couldn&apos;t find any children linked to your account yet. Please contact the
            office to link your student.
          </div>
        ) : (
          children.map((child) => {
            const rows = resultsByStudent.get(child.id) ?? [];

            return (
              <section key={child.id} className="space-y-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-slate-900">
                      {child.full_name}
                    </h2>
                    <p className="font-mono text-xs text-slate-500">
                      {child.admission_number}
                      {child.classes && ` · Class ${child.classes.grade} · ${child.classes.section}`}
                    </p>
                  </div>

                  {rows.length === 0 ? (
                    <Card>
                      <CardContent className="py-10 text-center text-sm text-slate-500">
                        No published results yet for this child.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {rows.map((r) => (
                        <Card key={`${r.exams?.id}-${r.published_at}`}>
                          <CardContent className="space-y-6 pt-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                                  <FileText className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                  <h3 className="font-display truncate text-base font-semibold text-slate-900">
                                    {r.exams?.name ?? "Exam"}
                                  </h3>
                                  {r.published_at && (
                                    <p className="text-xs text-slate-500">
                                      Published {formatDate(r.published_at)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <a href={r.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm">
                                  <Download className="h-4 w-4" /> Download PDF
                                </Button>
                              </a>
                            </div>
                            <PdfPagesPreview pdfUrl={r.pdf_url} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
