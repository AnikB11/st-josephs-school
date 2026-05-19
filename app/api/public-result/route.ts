import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Public result lookup.
 *   GET /api/public-result?admission_number=SJR-2026-0001&dob=2010-04-12
 *
 * Returns only PUBLISHED results.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admission = searchParams.get("admission_number")?.trim();
  const dob = searchParams.get("dob")?.trim();

  if (!admission || !dob) {
    return NextResponse.json(
      { error: "admission_number and dob are required" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, admission_number, date_of_birth")
    .eq("admission_number", admission)
    .eq("date_of_birth", dob)
    .maybeSingle();

  if (!student) {
    return NextResponse.json(
      { error: "No matching student found. Please check your details." },
      { status: 404 },
    );
  }

  const { data: results } = await supabase
    .from("results")
    .select("id, marks_obtained, max_marks, grade, exam_id, subject_id, published_at")
    .eq("student_id", student.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return NextResponse.json({
    student: {
      full_name: student.full_name,
      admission_number: student.admission_number,
    },
    results: results ?? [],
  });
}
