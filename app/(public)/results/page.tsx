import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { ArrowLeft, Clock, Download, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/motion/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { PdfPagesPreview } from "@/components/site/pdf-pages-preview";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hitRateLimit } from "@/lib/rate-limit";
import { formatDate } from "@/lib/utils";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Check Result",
  description:
    "Download your published report card with admission number and date of birth.",
};

type ResultRow = {
  pdf_url: string;
  published_at: string | null;
  exams: { id: string; name: string } | null;
};

type StudentLite = { id: string; full_name: string; admission_number: string };

async function lookupResultsRaw(
  admissionNumber: string,
  dob: string,
): Promise<{ student: StudentLite | null; results: ResultRow[]; error?: string }> {
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
      .select("pdf_url,published_at,exams(id,name)")
      .eq("student_id", (student as { id: string }).id)
      .eq("status", "published")
      .not("pdf_url", "is", null)
      .order("published_at", { ascending: false });

    return {
      student: student as unknown as StudentLite,
      results: (results as unknown as ResultRow[] | null) ?? [],
    };
  } catch {
    return {
      student: null,
      results: [],
      error: "Something went wrong. Try again in a moment.",
    };
  }
}

/**
 * Cached lookup keyed by (admission, dob). Coalesces concurrent reads of the
 * same student during result-publication rushes — when 1000 students all hit
 * /results at once after an exam, identical lookups within the 30s window
 * collapse into a single DB roundtrip per Vercel instance (and across
 * instances via Vercel's data cache). The cache is tagged so the publish /
 * unpublish endpoints can bust it immediately when an admin changes state.
 */
const lookupResults = unstable_cache(
  lookupResultsRaw,
  ["public-results-lookup-v1"],
  { revalidate: 30, tags: ["public-results"] },
);

// Per-IP rate limit on the public lookup. Generous so 1000 legit students
// (each from a different IP) sail through unaffected, but a single IP can't
// brute-force admission/DOB pairs. In-memory limiter — fine for the casual
// abuse case; swap for Upstash if we ever need cross-instance limiting.
const LOOKUP_RATE_LIMIT = { max: 30, windowMs: 60_000 };

function clientIp(h: Headers): string {
  const fwd = h.get("x-forwarded-for") ?? "";
  const real = h.get("x-real-ip") ?? "";
  return (fwd.split(",")[0] || real || "unknown").trim();
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
    const h = await headers();
    const rl = hitRateLimit(`results-lookup:${clientIp(h)}`, LOOKUP_RATE_LIMIT);
    if (!rl.allowed) {
      const waitSecs = Math.ceil(rl.resetMs / 1000);
      return (
        <>
          <PageHero
            eyebrow="Examination results"
            title="One moment."
            description="Too many lookups from this network."
            image={HERO_IMG}
          />
          <section className="container-wide py-20 sm:py-24">
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center">
                  <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="font-display text-lg font-semibold text-amber-900">
                    Hold on — too many attempts
                  </p>
                  <p className="mt-2 text-sm text-amber-800">
                    For everyone&apos;s safety we limit how often a single network
                    can look up results. Please wait about {waitSecs} second
                    {waitSecs === 1 ? "" : "s"} and try again.
                  </p>
                  <Link
                    href="/results"
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-5 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-800"
                  >
                    Back to search
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        </>
      );
    }

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

                <div className="space-y-6">
                  {results.map((r, idx) => (
                    <Reveal key={`${r.exams?.id}-${r.published_at}`} delay={idx * 0.06}>
                      <div className="flex flex-col rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                                <FileText className="h-5 w-5" />
                              </span>
                              <div className="min-w-0">
                                <h2 className="font-display truncate text-xl font-semibold text-[hsl(var(--ink))]">
                                  {r.exams?.name ?? "Exam"}
                                </h2>
                                {r.published_at && (
                                  <p className="text-xs text-[hsl(var(--ink-soft))]">
                                    Published {formatDate(r.published_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <a href={r.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Button className="rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90">
                              <Download className="h-4 w-4" /> Download PDF
                            </Button>
                          </a>
                        </div>

                        <div className="mt-6">
                          <PdfPagesPreview pdfUrl={r.pdf_url} />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
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
        description="Enter your admission number and date of birth. Only report cards officially published by the office are visible here."
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
