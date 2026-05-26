import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTeacherContext, teacherCanAccess } from "@/lib/teacher";

export const dynamic = "force-dynamic";

/**
 * GET /api/assignments
 *   ?class_id=...   filter by class
 *   ?teacher=me     return only assignments created by the calling teacher
 *   ?student=me     return assignments visible to the calling student/parent
 */
export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user?.dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("class_id");
  const teacherFilter = searchParams.get("teacher");
  const studentFilter = searchParams.get("student");

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("assignments")
    .select(
      "id,title,description,pdf_url,due_date,max_marks,is_published,created_at,class_id,subject_id,teacher_id,classes(grade,section),subjects(name,code),teachers(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (classId) query = query.eq("class_id", classId);

  if (teacherFilter === "me") {
    const ctx = await getTeacherContext();
    if (!ctx) return NextResponse.json({ assignments: [] });
    query = query.eq("teacher_id", ctx.teacher.id);
  }

  if (studentFilter === "me") {
    // Resolve student via parent record (same approach as portal pages)
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("user_id", user.dbUser.id)
      .maybeSingle();
    if (!parent) return NextResponse.json({ assignments: [] });
    const { data: students } = await supabase
      .from("students")
      .select("class_id")
      .eq("parent_id", (parent as { id: string }).id)
      .eq("status", "active");
    const classIds = ((students as { class_id: string | null }[] | null) ?? [])
      .map((s) => s.class_id)
      .filter((c): c is string => Boolean(c));
    if (classIds.length === 0) return NextResponse.json({ assignments: [] });
    query = query.in("class_id", classIds).eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) { console.error("app/api/assignments/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ assignments: data });
}

const createSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid().optional().nullable(),
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional().nullable(),
  pdf_url: z.string().url().optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  max_marks: z.number().int().min(0).max(1000).optional().nullable(),
  is_published: z.boolean().default(true),
});

export async function POST(req: Request) {
  const user = await requireRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let teacherId: string | null = null;
  if (user.dbUser?.role === "teacher") {
    const ctx = await getTeacherContext();
    if (!ctx || !teacherCanAccess(ctx, parsed.data.class_id, parsed.data.subject_id)) {
      return NextResponse.json(
        { error: "You can only post assignments for your assigned class/subject." },
        { status: 403 },
      );
    }
    teacherId = ctx.teacher.id;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      ...parsed.data,
      teacher_id: teacherId,
    })
    .select()
    .single();

  if (error) { console.error("app/api/assignments/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ assignment: data }, { status: 201 });
}
