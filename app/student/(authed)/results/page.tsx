import { Download, FileText } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PdfPagesPreview } from "@/components/site/pdf-pages-preview";
import { getStudentForCurrentUser } from "@/lib/student";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ResultRow = {
  pdf_url: string;
  published_at: string | null;
  exams: { id: string; name: string } | null;
};

async function getPublishedPdfs(studentId: string): Promise<ResultRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("results")
      .select("pdf_url,published_at,exams(id,name)")
      .eq("student_id", studentId)
      .eq("status", "published")
      .not("pdf_url", "is", null)
      .order("published_at", { ascending: false });
    return (data as unknown as ResultRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function StudentResultsPage() {
  const student = await getStudentForCurrentUser();

  if (!student) {
    return (
      <>
        <TopNav title="Results" subtitle="Your examination results" />
        <div className="px-6 py-8">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No student record found for your account. Please contact the school office.
          </div>
        </div>
      </>
    );
  }

  const rows = await getPublishedPdfs(student.id);

  return (
    <>
      <TopNav title="Results" subtitle={`${student.full_name} · ${student.admission_number}`} />
      <div className="space-y-6 px-6 py-8">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            {student.full_name}
          </h2>
          <p className="font-mono text-xs text-slate-500">
            {student.admission_number}
            {student.classes && ` · Class ${student.classes.grade}-${student.classes.section}`}
          </p>
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              No published results yet. Your report cards will appear here once the school
              publishes them.
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
      </div>
    </>
  );
}
