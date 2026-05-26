import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/dashboard/user-menu";
import { getAuthUser } from "@/lib/auth";
import { getStudentSession } from "@/lib/student-session";

export async function TopNav({ title, subtitle }: { title: string; subtitle?: string }) {
  // Resolve whichever session is active. Student/parent portals run on a
  // JWT cookie; admin/teacher run on Supabase Auth. We don't fetch both
  // — getStudentSession is a JWT verify (no DB hit), so it's cheap to
  // check first and short-circuit when present.
  const studentSession = await getStudentSession();

  let display: { name: string; email: string; avatarUrl: string | null; sessionType: "supabase" | "student" };
  if (studentSession) {
    display = {
      name: studentSession.fullName || "Account",
      email: studentSession.admissionNumber,
      avatarUrl: null,
      sessionType: "student",
    };
  } else {
    const user = await getAuthUser();
    display = {
      name: user?.dbUser?.full_name ?? user?.email ?? "Account",
      email: user?.email ?? "",
      avatarUrl: user?.dbUser?.avatar_url ?? null,
      sessionType: "supabase",
    };
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="min-w-0">
        <h1 className="font-display truncate text-base font-semibold text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search…" className="h-9 w-64 pl-9" />
        </div>
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald" />
        </button>
        <UserMenu
          name={display.name}
          email={display.email}
          avatarUrl={display.avatarUrl}
          sessionType={display.sessionType}
        />
      </div>
    </header>
  );
}
