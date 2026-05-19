import { redirect } from "next/navigation";
import { Sidebar, PARENT_NAV } from "@/components/dashboard/sidebar";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["parent", "admin"]);
  if (!user) redirect("/login?role=parent");

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar items={PARENT_NAV} title="Parent" />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
