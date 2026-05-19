import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nextAcademicYearLabel, suggestNextGrade } from "@/lib/academic-year";

export const dynamic = "force-dynamic";

type ClassRow = { id: string; grade: string; section: string; academic_year_id: string };
type YearRow = { id: string; year_label: string };
type Student = { id: string; full_name: string; admission_number: string; roll_number: string | null };

export async function GET(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  if (!classId) return NextResponse.json({ error: "class_id required" }, { status: 400 });

  const supabase = createSupabaseAdminClient();

  const { data: cls } = await supabase
    .from("classes")
    .select("id,grade,section,academic_year_id")
    .eq("id", classId)
    .maybeSingle();
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const c = cls as ClassRow;

  const { data: year } = await supabase
    .from("academic_years")
    .select("id,year_label")
    .eq("id", c.academic_year_id)
    .maybeSingle();
  const sourceYear = (year as YearRow | null) ?? null;
  const nextYearLabel = sourceYear ? nextAcademicYearLabel(sourceYear.year_label) : null;

  const { data: students } = await supabase
    .from("students")
    .select("id,full_name,admission_number,roll_number")
    .eq("class_id", classId)
    .eq("status", "active")
    .order("roll_number", { ascending: true, nullsFirst: false })
    .order("full_name", { ascending: true });

  const suggestion = suggestNextGrade(c.grade);

  return NextResponse.json({
    source_class: {
      id: c.id,
      grade: c.grade,
      section: c.section,
      academic_year: sourceYear?.year_label ?? null,
    },
    next_year_label: nextYearLabel,
    suggestion: {
      next_grade: suggestion.nextGrade,
      status: suggestion.status,
    },
    students: ((students as Student[] | null) ?? []),
  });
}
