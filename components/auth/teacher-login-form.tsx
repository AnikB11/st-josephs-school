"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TeacherLoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const employeeCode = String(form.get("employee_code") ?? "").trim();

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: employeeCode,
    });

    if (signInError) {
      setError(
        "Couldn't sign in with that email and employee code. Double-check both, or contact the office.",
      );
      return;
    }

    startTransition(() => {
      router.replace(next || "/teacher");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="t-email">School email</Label>
        <Input
          id="t-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-code">Employee code</Label>
        <Input
          id="t-code"
          name="employee_code"
          type="password"
          autoComplete="current-password"
          required
          placeholder="TCH-001"
        />
        <p className="text-[11px] text-slate-500">
          This is the temporary password — change it from your profile after signing in.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}
