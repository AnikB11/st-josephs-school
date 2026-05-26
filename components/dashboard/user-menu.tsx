"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

type SessionType = "supabase" | "student";

export function UserMenu({
  name,
  email,
  avatarUrl,
  sessionType = "supabase",
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  sessionType?: SessionType;
}) {
  const router = useRouter();

  async function onSignOut() {
    if (sessionType === "student") {
      await fetch("/api/access/logout", { method: "POST" });
    } else {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-xs font-display text-primary">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{name}</span>
            {email && (
              <span className="truncate text-xs text-slate-500">{email}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sessionType === "supabase" && (
          <DropdownMenuItem onSelect={() => router.push("/admin/settings")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Account settings
          </DropdownMenuItem>
        )}
        {sessionType === "supabase" && <DropdownMenuSeparator />}
        <DropdownMenuItem onSelect={onSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
