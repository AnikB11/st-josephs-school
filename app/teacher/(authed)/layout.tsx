import { redirect } from "next/navigation";
import { Sidebar, TEACHER_NAV } from "@/components/dashboard/sidebar";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["teacher", "admin"]);
  if (!user) redirect("/teacher/login");

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar items={TEACHER_NAV} title="Teacher" />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
