import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireRole("admin");
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = markSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { class_id, date, marks } = parsed.data;
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "attendance.mark",
    entity_type: "class",
    entity_id: class_id,
    metadata: { date, count: rows.length },
  });

  return NextResponse.json({ ok: true, saved: rows.length });
}
