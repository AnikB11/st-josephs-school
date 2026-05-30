import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const schema = z.object({
  full_name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  graduation_year: z.number().int().min(1900).max(3000),
  current_position: z.string().max(150).optional().nullable(),
  current_company: z.string().max(150).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  linkedin_url: z.string().url().optional().nullable(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { password, ...profile } = parsed.data;
  const email = profile.email.toLowerCase();

  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("alumni")
    .select("id,status")
    .ilike("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "An alumni request with this email already exists." },
      { status: 409 },
    );
  }

  // Create the Supabase auth user up front so the password lives in
  // auth.users (hashed by Supabase) and never in our schema. The user can
  // technically sign in immediately, but the (authed) layout gates access
  // on alumni.status = 'approved' and routes pending users to the wait page.
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: profile.full_name, intent: "alumni" },
  });
  if (authError || !created?.user) {
    if ((authError?.message ?? "").toLowerCase().includes("already")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 },
      );
    }
    console.error("app/api/alumni/request/route.ts auth create", authError);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("alumni").insert({
    ...profile,
    email,
    is_public: false,
    status: "pending",
    requested_at: new Date().toISOString(),
  });
  if (insertError) {
    await supabase.auth.admin.deleteUser(created.user.id).catch(() => {});
    console.error("app/api/alumni/request/route.ts insert", insertError);
    return NextResponse.json({ error: "Could not submit request." }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    actor_id: null,
    action: "alumni.request",
    entity_type: "alumni",
    entity_id: null,
    metadata: { email },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
