import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nextAcademicYearLabel } from "@/lib/academic-year";

export const dynamic = "force-dynamic";

const runSchema = z.object({
  source_class_id: z.string().uuid(),
  decisions: z
    .array(
      z.object({
        student_id: z.string().uuid(),
        action: z.enum(["promote", "retain", "graduate", "transfer"]),
        // override target grade (string) for promote/retain — defaults from suggestion otherwise
        target_grade: z.string().max(20).optional(),
        target_section: z.string().max(20).optional(),
      }),
    )
    .min(1)
    .max(500),
  create_alumni: z.boolean().default(false),
});

type ClassRow = { id: string; grade: string; section: string; academic_year_id: string };
type YearRow = { id: string; year_label: string; start_date: string; end_date: string };

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = runSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { source_class_id, decisions, create_alumni } = parsed.data;
  const supabase = createSupabaseAdminClient();

  // 1. Resolve source class + year
  const { data: srcRaw } = await supabase
    .from("classes")
    .select("id,grade,section,academic_year_id")
    .eq("id", source_class_id)
    .maybeSingle();
  if (!srcRaw) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const src = srcRaw as ClassRow;

  const { data: srcYearRaw } = await supabase
    .from("academic_years")
    .select("id,year_label,start_date,end_date")
    .eq("id", src.academic_year_id)
    .maybeSingle();
  if (!srcYearRaw) {
    return NextResponse.json({ error: "Source academic year missing" }, { status: 500 });
  }
  const srcYear = srcYearRaw as YearRow;
  const nextLabel = nextAcademicYearLabel(srcYear.year_label);

  // 2. Resolve (or create) next academic year
  let { data: nextYearRaw } = await supabase
    .from("academic_years")
    .select("id,year_label,start_date,end_date")
    .eq("year_label", nextLabel)
    .maybeSingle();

  if (!nextYearRaw) {
    const startYear = parseInt(nextLabel.slice(0, 4), 10);
    const { data: created, error: yearErr } = await supabase
      .from("academic_years")
      .insert({
        year_label: nextLabel,
        start_date: `${startYear}-04-01`,
        end_date: `${startYear + 1}-03-31`,
        is_current: false,
      })
      .select("id,year_label,start_date,end_date")
      .single();
    if (yearErr) return NextResponse.json({ error: yearErr.message }, { status: 500 });
    nextYearRaw = created;
  }
  const nextYear = nextYearRaw as YearRow;

  // 3. Resolve (or create) target classes per (grade, section) pair
  const classKey = (grade: string, section: string) => `${grade}|${section}`;
  const classCache: Record<string, string> = {};

  async function getOrCreateClass(grade: string, section: string): Promise<string> {
    const key = classKey(grade, section);
    if (classCache[key]) return classCache[key];

    const { data: existing } = await supabase
      .from("classes")
      .select("id")
      .eq("grade", grade)
      .eq("section", section)
      .eq("academic_year_id", nextYear.id)
      .maybeSingle();
    if (existing) {
      classCache[key] = (existing as { id: string }).id;
      return classCache[key];
    }
    const { data: created, error } = await supabase
      .from("classes")
      .insert({ grade, section, academic_year_id: nextYear.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    classCache[key] = (created as { id: string }).id;
    return classCache[key];
  }

  // 4. Build per-student update payloads
  const summary = { promoted: 0, retained: 0, graduated: 0, transferred: 0 };

  for (const d of decisions) {
    try {
      if (d.action === "graduate") {
        await supabase
          .from("students")
          .update({ status: "graduated", class_id: null })
          .eq("id", d.student_id);
        summary.graduated++;

        if (create_alumni) {
          const { data: student } = await supabase
            .from("students")
            .select("id,full_name")
            .eq("id", d.student_id)
            .maybeSingle();
          if (student) {
            const startYear = parseInt(srcYear.year_label.slice(0, 4), 10);
            await supabase.from("alumni").insert({
              student_id: (student as { id: string }).id,
              full_name: (student as { full_name: string }).full_name,
              graduation_year: startYear + 1,
              is_public: true,
            });
          }
        }
        continue;
      }

      if (d.action === "transfer") {
        await supabase
          .from("students")
          .update({ status: "transferred" })
          .eq("id", d.student_id);
        summary.transferred++;
        continue;
      }

      // promote or retain
      const grade =
        d.target_grade ?? (d.action === "retain" ? src.grade : null);
      const section = d.target_section ?? src.section;

      if (!grade) {
        // Caller didn't supply target_grade and action is "promote" but no suggestion;
        // skip silently rather than fail the whole batch.
        continue;
      }

      const targetClassId = await getOrCreateClass(grade, section);
      await supabase
        .from("students")
        .update({
          status: d.action === "promote" ? "promoted" : "retained",
          class_id: targetClassId,
        })
        .eq("id", d.student_id);

      if (d.action === "promote") summary.promoted++;
      else summary.retained++;
    } catch (err) {
      // continue with remaining decisions
      console.error("[promotions] decision failed", d, err);
    }
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "promotions.run",
    entity_type: "class",
    entity_id: source_class_id,
    metadata: { ...summary, next_year: nextYear.year_label, count: decisions.length },
  });

  return NextResponse.json({ ok: true, summary, next_year: nextYear.year_label });
}
