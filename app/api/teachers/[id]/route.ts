import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("id,is_class_teacher,classes(id,grade,section),subjects(id,name,code)")
    .eq("teacher_id", id);

  return NextResponse.json({ teacher: data, assignments: assignments ?? [] });
}

const patchSchema = z.object({
  full_name: z.string().min(2).max(150).optional(),
  invited_email: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  employee_code: z.string().max(30).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  qualification: z.string().max(200).optional().nullable(),
  date_of_joining: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_active: z.boolean().optional(),
  photo_url: z.string().url().optional().nullable(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const update: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() };
  if (parsed.data.invited_email !== undefined) {
    update.invited_email = parsed.data.invited_email?.toLowerCase() ?? null;
  }

  const { data, error } = await supabase
    .from("teachers")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "teacher.update",
    entity_type: "teacher",
    entity_id: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ teacher: data });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = createSupabaseAdminClient();

  // If teacher had a linked user, demote them back to parent
  const { data: teacher } = await supabase
    .from("teachers")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();
  const userId = (teacher as { user_id: string | null } | null)?.user_id;

  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (userId) {
    await supabase.from("users").update({ role: "parent" }).eq("id", userId);
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "teacher.delete",
    entity_type: "teacher",
    entity_id: id,
  });

  return NextResponse.json({ ok: true });
}
