import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  grade: z.string().min(1).max(20),
  section: z.string().min(1).max(5).regex(/^[A-Za-z0-9]+$/, "Section must be alphanumeric"),
});

/**
 * Create a new section under a given grade. In the current schema each
 * (grade, section) pair is a single row in `classes`, so this just inserts
 * a new classes row — no schema branching needed.
 */
export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const grade = parsed.data.grade.trim();
  const section = parsed.data.section.trim().toUpperCase();

  const supabase = createSupabaseAdminClient();

  // Idempotency: if (grade, section) already exists, return it instead
  // of erroring out — the admin gets the same end state either way.
  const { data: existing } = await supabase
    .from("classes")
    .select("id,grade,section")
    .eq("grade", grade)
    .eq("section", section)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ class: existing, created: false });
  }

  // Attach to the current academic year if one is set.
  const { data: year } = await supabase
    .from("academic_years")
    .select("id")
    .eq("is_current", true)
    .maybeSingle();

  const { data, error } = await supabase
    .from("classes")
    .insert({
      grade,
      section,
      academic_year_id: (year as { id: string } | null)?.id ?? null,
    })
    .select("id,grade,section")
    .single();

  if (error) {
    console.error("api/classes/sections POST", error);
    return NextResponse.json({ error: "Could not create section" }, { status: 500 });
  }
  return NextResponse.json({ class: data, created: true }, { status: 201 });
}
