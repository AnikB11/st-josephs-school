import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTeacherContext, teacherCanAccess } from "@/lib/teacher";

export const dynamic = "force-dynamic";

const publishSchema = z.object({
  exam_id: z.string().uuid(),
  class_id: z.string().uuid().optional(),
  unpublish: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = publishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { exam_id, class_id, unpublish } = parsed.data;

  // Teachers can only publish for classes where they hold any assignment
  if (user.dbUser?.role === "teacher") {
    if (!class_id) {
      return NextResponse.json(
        { error: "Teachers must specify a class when publishing." },
        { status: 400 },
      );
    }
    const ctx = await getTeacherContext();
    if (!ctx || !teacherCanAccess(ctx, class_id)) {
      return NextResponse.json(
        { error: "You don't have an assignment in this class." },
        { status: 403 },
      );
    }
  }
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
    .eq("exam_id", exam_id)
    // Only PDF result rows (the current upload flow). Legacy per-subject
    // mark rows without a pdf_url are left untouched.
    .not("pdf_url", "is", null);
  if (studentIds) q = q.in("student_id", studentIds);

  const { data, error } = await q.select("id");
  if (error) { console.error("app/api/results/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: unpublish ? "results.unpublish" : "results.publish",
    entity_type: "exam",
    entity_id: exam_id,
    metadata: { class_id, count: data?.length ?? 0 },
  });

  // Bust the public /results page's lookup cache so the next viewer sees
  // the new state immediately instead of waiting on the 30s TTL.
  revalidateTag("public-results");

  return NextResponse.json({ ok: true, updated: data?.length ?? 0 });
}
