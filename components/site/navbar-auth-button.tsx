"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";

type SessionUser = {
  email: string;
  name: string;
  avatarUrl: string | null;
};

export function NavbarAuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          name:
            (data.user.user_metadata?.full_name as string | undefined) ??
            data.user.email ??
            "Account",
          avatarUrl: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
        });
      }
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      setUser({
        email: session.user.email ?? "",
        name:
          (session.user.user_metadata?.full_name as string | undefined) ??
          session.user.email ??
          "Account",
        avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
      });
    });

    return () => {
      cancelled = true;
      if (sub?.subscription) {
        sub.subscription.unsubscribe();
      }
    };
  }, []);

  async function onSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (!ready) {
    return <div className="hidden md:block h-8 w-20 rounded-full bg-slate-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link href="/login" className="hidden md:inline-flex">
        <Button
          size="sm"
          className="rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] transition-all duration-300 font-semibold tracking-wide px-6"
        >
          Portal Login
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8 border border-slate-200 shadow-sm transition-transform hover:scale-105">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="bg-primary/10 text-xs font-display text-primary">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{user.name}</span>
            <span className="truncate text-xs text-slate-500">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/admin")}>
          Open dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
