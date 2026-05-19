import { redirect } from "next/navigation";
import { Sidebar, ALUMNI_NAV } from "@/components/dashboard/sidebar";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AlumniPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["alumni", "admin"]);
  if (!user) redirect("/login?role=alumni");

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar items={ALUMNI_NAV} title="Alumni" />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
