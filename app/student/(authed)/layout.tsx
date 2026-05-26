import { redirect } from "next/navigation";
import { Sidebar, STUDENT_NAV } from "@/components/dashboard/sidebar";
import { getStudentSession } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getStudentSession();
  if (!session || session.audience !== "student") {
    redirect("/student/login");
  }

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar items={STUDENT_NAV} title="Student" />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
