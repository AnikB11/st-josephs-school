import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/dashboard/user-menu";
import { getAuthUser } from "@/lib/auth";
import { getStudentSession } from "@/lib/student-session";
import type { Role } from "@/lib/constants";

// Each portal has its own landing/settings surface. We use the role to pick
// where the "Account settings" menu item should go, so an alumnus never gets
// kicked into /admin/settings (and so on for other roles). Roles without a
// dedicated settings page get no menu item.
const SETTINGS_HREF: Partial<Record<Role, string>> = {
  admin: "/admin/settings",
  alumni: "/alumni-portal",
  // teacher/parent/student have no dedicated settings surface yet
};

const SIGN_OUT_REDIRECT: Partial<Record<Role, string>> = {
  alumni: "/alumni-portal/login",
  teacher: "/teacher/login",
};

export async function TopNav({ title, subtitle }: { title: string; subtitle?: string }) {
  // Resolve whichever session is active. Student/parent portals run on a
  // JWT cookie; admin/teacher run on Supabase Auth. We don't fetch both
  // — getStudentSession is a JWT verify (no DB hit), so it's cheap to
  // check first and short-circuit when present.
  const studentSession = await getStudentSession();

  let display: {
    name: string;
    email: string;
    avatarUrl: string | null;
    sessionType: "supabase" | "student";
    settingsHref: string | null;
    signOutRedirect: string;
  };

  if (studentSession) {
    display = {
      name: studentSession.fullName || "Account",
      email: studentSession.admissionNumber,
      avatarUrl: null,
      sessionType: "student",
      settingsHref: null,
      signOutRedirect: "/",
    };
  } else {
    const user = await getAuthUser();
    const role = (user?.dbUser?.role as Role | undefined) ?? undefined;
    display = {
      name: user?.dbUser?.full_name ?? user?.email ?? "Account",
      email: user?.email ?? "",
      avatarUrl: user?.dbUser?.avatar_url ?? null,
      sessionType: "supabase",
      settingsHref: role ? SETTINGS_HREF[role] ?? null : null,
      signOutRedirect: role ? SIGN_OUT_REDIRECT[role] ?? "/" : "/",
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
          settingsHref={display.settingsHref}
          signOutRedirect={display.signOutRedirect}
        />
      </div>
    </header>
  );
}
