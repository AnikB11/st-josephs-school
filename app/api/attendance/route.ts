import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTeacherContext, teacherIsClassTeacherOf } from "@/lib/teacher";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  const date = searchParams.get("date");

  if (!classId || !date) {
    return NextResponse.json({ error: "class_id and date are required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("id,student_id,status,notes")
    .eq("class_id", classId)
    .eq("date", date);

  if (error) { console.error("app/api/attendance/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ attendance: data });
}

const markSchema = z.object({
  class_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  marks: z
    .array(
      z.object({
        student_id: z.string().uuid(),
        status: z.enum(["present", "absent", "late", "excused"]),
        notes: z.string().max(500).optional().nullable(),
      }),
    )
    .min(1)
    .max(500),
});

export async function POST(req: Request) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = markSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { class_id, date, marks } = parsed.data;

  // If the caller is a teacher, ensure they're the class teacher
  if (user.dbUser?.role === "teacher") {
    const ctx = await getTeacherContext();
    if (!ctx || !teacherIsClassTeacherOf(ctx, class_id)) {
      return NextResponse.json(
        { error: "You are not the class teacher of this class." },
        { status: 403 },
      );
    }
  }

  // Verify every student_id in marks[] is actually enrolled in this class
  // - otherwise a caller could mark attendance for students in other classes.
  const supabaseCheck = createSupabaseAdminClient();
  const studentIds = marks.map((m) => m.student_id);
  const { data: classStudents } = await supabaseCheck
    .from("students")
    .select("id")
    .eq("class_id", class_id)
    .in("id", studentIds);
  const enrolledIds = new Set(
    ((classStudents as { id: string }[] | null) ?? []).map((s) => s.id),
  );
  const foreign = studentIds.filter((sid) => !enrolledIds.has(sid));
  if (foreign.length > 0) {
    return NextResponse.json(
      { error: "Some students are not enrolled in this class." },
      { status: 400 },
    );
  }

  const rows = marks.map((m) => ({
    student_id: m.student_id,
    class_id,
    date,
    status: m.status,
    notes: m.notes ?? null,
    marked_by: user.dbUser?.id ?? null,
  }));

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });

  if (error) { console.error("app/api/attendance/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "attendance.mark",
    entity_type: "class",
    entity_id: class_id,
    metadata: { date, count: rows.length },
  });

  return NextResponse.json({ ok: true, saved: rows.length });
}
