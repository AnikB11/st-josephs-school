import { Download } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Child = {
  id: string;
  full_name: string;
  admission_number: string;
  classes: { grade: string; section: string } | null;
};

type ResultDetail = {
  marks_obtained: number;
  max_marks: number;
  grade: string | null;
  pdf_url: string | null;
  published_at: string | null;
  subjects: { name: string; code: string | null } | null;
  exams: { id: string; name: string } | null;
};

async function getChildren(userId: string | undefined): Promise<Child[]> {
  if (!userId) return [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!parent) return [];
    const { data } = await supabase
      .from("students")
      .select("id,full_name,admission_number,classes(grade,section)")
      .eq("parent_id", (parent as { id: string }).id);
    return (data as unknown as Child[] | null) ?? [];
  } catch {
    return [];
  }
}

async function getPublishedResults(studentId: string): Promise<ResultDetail[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("results")
      .select(
        "marks_obtained,max_marks,grade,pdf_url,published_at,exams(id,name),subjects(name,code)",
      )
      .eq("student_id", studentId)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return (data as unknown as ResultDetail[] | null) ?? [];
  } catch {
    return [];
  }
}

function groupByExam(rows: ResultDetail[]) {
  const map = new Map<string, { name: string; rows: ResultDetail[] }>();
  for (const r of rows) {
    if (!r.exams) continue;
    if (!map.has(r.exams.id)) map.set(r.exams.id, { name: r.exams.name, rows: [] });
    map.get(r.exams.id)!.rows.push(r);
  }
  return Array.from(map.values());
}

export default async function ParentResultsPage() {
  const user = await getAuthUser();
  const children = await getChildren(user?.dbUser?.id);

  return (
    <>
      <TopNav title="Results" subtitle="Published examination results" />
      <div className="space-y-8 px-6 py-8">
        {children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            We couldn't find any children linked to your account yet. Please contact the office to link your student.
          </div>
        ) : (
          await Promise.all(
            children.map(async (child) => {
              const rows = await getPublishedResults(child.id);
              const exams = groupByExam(rows);

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

                  {exams.length === 0 ? (
                    <Card>
                      <CardContent className="py-10 text-center text-sm text-slate-500">
                        No published results yet for this child.
                      </CardContent>
                    </Card>
                  ) : (
                    exams.map((exam) => {
                      const total = exam.rows.reduce((a, r) => a + Number(r.marks_obtained), 0);
                      const max = exam.rows.reduce((a, r) => a + Number(r.max_marks), 0);
                      const pct = max > 0 ? Math.round((total / max) * 100) : 0;
                      const pdfUrl = exam.rows.find((r) => r.pdf_url)?.pdf_url;
                      const publishedAt = exam.rows[0]?.published_at;

                      return (
                        <Card key={exam.name}>
                          <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <CardTitle>{exam.name}</CardTitle>
                                {publishedAt && (
                                  <CardDescription>
                                    Published {formatDate(publishedAt)}
                                  </CardDescription>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={pct >= 40 ? "success" : "destructive"}>
                                  {pct}% · {total}/{max}
                                </Badge>
                                {pdfUrl && (
                                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline">
                                      <Download className="h-4 w-4" /> Download PDF
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Subject</TableHead>
                                  <TableHead className="text-right">Marks</TableHead>
                                  <TableHead className="text-right">Max</TableHead>
                                  <TableHead className="text-right">Grade</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {exam.rows.map((r, i) => (
                                  <TableRow key={i}>
                                    <TableCell className="font-medium text-slate-900">
                                      {r.subjects?.name ?? "—"}
                                      {r.subjects?.code && (
                                        <span className="ml-2 font-mono text-xs text-slate-400">
                                          {r.subjects.code}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {Number(r.marks_obtained)}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-500">
                                      {Number(r.max_marks)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {r.grade ? (
                                        <Badge variant="default">{r.grade}</Badge>
                                      ) : (
                                        "—"
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </section>
              );
            }),
          )
        )}
      </div>
    </>
  );
}
