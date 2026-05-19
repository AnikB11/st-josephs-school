"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileBarChart,
  Megaphone,
  Images,
  Layout,
  GraduationCap,
  Settings,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHOOL } from "@/lib/constants";

export type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV: SidebarItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/admin/results", label: "Results", icon: FileBarChart },
  { href: "/admin/notices", label: "Notices", icon: Megaphone },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/cms", label: "Website CMS", icon: Layout },
  { href: "/admin/alumni", label: "Alumni", icon: GraduationCap },
  { href: "/admin/promotions", label: "Promotions", icon: ArrowUpRight },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const PARENT_NAV: SidebarItem[] = [
  { href: "/parent", label: "Overview", icon: LayoutDashboard },
  { href: "/parent/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/parent/results", label: "Results", icon: FileBarChart },
  { href: "/parent/notices", label: "Notices", icon: Megaphone },
];

export const ALUMNI_NAV: SidebarItem[] = [
  { href: "/alumni-portal", label: "Overview", icon: LayoutDashboard },
  { href: "/alumni-portal/network", label: "Network", icon: Users },
  { href: "/alumni-portal/events", label: "Events", icon: GraduationCap },
];

export function Sidebar({
  items,
  title,
}: {
  items: SidebarItem[];
  title?: string;
}) {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/70 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200/70 px-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-slate-900">
            {SCHOOL.shortName}
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {title ?? "Dashboard"}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/parent" &&
                item.href !== "/alumni-portal" &&
                pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          ← Back to website
        </Link>
      </div>
    </aside>
  );
}
