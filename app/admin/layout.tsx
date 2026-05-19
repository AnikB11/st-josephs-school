import { redirect } from "next/navigation";
import { Sidebar, ADMIN_NAV } from "@/components/dashboard/sidebar";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");
  if (!user) redirect("/login?role=admin");

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar items={ADMIN_NAV} title="Admin" />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
