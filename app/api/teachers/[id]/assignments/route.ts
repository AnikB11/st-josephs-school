import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const assignSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid().optional().nullable(),
  is_class_teacher: z.boolean().default(false),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: teacherId } = await ctx.params;
  const body = await req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // If marking class teacher, ensure no other teacher holds that flag for the class
  if (parsed.data.is_class_teacher) {
    await supabase
      .from("teacher_assignments")
      .update({ is_class_teacher: false })
      .eq("class_id", parsed.data.class_id);
  }

  const { data, error } = await supabase
    .from("teacher_assignments")
    .insert({
      teacher_id: teacherId,
      class_id: parsed.data.class_id,
      subject_id: parsed.data.subject_id ?? null,
      is_class_teacher: parsed.data.is_class_teacher,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignment: data }, { status: 201 });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: teacherId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignment_id");
  if (!assignmentId) {
    return NextResponse.json({ error: "assignment_id is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("teacher_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("teacher_id", teacherId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
