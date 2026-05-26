import { redirect } from "next/navigation";
import { Sidebar, PARENT_NAV } from "@/components/dashboard/sidebar";
import { getStudentSession } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getStudentSession();
  if (!session || session.audience !== "parent") {
    redirect("/parent/login");
  }

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar items={PARENT_NAV} title="Parent" />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
