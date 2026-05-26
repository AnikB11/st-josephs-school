import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Admin-only. Re-syncs a teacher's Supabase Auth credentials so they can
 * sign in at /teacher/login with their email + employee code.
 *
 * Handles all three broken states from the legacy flow:
 *   1. auth.users row exists  → updates password to employee_code
 *   2. auth.users row missing → creates one with employee_code as password
 *   3. public.users row out of sync → upserts auth_user_id + role=teacher and
 *      links teachers.user_id
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("admin");
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: teacher, error: teacherErr } = await admin
    .from("teachers")
    .select("id,full_name,invited_email,employee_code")
    .eq("id", id)
    .single();

  if (teacherErr || !teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const t = teacher as {
    id: string;
    full_name: string;
    invited_email: string | null;
    employee_code: string | null;
  };
  const email = t.invited_email?.toLowerCase().trim() ?? null;
  const password = t.employee_code?.trim() || null;

  if (!email) {
    return NextResponse.json(
      { error: "Teacher has no email on file. Edit the teacher first." },
      { status: 400 },
    );
  }
  if (!password) {
    return NextResponse.json(
      { error: "Teacher has no employee code on file. Edit the teacher first." },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Employee code must be at least 6 characters to use as a password." },
      { status: 400 },
    );
  }

  // 1) Find existing auth user by email. listUsers is the only way the
  //    SSR client exposes; for 800 users a single page is plenty.
  const { data: list, error: listErr } = await (admin.auth as any).admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }
  const existing = (list?.users ?? []).find(
    (u: { email?: string | null }) => u.email?.toLowerCase() === email,
  );

  let authUserId: string;
  if (existing) {
    const { error: updateErr } = await (admin.auth as any).admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { ...(existing.user_metadata ?? {}), full_name: t.full_name },
    });
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
    authUserId = existing.id;
  } else {
    const { data: created, error: createErr } = await (admin.auth as any).admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: t.full_name },
    });
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    authUserId = created?.user?.id;
    if (!authUserId) {
      return NextResponse.json({ error: "Auth user created but no id returned" }, { status: 500 });
    }
  }

  // 2) Mirror into public.users
  const { data: pubUser, error: upsertErr } = await admin
    .from("users")
    .upsert(
      {
        auth_user_id: authUserId,
        email,
        full_name: t.full_name,
        role: "teacher",
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();
  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  // 3) Link teachers.user_id
  await admin
    .from("teachers")
    .update({ user_id: (pubUser as { id: string }).id })
    .eq("id", t.id);

  await admin.from("audit_logs").insert({
    actor_id: actor.dbUser?.id ?? null,
    action: "teacher.reset_password",
    entity_type: "teacher",
    entity_id: t.id,
    metadata: { email },
  });

  return NextResponse.json({ ok: true, email });
}
