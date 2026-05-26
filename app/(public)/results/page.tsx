import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHero } from "@/components/motion/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Check Result",
  description:
    "Look up your published examination result with admission number and date of birth.",
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

type StudentLite = { id: string; full_name: string; admission_number: string };

async function lookupResults(
  admissionNumber: string,
  dob: string,
): Promise<{ student: StudentLite | null; results: ResultDetail[]; error?: string }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: student } = await supabase
      .from("students")
      .select("id,full_name,admission_number,date_of_birth")
      .eq("admission_number", admissionNumber)
      .eq("date_of_birth", dob)
      .maybeSingle();

    if (!student) {
      return {
        student: null,
        results: [],
        error: "No matching student found. Please check your details.",
      };
    }

    const { data: results } = await supabase
      .from("results")
      .select(
        "marks_obtained,max_marks,grade,pdf_url,published_at,exams(id,name),subjects(name,code)",
      )
      .eq("student_id", (student as { id: string }).id)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    return {
      student: student as unknown as StudentLite,
      results: (results as unknown as ResultDetail[] | null) ?? [],
    };
  } catch {
    return {
      student: null,
      results: [],
      error: "Something went wrong. Try again in a moment.",
    };
  }
}

function groupByExam(results: ResultDetail[]) {
  const map = new Map<string, { name: string; rows: ResultDetail[] }>();
  for (const r of results) {
    if (!r.exams) continue;
    const key = r.exams.id;
    if (!map.has(key)) map.set(key, { name: r.exams.name, rows: [] });
    map.get(key)!.rows.push(r);
  }
  return Array.from(map.values());
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ admission_number?: string; dob?: string }>;
}) {
  const params = await searchParams;
  const admission = params.admission_number?.trim();
  const dob = params.dob?.trim();

  const cms = await getCmsSections(["results_hero_image"]);
  const HERO_IMG = resolveImage("results_hero_image", cms.results_hero_image);

  // Lookup result mode
  if (admission && dob) {
    const { student, results, error } = await lookupResults(admission, dob);

    return (
      <>
        <PageHero
          eyebrow="Examination results"
          title="Your result."
          description={student ? student.full_name : "Result lookup"}
          image={HERO_IMG}
        />

        <section className="container-wide py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
            >
              <ArrowLeft className="h-4 w-4" /> Search again
            </Link>

            {!student ? (
              <Reveal>
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
                  <p className="font-display text-lg font-semibold text-red-800">
                    Result not found
                  </p>
                  <p className="mt-2 text-sm text-red-700">
                    {error ?? "Please verify your details."}
                  </p>
                </div>
              </Reveal>
            ) : results.length === 0 ? (
              <Reveal>
                <div className="mt-6 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-10 text-center">
                  <p className="font-display text-xl font-semibold text-[hsl(var(--ink))]">
                    {student.full_name}
                  </p>
                  <p className="font-mono mt-1 text-xs text-[hsl(var(--ink-soft))]">
                    {student.admission_number}
                  </p>
                  <p className="mt-5 text-sm text-[hsl(var(--ink-soft))]">
                    No published results yet. Check back after the school office publishes your exam.
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="mt-6 space-y-6">
                <Reveal>
                  <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                      Student
                    </p>
                    <h1 className="font-display mt-1 text-3xl font-semibold text-[hsl(var(--ink))]">
                      {student.full_name}
                    </h1>
                    <p className="font-mono text-xs text-[hsl(var(--ink-soft))]">
                      {student.admission_number}
                    </p>
                  </div>
                </Reveal>

                {groupByExam(results).map((exam, idx) => {
                  const total = exam.rows.reduce((a, r) => a + Number(r.marks_obtained), 0);
                  const max = exam.rows.reduce((a, r) => a + Number(r.max_marks), 0);
                  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
                  const pdfUrl = exam.rows.find((r) => r.pdf_url)?.pdf_url;
                  const publishedAt = exam.rows[0]?.published_at;

                  return (
                    <Reveal key={exam.name} delay={idx * 0.06}>
                      <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="font-display text-xl font-semibold text-[hsl(var(--ink))]">
                              {exam.name}
                            </h2>
                            {publishedAt && (
                              <p className="text-xs text-[hsl(var(--ink-soft))]">
                                Published {formatDate(publishedAt)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={pct >= 40 ? "success" : "destructive"}>
                              {pct}% · {total}/{max}
                            </Badge>
                            {pdfUrl && (
                              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="rounded-full">
                                  <Download className="h-4 w-4" /> PDF
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>

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
                                <TableCell className="font-medium text-[hsl(var(--ink))]">
                                  {r.subjects?.name ?? "—"}
                                  {r.subjects?.code && (
                                    <span className="ml-2 font-mono text-xs text-[hsl(var(--ink-soft))]/70">
                                      {r.subjects.code}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">{Number(r.marks_obtained)}</TableCell>
                                <TableCell className="text-right text-[hsl(var(--ink-soft))]">
                                  {Number(r.max_marks)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {r.grade ? <Badge variant="default">{r.grade}</Badge> : "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  // Default: lookup form
  return (
    <>
      <PageHero
        eyebrow="Examination results"
        title="Check your published result."
        description="Enter your admission number and date of birth. Only results officially published by the office are visible here."
        image={HERO_IMG}
      />

      <section className="container-wide py-20 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <form
              method="GET"
              className="rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 shadow-sm sm:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="admission_number">Admission number</Label>
                  <Input
                    id="admission_number"
                    name="admission_number"
                    placeholder="SJR-2026-0001"
                    required
                    className="mt-1.5"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="mt-7 h-12 w-full rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
              >
                View result
              </Button>
              <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[hsl(var(--ink-soft))]">
                <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--emerald))]" />
                Your details are not stored — this is a read-only lookup.
              </p>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
