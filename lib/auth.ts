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

/**
 * Get the signed-in Supabase auth user + their mapped public.users row
 * (with role). Auto-creates the public.users row on first call and
 * links any pre-invited teacher record.
 */
export const getAuthUser = cache(async function getAuthUser(): Promise<AuthUser | null> {
  // BYPASS FOR LOCAL DEV — keeps page loads instant by skipping the
  // Supabase round-trip on every render. Mirrors the bypass in requireRole.
  if (process.env.NODE_ENV === "development") {
    return {
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
      } as any,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

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

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ||
    (authUser.user_metadata?.name as string | undefined) ||
    email;

  // Check if this email was pre-invited as a teacher
  const { data: invitedTeacher } = await admin
    .from("teachers")
    .select("id")
    .eq("invited_email", email)
    .is("user_id", null)
    .maybeSingle();

  let role: Role = "parent";
  if (bootstrapEmail && email === bootstrapEmail) role = "admin";
  else if (invitedTeacher) role = "teacher";

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

  return { authId: authUser.id, email, dbUser: (created as DbUser | null) ?? null };
});

export async function requireRole(role: Role | Role[]): Promise<AuthUser | null> {
  // BYPASS FOR LOCAL DEV — keeps `next dev` fast and avoids a real login.
  if (process.env.NODE_ENV === "development") {
    return {
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
      } as any,
    };
  }

  const user = await getAuthUser();
  if (!user?.dbUser) return null;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(user.dbUser.role as Role) ? user : null;
}
