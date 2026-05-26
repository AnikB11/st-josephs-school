import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("teachers")
    .select(
      "id,full_name,invited_email,employee_code,phone,qualification,date_of_joining,is_active,photo_url,user_id,created_at",
    )
    .order("full_name", { ascending: true })
    .limit(200);

  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,invited_email.ilike.%${q}%,employee_code.ilike.%${q}%`,
    );
  }
  const { data, error } = await query;
  if (error) { console.error("app/api/teachers/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ teachers: data });
}

const createSchema = z.object({
  full_name: z.string().min(2).max(150),
  invited_email: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  employee_code: z.string().max(30).optional(),
  phone: z.string().max(30).optional(),
  qualification: z.string().max(200).optional(),
  date_of_joining: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  photo_url: z.string().url().optional().nullable(),
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
  const email = parsed.data.invited_email?.toLowerCase() ?? null;
  const employeeCode = parsed.data.employee_code?.trim() || null;

  // If invited_email already matches a registered user, link immediately and bump role.
  let userId: string | null = null;
  if (email) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id,role")
      .eq("email", email)
      .maybeSingle();
    if (existingUser) {
      userId = (existingUser as { id: string }).id;
      await supabase.from("users").update({ role: "teacher" }).eq("id", userId);
    }
  }

  // Seed Supabase Auth so the teacher can sign in immediately at
  // /teacher/login using their employee code as the initial password.
  // Skipped if either email or employee_code is missing, or if the auth
  // user already exists (no silent password resets).
  let authSeedError: string | null = null;
  if (email && employeeCode && !userId) {
    const { data: created, error: authErr } = await (supabase.auth as any).admin.createUser({
      email,
      password: employeeCode,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.full_name },
    });
    if (authErr) {
      // Most common reason: user already exists. Surface as a warning
      // but still create the teacher row so the admin isn't blocked.
      authSeedError = authErr.message;
    } else {
      const authUserId: string | undefined = created?.user?.id;
      if (authUserId) {
        const { data: upserted } = await supabase
          .from("users")
          .upsert(
            {
              auth_user_id: authUserId,
              email,
              full_name: parsed.data.full_name,
              role: "teacher",
            },
            { onConflict: "email" },
          )
          .select("id")
          .single();
        userId = (upserted as { id: string } | null)?.id ?? null;
      }
    }
  }

  const { data, error } = await supabase
    .from("teachers")
    .insert({
      ...parsed.data,
      invited_email: email,
      user_id: userId,
    })
    .select()
    .single();

  if (error) { console.error("app/api/teachers/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "teacher.create",
    entity_type: "teacher",
    entity_id: (data as { id: string }).id,
    metadata: { invited_email: parsed.data.invited_email ?? null },
  });

  return NextResponse.json(
    { teacher: data, ...(authSeedError ? { warning: authSeedError } : {}) },
    { status: 201 },
  );
}
