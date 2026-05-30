"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  redirectTo = "/",
  variant = "outline",
  children,
}: {
  redirectTo?: string;
  variant?: "outline" | "default" | "ghost";
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <Button type="button" variant={variant} disabled={busy} onClick={signOut}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children ?? "Sign out"}
    </Button>
  );
}
