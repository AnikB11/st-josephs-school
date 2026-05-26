import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SCHOOL } from "@/lib/constants";
import { currentAcademicYearLabel } from "@/lib/academic-year";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("students")
    .select(
      "id,admission_number,roll_number,full_name,date_of_birth,gender,status,admission_date,class_id,photo_url",
    )
    .limit(200);
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,admission_number.ilike.%${q}%`);
  }
  const { data, error } = await query.order("admission_number", { ascending: false });

  if (error) { console.error("app/api/students/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ students: data });
}

const createSchema = z.object({
  full_name: z.string().min(2).max(150),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female", "other"]).optional(),
  grade: z.string().min(1).max(20),
  section: z.string().min(1).max(20).default("A"),
  roll_number: z.string().max(20).optional(),
  blood_group: z.string().max(10).optional(),
  address: z.string().max(500).optional(),
  photo_url: z.string().url().optional().nullable(),
  // Either link to an existing parent, or create inline:
  parent_id: z.string().uuid().optional(),
  parent: z
    .object({
      full_name: z.string().min(2).max(150),
      email: z.string().email().optional().or(z.literal("")).transform((v) => v || undefined),
      phone: z.string().max(30).optional(),
      occupation: z.string().max(100).optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const input = parsed.data;

  // 1. Resolve academic year (current)
  const yearLabel = currentAcademicYearLabel();
  const { data: yearRow } = await supabase
    .from("academic_years")
    .select("id")
    .eq("year_label", yearLabel)
    .maybeSingle();

  let academicYearId = (yearRow as { id: string } | null)?.id;
  if (!academicYearId) {
    const startYear = parseInt(yearLabel.slice(0, 4), 10);
    const { data: created } = await supabase
      .from("academic_years")
      .insert({
        year_label: yearLabel,
        start_date: `${startYear}-04-01`,
        end_date: `${startYear + 1}-03-31`,
        is_current: true,
      })
      .select("id")
      .single();
    academicYearId = (created as { id: string }).id;
  }

  // 2. Resolve (or create) class for grade+section in current year
  const { data: classRow } = await supabase
    .from("classes")
    .select("id")
    .eq("grade", input.grade)
    .eq("section", input.section)
    .eq("academic_year_id", academicYearId)
    .maybeSingle();

  let classId = (classRow as { id: string } | null)?.id;
  if (!classId) {
    const { data: createdClass, error: classErr } = await supabase
      .from("classes")
      .insert({
        grade: input.grade,
        section: input.section,
        academic_year_id: academicYearId,
      })
      .select("id")
      .single();
    if (classErr) {
      return NextResponse.json({ error: classErr.message }, { status: 500 });
    }
    classId = (createdClass as { id: string }).id;
  }

  // 3. Resolve (or create) parent
  let parentId = input.parent_id;
  if (!parentId && input.parent) {
    const { data: createdParent, error: parentErr } = await supabase
      .from("parents")
      .insert(input.parent)
      .select("id")
      .single();
    if (parentErr) {
      return NextResponse.json({ error: parentErr.message }, { status: 500 });
    }
    parentId = (createdParent as { id: string }).id;
  }

  // 4. Generate admission number (with retry for collisions)
  let admissionNumber: string | null = null;
  let student: Record<string, unknown> | null = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const { data: genNumber, error: rpcErr } = await supabase.rpc(
      "generate_admission_number",
      { prefix: SCHOOL.admissionPrefix },
    );
    if (rpcErr) {
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }
    admissionNumber = genNumber as string;

    // 5. Insert student
    const { data: insertedStudent, error: studentErr } = await supabase
      .from("students")
      .insert({
        admission_number: admissionNumber,
        full_name: input.full_name,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        class_id: classId,
        parent_id: parentId,
        roll_number: input.roll_number,
        blood_group: input.blood_group,
        address: input.address,
        photo_url: input.photo_url,
        status: "active",
        admission_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (studentErr) {
      // If duplicate admission number, retry with next sequence value
      if (studentErr.message.includes("duplicate") || studentErr.code === "23505") {
        attempts++;
        continue;
      }
      return NextResponse.json({ error: studentErr.message }, { status: 500 });
    }

    student = insertedStudent as Record<string, unknown>;
    break;
  }

  if (!student) {
    return NextResponse.json(
      { error: "Could not generate a unique admission number after multiple attempts. Please try again." },
      { status: 500 },
    );
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "student.create",
    entity_type: "student",
    entity_id: student.id as string,
    metadata: { admission_number: student.admission_number as string },
  });

  return NextResponse.json({ student }, { status: 201 });
}
