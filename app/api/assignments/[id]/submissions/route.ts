import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTeacherContext } from "@/lib/teacher";

export const dynamic = "force-dynamic";

/**
 * GET /api/assignments/[id]/submissions
 * - Teachers/admins see all submissions for the assignment.
 * - Students see their own submission only.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user?.dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = createSupabaseAdminClient();

  if (user.dbUser.role === "admin" || user.dbUser.role === "teacher") {
    // Teacher must own the assignment
    if (user.dbUser.role === "teacher") {
      const tctx = await getTeacherContext();
      const { data: a } = await supabase
        .from("assignments")
        .select("teacher_id")
        .eq("id", id)
        .maybeSingle();
      if (!tctx || (a as { teacher_id: string | null } | null)?.teacher_id !== tctx.teacher.id) {
        return NextResponse.json({ error: "Not your assignment" }, { status: 403 });
      }
    }
    const { data } = await supabase
      .from("assignment_submissions")
      .select(
        "id,pdf_url,remarks,marks_obtained,status,submitted_at,graded_at,students(id,full_name,admission_number,roll_number)",
      )
      .eq("assignment_id", id)
      .order("submitted_at", { ascending: true });
    return NextResponse.json({ submissions: data ?? [] });
  }

  // Parent/student: return only their child's submission
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.dbUser.id)
    .maybeSingle();
  if (!parent) return NextResponse.json({ submissions: [] });

  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("parent_id", (parent as { id: string }).id);
  const studentIds = ((students as { id: string }[] | null) ?? []).map((s) => s.id);
  if (studentIds.length === 0) return NextResponse.json({ submissions: [] });

  const { data } = await supabase
    .from("assignment_submissions")
    .select("id,pdf_url,remarks,marks_obtained,status,submitted_at,graded_at,student_id")
    .eq("assignment_id", id)
    .in("student_id", studentIds);
  return NextResponse.json({ submissions: data ?? [] });
}

const submitSchema = z.object({
  pdf_url: z.string().url(),
  remarks: z.string().max(2000).optional().nullable(),
  student_id: z.string().uuid(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user?.dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Verify the student belongs to the calling parent's children
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.dbUser.id)
    .maybeSingle();
  if (!parent) {
    return NextResponse.json({ error: "No parent linkage" }, { status: 403 });
  }
  const { data: student } = await supabase
    .from("students")
    .select("id,class_id")
    .eq("id", parsed.data.student_id)
    .eq("parent_id", (parent as { id: string }).id)
    .maybeSingle();
  if (!student) {
    return NextResponse.json({ error: "Not your student" }, { status: 403 });
  }

  // Verify the assignment is for the student's class
  const { data: assignment } = await supabase
    .from("assignments")
    .select("class_id,is_published")
    .eq("id", id)
    .maybeSingle();
  if (
    !assignment ||
    !(assignment as { is_published: boolean }).is_published ||
    (assignment as { class_id: string }).class_id !== (student as { class_id: string }).class_id
  ) {
    return NextResponse.json(
      { error: "Assignment is not available for this student" },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("assignment_submissions")
    .upsert(
      {
        assignment_id: id,
        student_id: parsed.data.student_id,
        pdf_url: parsed.data.pdf_url,
        remarks: parsed.data.remarks ?? null,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "assignment_id,student_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submission: data }, { status: 201 });
}

const gradeSchema = z.object({
  submission_id: z.string().uuid(),
  marks_obtained: z.number().int().min(0).max(1000),
  remarks: z.string().max(2000).optional().nullable(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: assignmentId } = await ctx.params;
  const body = await req.json();
  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (user.dbUser?.role === "teacher") {
    const tctx = await getTeacherContext();
    const { data: a } = await supabase
      .from("assignments")
      .select("teacher_id")
      .eq("id", assignmentId)
      .maybeSingle();
    if (!tctx || (a as { teacher_id: string | null } | null)?.teacher_id !== tctx.teacher.id) {
      return NextResponse.json({ error: "Not your assignment" }, { status: 403 });
    }
  }

  const { data, error } = await supabase
    .from("assignment_submissions")
    .update({
      marks_obtained: parsed.data.marks_obtained,
      remarks: parsed.data.remarks ?? null,
      status: "graded",
      graded_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.submission_id)
    .eq("assignment_id", assignmentId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submission: data });
}
