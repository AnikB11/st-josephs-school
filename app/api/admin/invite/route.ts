import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/constants";

const VALID_ROLES: Role[] = ["admin", "teacher", "parent", "student", "alumni"];

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await requireRole("admin");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, fullName, role } = (body ?? {}) as {
    email?: string;
    fullName?: string;
    role?: string;
  };

  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanRole = String(role ?? "parent") as Role;
  const cleanName = String(fullName ?? "").trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(cleanRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const redirectTo = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }/reset-password`;

  // 1) Create the auth.users row and send the invite email in one call.
  //    Supabase deduplicates by email, so re-inviting just resends.
  const { data: invited, error: inviteErr } = await (supabase.auth as any).admin.inviteUserByEmail(
    cleanEmail,
    {
      redirectTo,
      data: cleanName ? { full_name: cleanName } : undefined,
    },
  );

  if (inviteErr) {
    return NextResponse.json({ error: inviteErr.message }, { status: 500 });
  }

  const authUserId: string | undefined = invited?.user?.id;

  // 2) Mirror the auth row into public.users so RLS and the rest of the app
  //    can resolve the role immediately on first login.
  if (authUserId) {
    const { error: upsertErr } = await supabase
      .from("users")
      .upsert(
        {
          auth_user_id: authUserId,
          email: cleanEmail,
          full_name: cleanName || cleanEmail,
          role: cleanRole,
        },
        { onConflict: "email" },
      );
    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, email: cleanEmail });
}
