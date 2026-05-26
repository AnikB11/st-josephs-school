import { cache } from "react";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type TeacherAssignmentRow = {
  id: string;
  class_id: string;
  subject_id: string | null;
  is_class_teacher: boolean;
  classes: { id: string; grade: string; section: string } | null;
  subjects: { id: string; name: string; code: string | null; max_marks: number } | null;
};

export type TeacherContext = {
  teacher: {
    id: string;
    full_name: string;
    invited_email: string | null;
    photo_url: string | null;
    employee_code: string | null;
    qualification: string | null;
  };
  assignments: TeacherAssignmentRow[];
};

/**
 * Resolve the current teacher record + their class/subject assignments.
 * Returns null when the user has no linked teacher row.
 */
export const getTeacherContext = cache(async function getTeacherContext(): Promise<TeacherContext | null> {
  const user = await getAuthUser();
  if (!user?.dbUser?.id) return null;

  const admin = createSupabaseAdminClient();

  // Look up by linked user_id first, fall back to invited_email match
  let teacher: TeacherContext["teacher"] | null = null;
  {
    const { data } = await admin
      .from("teachers")
      .select("id,full_name,invited_email,photo_url,employee_code,qualification")
      .eq("user_id", user.dbUser.id)
      .maybeSingle();
    teacher = (data as TeacherContext["teacher"] | null) ?? null;
  }

  if (!teacher && user.dbUser.email) {
    const { data } = await admin
      .from("teachers")
      .select("id,full_name,invited_email,photo_url,employee_code,qualification")
      .eq("invited_email", user.dbUser.email.toLowerCase())
      .maybeSingle();
    teacher = (data as TeacherContext["teacher"] | null) ?? null;
  }

  if (!teacher) return null;

  const { data: assignments } = await admin
    .from("teacher_assignments")
    .select("id,class_id,subject_id,is_class_teacher,classes(id,grade,section),subjects(id,name,code,max_marks)")
    .eq("teacher_id", teacher.id);

  return {
    teacher,
    assignments: (assignments as unknown as TeacherAssignmentRow[] | null) ?? [],
  };
});

/**
 * Whether the given teacher is assigned to (class_id, subject_id?).
 * If subject_id is omitted, returns true when the teacher teaches any subject
 * in the class OR is the class teacher.
 */
export function teacherCanAccess(
  ctx: TeacherContext,
  classId: string,
  subjectId?: string | null,
): boolean {
  return ctx.assignments.some((a) => {
    if (a.class_id !== classId) return false;
    if (!subjectId) return true;
    return a.subject_id === subjectId;
  });
}

export function teacherIsClassTeacherOf(ctx: TeacherContext, classId: string): boolean {
  return ctx.assignments.some((a) => a.class_id === classId && a.is_class_teacher);
}
