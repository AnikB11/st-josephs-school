import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const grade = searchParams.get("grade");

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });
  if (grade) {
    query = query.or(`grade.is.null,grade.eq.${grade}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subjects: data });
}

const createSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().max(20).optional().nullable(),
  grade: z.string().max(20).optional().nullable(),
  max_marks: z.number().int().min(1).max(1000).default(100),
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
  const { data, error } = await supabase.from("subjects").insert(parsed.data).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subject: data }, { status: 201 });
}
