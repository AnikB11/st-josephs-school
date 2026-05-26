import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTeacherContext } from "@/lib/teacher";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  pdf_url: z.string().url().optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  max_marks: z.number().int().min(0).max(1000).optional().nullable(),
  is_published: z.boolean().optional(),
});

async function ownsAssignment(assignmentId: string, teacherId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("assignments")
    .select("teacher_id")
    .eq("id", assignmentId)
    .maybeSingle();
  return (data as { teacher_id: string | null } | null)?.teacher_id === teacherId;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  if (user.dbUser?.role === "teacher") {
    const tctx = await getTeacherContext();
    if (!tctx || !(await ownsAssignment(id, tctx.teacher.id))) {
      return NextResponse.json({ error: "Not your assignment" }, { status: 403 });
    }
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("assignments")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignment: data });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  if (user.dbUser?.role === "teacher") {
    const tctx = await getTeacherContext();
    if (!tctx || !(await ownsAssignment(id, tctx.teacher.id))) {
      return NextResponse.json({ error: "Not your assignment" }, { status: 403 });
    }
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
