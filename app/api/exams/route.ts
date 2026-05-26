import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { currentAcademicYearLabel } from "@/lib/academic-year";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { console.error("app/api/exams/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ exams: data });
}

const createSchema = z.object({
  name: z.string().min(2).max(150),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Resolve current academic year
  const { data: year } = await supabase
    .from("academic_years")
    .select("id")
    .eq("year_label", currentAcademicYearLabel())
    .maybeSingle();

  const { data, error } = await supabase
    .from("exams")
    .insert({
      ...parsed.data,
      academic_year_id: (year as { id: string } | null)?.id ?? null,
    })
    .select()
    .single();

  if (error) { console.error("app/api/exams/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ exam: data }, { status: 201 });
}
