import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/constants";
import type { User as DbUser } from "@/types/database";

export type AuthUser = {
  clerk: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  dbUser: DbUser | null;
};

import { cache } from "react";

/**
 * Get the Clerk user + their mapped Supabase user record (with role).
 * Auto-creates the Supabase user on first call.
 */
export const getAuthUser = cache(async function getAuthUser(): Promise<AuthUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const admin = createSupabaseAdminClient();
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");

  const { data: existing } = await admin
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (existing) {
    return { clerk: clerkUser, dbUser: existing as DbUser };
  }

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
  const role: Role =
    bootstrapEmail && email.toLowerCase() === bootstrapEmail ? "admin" : "parent";

  const { data: created } = await admin
    .from("users")
    .insert({
      clerk_id: userId,
      email,
      full_name: fullName || email,
      avatar_url: clerkUser.imageUrl,
      role,
    })
    .select()
    .single();

  return { clerk: clerkUser, dbUser: (created as DbUser | null) ?? null };
});

export async function requireRole(role: Role | Role[]): Promise<AuthUser | null> {
  // BYPASS FOR LOCAL DEV
  if (process.env.NODE_ENV === "development") {
    return {
      clerk: {} as any,
      dbUser: { 
        role: "admin", 
        id: "local-dev-id", 
        clerk_id: "local-dev", 
        email: "aniketbasnett20@gmail.com", 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString(), 
        full_name: "Local Admin", 
        avatar_url: null, 
        phone: null 
      } as any
    };
  }

  const user = await getAuthUser();
  if (!user?.dbUser) return null;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(user.dbUser.role as Role) ? user : null;
}
