import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireRole(["admin", "parent"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("*, classes(grade, section), parents(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ student: data });
}

const updateSchema = z.object({
  full_name: z.string().min(2).max(150).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  roll_number: z.string().max(20).nullable().optional(),
  blood_group: z.string().max(10).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  photo_url: z.string().url().nullable().optional(),
  status: z.enum(["active", "promoted", "retained", "graduated", "transferred"]).optional(),
  class_id: z.string().uuid().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "student.update",
    entity_type: "student",
    entity_id: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ student: data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("students").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "student.delete",
    entity_type: "student",
    entity_id: id,
  });

  return NextResponse.json({ ok: true });
}
