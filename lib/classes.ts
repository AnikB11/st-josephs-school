import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * The current schema stores each (grade, section) pair as a single row
 * in `classes`. This module derives the academic hierarchy on top of that
 * existing data:
 *
 *   grade        (e.g. "10")
 *     └─ sections (each existing classes row with that grade)
 *          └─ students
 *
 * Keeping the schema flat means existing students, results, attendance,
 * and assignments keep working unchanged.
 */

export type SectionInfo = {
  id: string;             // classes.id
  section: string;        // "A", "B", ...
  classTeacherId: string | null;
  classTeacherName: string | null;
  studentCount: number;
};

export type GradeGroup = {
  grade: string;          // "10", "Nursery", "KG", ...
  sections: SectionInfo[];
  studentCount: number;
  sectionCount: number;
  classTeacherNames: string[];
};

const GRADE_ORDER = [
  "Nursery",
  "KG",
  ...Array.from({ length: 12 }, (_, i) => String(i + 1)),
];

function gradeSortKey(g: string): number {
  const idx = GRADE_ORDER.indexOf(g);
  return idx === -1 ? 99 : idx;
}

/**
 * Fetch every class row + active student counts + class-teacher names,
 * grouped by grade.
 */
export const getGradeGroups = cache(async function getGradeGroups(): Promise<
  GradeGroup[]
> {
  const supabase = createSupabaseAdminClient();

  // 1. All class rows. We deliberately avoid joining teachers→users in one
  //    statement: PostgREST's schema cache can't resolve `teachers.user_id`
  //    → `users.id` when the FK isn't explicitly declared, which silently
  //    makes the whole class query return null. Splitting into two queries
  //    is robust against that.
  const { data: classRows } = await supabase
    .from("classes")
    .select("id,grade,section,class_teacher_id");
  type ClassRow = {
    id: string;
    grade: string;
    section: string;
    class_teacher_id: string | null;
  };
  const classes = (classRows as ClassRow[] | null) ?? [];

  // Look up teacher names for the class teachers referenced above.
  const teacherIds = classes
    .map((c) => c.class_teacher_id)
    .filter((id): id is string => Boolean(id));
  const teacherNameById = new Map<string, string>();
  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from("teachers")
      .select("id,user_id")
      .in("id", teacherIds);
    type TeacherRow = { id: string; user_id: string | null };
    const teacherRows = (teachers as TeacherRow[] | null) ?? [];
    const userIds = teacherRows
      .map((t) => t.user_id)
      .filter((u): u is string => Boolean(u));
    const userNameById = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id,full_name")
        .in("id", userIds);
      for (const u of (users as { id: string; full_name: string | null }[] | null) ?? []) {
        if (u.full_name) userNameById.set(u.id, u.full_name);
      }
    }
    for (const t of teacherRows) {
      if (t.user_id) {
        const name = userNameById.get(t.user_id);
        if (name) teacherNameById.set(t.id, name);
      }
    }
  }

  // 2. Active student counts per class_id. Done in one round-trip with
  //    an aggregate-by-class_id RPC isn't worth setting up — supabase-js
  //    doesn't support GROUP BY directly, so we count per class with a
  //    single pull and a JS group.
  const { data: studentRows } = await supabase
    .from("students")
    .select("class_id")
    .neq("status", "graduated")
    .neq("status", "transferred");
  const studentsByClass = new Map<string, number>();
  for (const s of (studentRows as { class_id: string | null }[] | null) ?? []) {
    if (!s.class_id) continue;
    studentsByClass.set(s.class_id, (studentsByClass.get(s.class_id) ?? 0) + 1);
  }

  // 3. Bucket classes by grade.
  const byGrade = new Map<string, SectionInfo[]>();
  for (const c of classes) {
    const teacherName = c.class_teacher_id
      ? teacherNameById.get(c.class_teacher_id) ?? null
      : null;
    const info: SectionInfo = {
      id: c.id,
      section: c.section,
      classTeacherId: c.class_teacher_id,
      classTeacherName: teacherName,
      studentCount: studentsByClass.get(c.id) ?? 0,
    };
    if (!byGrade.has(c.grade)) byGrade.set(c.grade, []);
    byGrade.get(c.grade)!.push(info);
  }

  // 4. Sort sections within each grade alphabetically.
  const groups: GradeGroup[] = [];
  for (const [grade, sections] of byGrade.entries()) {
    sections.sort((a, b) => a.section.localeCompare(b.section));
    const teacherNames = sections
      .map((s) => s.classTeacherName)
      .filter((n): n is string => Boolean(n));
    groups.push({
      grade,
      sections,
      studentCount: sections.reduce((sum, s) => sum + s.studentCount, 0),
      sectionCount: sections.length,
      classTeacherNames: Array.from(new Set(teacherNames)),
    });
  }

  // 5. Sort grades in academic order.
  groups.sort((a, b) => gradeSortKey(a.grade) - gradeSortKey(b.grade));
  return groups;
});

export async function getGradeGroup(grade: string): Promise<GradeGroup | null> {
  const groups = await getGradeGroups();
  return groups.find((g) => g.grade === grade) ?? null;
}

/** Total students across all classes (for the index summary). */
export async function getTotalActiveStudents(): Promise<number> {
  const groups = await getGradeGroups();
  return groups.reduce((sum, g) => sum + g.studentCount, 0);
}
