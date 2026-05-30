import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTeacherContext, teacherCanAccess } from "@/lib/teacher";
import { deleteFromCloudinary, publicIdFromUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const REPORT_CARD_SUBJECT_NAME = "Report Card";

/**
 * Look up (or auto-create) the sentinel "Report Card" subject. The results
 * table requires subject_id; for the PDF-upload flow every per-(student, exam)
 * row points at this single sentinel row so the unique
 * (student_id, exam_id, subject_id) constraint still holds.
 */
async function getOrCreateReportCardSubjectId(): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("subjects")
    .select("id")
    .eq("name", REPORT_CARD_SUBJECT_NAME)
    .is("grade", null)
    .maybeSingle();
  if (existing) return (existing as { id: string }).id;

  const { data: created, error } = await supabase
    .from("subjects")
    .insert({ name: REPORT_CARD_SUBJECT_NAME, code: "RC", max_marks: 0, grade: null })
    .select("id")
    .single();
  if (error || !created) return null;
  return (created as { id: string }).id;
}

const upsertSchema = z.object({
  exam_id: z.string().uuid(),
  student_id: z.string().uuid(),
  pdf_url: z.string().url(),
});

export async function POST(req: Request) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { exam_id, student_id, pdf_url } = parsed.data;

  const supabase = createSupabaseAdminClient();

  // Teachers can only upload for classes they're assigned to.
  if (user.dbUser?.role === "teacher") {
    const ctx = await getTeacherContext();
    if (!ctx) return NextResponse.json({ error: "No teacher profile" }, { status: 403 });
    const { data: student } = await supabase
      .from("students")
      .select("class_id")
      .eq("id", student_id)
      .maybeSingle();
    const classId = (student as { class_id: string } | null)?.class_id;
    if (!classId || !teacherCanAccess(ctx, classId)) {
      return NextResponse.json(
        { error: "You are not assigned to this student's class." },
        { status: 403 },
      );
    }
  }

  const subjectId = await getOrCreateReportCardSubjectId();
  if (!subjectId) {
    return NextResponse.json({ error: "Could not provision result schema" }, { status: 500 });
  }

  const { data: existing } = await supabase
    .from("results")
    .select("id, pdf_url")
    .eq("exam_id", exam_id)
    .eq("student_id", student_id)
    .eq("subject_id", subjectId)
    .maybeSingle();

  const oldPdfUrl = (existing as { pdf_url: string | null } | null)?.pdf_url ?? null;

  const { error } = await supabase
    .from("results")
    .upsert(
      {
        exam_id,
        student_id,
        subject_id: subjectId,
        marks_obtained: 0,
        max_marks: 0,
        grade: null,
        remarks: null,
        status: "draft" as const,
        pdf_url,
        published_at: null,
      },
      { onConflict: "student_id,exam_id,subject_id" },
    );

  if (error) {
    console.error("app/api/results/pdf/route.ts upsert", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  // Best-effort: delete the previous Cloudinary asset if it was replaced.
  if (oldPdfUrl && oldPdfUrl !== pdf_url) {
    const oldPublicId = publicIdFromUrl(oldPdfUrl);
    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId);
      } catch {
        /* ignore — orphan is preferable to a 500 here */
      }
    }
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "results.pdf.upsert",
    entity_type: "exam",
    entity_id: exam_id,
    metadata: { student_id },
  });

  revalidateTag("public-results");

  return NextResponse.json({ ok: true });
}

const deleteSchema = z.object({
  exam_id: z.string().uuid(),
  student_id: z.string().uuid(),
});

export async function DELETE(req: Request) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = deleteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { exam_id, student_id } = parsed.data;

  const supabase = createSupabaseAdminClient();

  if (user.dbUser?.role === "teacher") {
    const ctx = await getTeacherContext();
    if (!ctx) return NextResponse.json({ error: "No teacher profile" }, { status: 403 });
    const { data: student } = await supabase
      .from("students")
      .select("class_id")
      .eq("id", student_id)
      .maybeSingle();
    const classId = (student as { class_id: string } | null)?.class_id;
    if (!classId || !teacherCanAccess(ctx, classId)) {
      return NextResponse.json({ error: "Not assigned to this class." }, { status: 403 });
    }
  }

  const subjectId = await getOrCreateReportCardSubjectId();
  if (!subjectId) {
    return NextResponse.json({ ok: true });
  }

  const { data: existing } = await supabase
    .from("results")
    .select("pdf_url")
    .eq("exam_id", exam_id)
    .eq("student_id", student_id)
    .eq("subject_id", subjectId)
    .maybeSingle();

  const pdfUrl = (existing as { pdf_url: string | null } | null)?.pdf_url ?? null;

  const { error } = await supabase
    .from("results")
    .delete()
    .eq("exam_id", exam_id)
    .eq("student_id", student_id)
    .eq("subject_id", subjectId);
  if (error) {
    console.error("app/api/results/pdf/route.ts delete", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  if (pdfUrl) {
    const publicId = publicIdFromUrl(pdfUrl);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch {
        /* ignore */
      }
    }
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "results.pdf.delete",
    entity_type: "exam",
    entity_id: exam_id,
    metadata: { student_id },
  });

  revalidateTag("public-results");

  return NextResponse.json({ ok: true });
}
