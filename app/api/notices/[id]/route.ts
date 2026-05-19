import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  body: z.string().max(10000).nullable().optional(),
  category: z.enum(["general", "academic", "event", "urgent", "holiday"]).optional(),
  audience: z.enum(["all", "parents", "students", "alumni", "staff"]).optional(),
  pdf_url: z.string().url().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  is_pinned: z.boolean().optional(),
  archived_at: z.string().datetime().nullable().optional(),
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
    .from("notices")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: parsed.data.archived_at !== undefined ? "notice.archive" : "notice.update",
    entity_type: "notice",
    entity_id: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ notice: data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "notice.delete",
    entity_type: "notice",
    entity_id: id,
  });

  return NextResponse.json({ ok: true });
}
