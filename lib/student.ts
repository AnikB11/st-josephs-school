import { cache } from "react";
import { getStudentSession } from "@/lib/student-session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StudentContext = {
  id: string;
  admission_number: string;
  full_name: string;
  roll_number: string | null;
  date_of_birth: string;
  gender: string | null;
  status: string;
  photo_url: string | null;
  class_id: string | null;
  classes: { grade: string; section: string } | null;
};

/**
 * Resolve the student record for the active student/parent JWT session.
 * Returns null when no session cookie is present or the session has expired.
 * Cached per request so multiple dashboard sections in the same render
 * share one DB roundtrip.
 */
export const getStudentForCurrentUser = cache(
  async function getStudentForCurrentUser(): Promise<StudentContext | null> {
    const session = await getStudentSession();
    if (!session) return null;

    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("students")
      .select(
        "id,admission_number,full_name,roll_number,date_of_birth,gender,status,photo_url,class_id,classes(grade,section)",
      )
      .eq("id", session.studentId)
      .maybeSingle();

    return (data as unknown as StudentContext | null) ?? null;
  },
);
