"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import {
  ADMIN_NAV,
  TEACHER_NAV,
  STUDENT_NAV,
  PARENT_NAV,
  ALUMNI_NAV,
  type SidebarItem,
} from "@/components/dashboard/sidebar";
import { SCHOOL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Pick the correct portal nav based on URL prefix. Returns null when the
 * current route isn't a portal page (public site etc.) — the component
 * then renders nothing. This lets us mount <MobileSidebar /> once inside
 * the shared <TopNav /> and get the right drawer per portal, without
 * every page needing to pass nav items explicitly.
 */
function portalFor(pathname: string | null): {
  items: SidebarItem[];
  title: string;
} | null {
  if (!pathname) return null;
  if (pathname === "/admin" || pathname.startsWith("/admin/"))
    return { items: ADMIN_NAV, title: "Admin" };
  if (pathname === "/teacher" || pathname.startsWith("/teacher/"))
    return { items: TEACHER_NAV, title: "Teacher" };
  if (pathname === "/student" || pathname.startsWith("/student/"))
    return { items: STUDENT_NAV, title: "Student" };
  if (pathname === "/parent" || pathname.startsWith("/parent/"))
    return { items: PARENT_NAV, title: "Parent" };
  if (
    pathname === "/alumni-portal" ||
    pathname.startsWith("/alumni-portal/")
  )
    return { items: ALUMNI_NAV, title: "Alumni" };
  return null;
}

/**
 * Left-slide drawer version of the dashboard sidebar. Shown only below
 * the `lg` breakpoint (the desktop sidebar is `hidden lg:flex`). Uses
 * plain state + a backdrop — avoids a Radix Dialog here because we want
 * the drawer anchored left, not centered, and the Dialog primitive is
 * tuned for the modal-dialog case elsewhere in the app.
 */
export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const portal = portalFor(pathname);

  if (!portal) return null;

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="mobile-sidebar"
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        id="mobile-sidebar"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82vw] flex-col border-r border-slate-200/70 bg-white shadow-xl transition-transform duration-250 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2.5 border-b border-slate-200/70 px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-slate-900">
                {SCHOOL.shortName}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {portal.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="space-y-0.5">
            {portal.items.map((item) => {
              const Icon: LucideIcon = item.icon;
              const isBaseRoute =
                item.href === "/admin" ||
                item.href === "/parent" ||
                item.href === "/student" ||
                item.href === "/teacher" ||
                item.href === "/alumni-portal";
              const active =
                pathname === item.href ||
                (!isBaseRoute && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200/70 px-3 py-3">
          <Link
            href="/"
            prefetch
            onClick={close}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            ← Back to website
          </Link>
        </div>
      </aside>
    </>
  );
}
