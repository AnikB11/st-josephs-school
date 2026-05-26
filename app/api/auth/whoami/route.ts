import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Returns the signed-in user's role from public.users (after the
 * first-login bootstrap baked into getAuthUser). Used by the admin
 * login form to gate access: any role other than 'admin' is signed
 * back out client-side.
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user?.dbUser) {
    return NextResponse.json({ role: null }, { status: 401 });
  }
  return NextResponse.json({
    role: user.dbUser.role,
    email: user.email,
  });
}
