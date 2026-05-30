import { redirect } from "next/navigation";
import { Sidebar, ALUMNI_NAV } from "@/components/dashboard/sidebar";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AlumniStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AlumniPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/alumni-portal/login");

  // Admin always passes — useful when testing the portal from the admin login.
  if (user.dbUser?.role !== "admin") {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("alumni")
      .select("status")
      .ilike("email", user.email)
      .maybeSingle();

    const status = (data as { status: AlumniStatus } | null)?.status;
    if (!status) redirect("/alumni-portal/login?error=No+alumni+request+found+for+this+email.");
    if (status !== "approved") redirect("/alumni-portal/pending");
  }

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar items={ALUMNI_NAV} title="Alumni" />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
