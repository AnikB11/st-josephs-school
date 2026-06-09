import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/constants";
import type { User as DbUser } from "@/types/database";

export type AuthUser = {
  authId: string;
  email: string;
  dbUser: DbUser | null;
};

const LOCAL_ADMIN: AuthUser = {
  authId: "local-dev",
  email: "aniketbasnett20@gmail.com",
  dbUser: {
    role: "admin",
    id: null,
    auth_user_id: null,
    clerk_id: null,
    email: "aniketbasnett20@gmail.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    full_name: "Local Admin",
    avatar_url: null,
    phone: null,
  } as unknown as DbUser,
};

/**
 * Get the signed-in Supabase auth user + their mapped public.users row
 * (with role). Auto-creates the public.users row on first call and
 * links any pre-invited teacher record.
 *
 * Dev-mode behaviour: if there's no real Supabase session, fall back to
 * a fake "Local Admin" so unauthenticated pages stay instant. But if the
 * user actually signed in (e.g. testing the alumni flow), respect their
 * real identity.
 */
export const getAuthUser = cache(async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    if (process.env.NODE_ENV === "development") return LOCAL_ADMIN;
    return null;
  }

  const admin = createSupabaseAdminClient();
  const email = (authUser.email ?? "").toLowerCase();

  const { data: existing } = await admin
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (existing) {
    return { authId: authUser.id, email, dbUser: existing as DbUser };
  }

  // No public.users row yet — bootstrap one. Order of precedence for the
  // initial role: bootstrap admin email > pre-invited teacher > approved
  // alumni request > default parent.
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ||
    (authUser.user_metadata?.name as string | undefined) ||
    email;

  const { data: invitedTeacher } = await admin
    .from("teachers")
    .select("id")
    .eq("invited_email", email)
    .is("user_id", null)
    .maybeSingle();

  const { data: approvedAlumni } = await admin
    .from("alumni")
    .select("id, status")
    .ilike("email", email)
    .maybeSingle();

  let role: Role = "parent";
  if (bootstrapEmail && email === bootstrapEmail) role = "admin";
  else if (invitedTeacher) role = "teacher";
  else if ((approvedAlumni as { status?: string } | null)?.status === "approved") role = "alumni";

  const { data: created } = await admin
    .from("users")
    .insert({
      auth_user_id: authUser.id,
      email,
      full_name: fullName,
      avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
      role,
    })
    .select()
    .single();

  const newUserId = (created as { id: string } | null)?.id ?? null;

  if (invitedTeacher && newUserId) {
    await admin
      .from("teachers")
      .update({ user_id: newUserId })
      .eq("id", (invitedTeacher as { id: string }).id);
  }

  if (approvedAlumni && newUserId) {
    await admin
      .from("alumni")
      .update({ user_id: newUserId })
      .eq("id", (approvedAlumni as { id: string }).id);
  }

  return { authId: authUser.id, email, dbUser: (created as DbUser | null) ?? null };
});

export async function requireRole(role: Role | Role[]): Promise<AuthUser | null> {
  // BYPASS FOR LOCAL DEV — admin/teacher pages are always reachable in dev
  // regardless of whatever Supabase session might be active (e.g. you're
  // signed in as an alumnus to test the portal). Mirrors the unconditional
  // bypass in middleware.ts.
  if (process.env.NODE_ENV === "development") return LOCAL_ADMIN;

  const user = await getAuthUser();
  if (!user?.dbUser) return null;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(user.dbUser.role as Role) ? user : null;
}
