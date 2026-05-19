import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function letterGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

const upsertSchema = z.object({
  exam_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  class_id: z.string().uuid(),
  marks: z
    .array(
      z.object({
        student_id: z.string().uuid(),
        marks_obtained: z.number().min(0).max(1000),
        max_marks: z.number().min(1).max(1000).default(100),
        remarks: z.string().max(500).optional().nullable(),
      }),
    )
    .min(1)
    .max(500),
});

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { exam_id, subject_id, marks } = parsed.data;
  const rows = marks.map((m) => ({
    exam_id,
    subject_id,
    student_id: m.student_id,
    marks_obtained: m.marks_obtained,
    max_marks: m.max_marks,
    grade: letterGrade((m.marks_obtained / m.max_marks) * 100),
    remarks: m.remarks ?? null,
    status: "draft" as const,
  }));

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("results")
    .upsert(rows, { onConflict: "student_id,exam_id,subject_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "results.upsert",
    entity_type: "exam",
    entity_id: exam_id,
    metadata: { subject_id, count: rows.length },
  });

  return NextResponse.json({ ok: true, saved: rows.length });
}

const publishSchema = z.object({
  exam_id: z.string().uuid(),
  class_id: z.string().uuid().optional(),
  unpublish: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = publishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { exam_id, class_id, unpublish } = parsed.data;
  const supabase = createSupabaseAdminClient();

  // If filtering by class, restrict to students in that class
  let studentIds: string[] | undefined;
  if (class_id) {
    const { data: students } = await supabase
      .from("students")
      .select("id")
      .eq("class_id", class_id);
    studentIds = ((students as { id: string }[] | null) ?? []).map((s) => s.id);
    if (studentIds.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 });
    }
  }

  let q = supabase
    .from("results")
    .update(
      unpublish
        ? { status: "draft", published_at: null }
        : { status: "published", published_at: new Date().toISOString() },
    )
    .eq("exam_id", exam_id);
  if (studentIds) q = q.in("student_id", studentIds);

  const { data, error } = await q.select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: unpublish ? "results.unpublish" : "results.publish",
    entity_type: "exam",
    entity_id: exam_id,
    metadata: { class_id, count: data?.length ?? 0 },
  });

  return NextResponse.json({ ok: true, updated: data?.length ?? 0 });
}
