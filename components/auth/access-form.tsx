"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Audience = "student" | "parent";

export function AccessForm({
  audience,
  next,
  accent = "primary",
}: {
  audience: Audience;
  next?: string;
  accent?: "primary" | "indigo" | "emerald";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      admissionNumber: String(form.get("admissionNumber") ?? "").trim(),
      dob: String(form.get("dob") ?? "").trim(),
      audience,
    };

    const res = await fetch("/api/access/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Sign-in failed" }));
      setError(msg ?? "Sign-in failed");
      return;
    }

    const { redirectTo } = (await res.json()) as { redirectTo: string };
    startTransition(() => {
      router.replace(next || redirectTo);
      router.refresh();
    });
  }

  const btnClass =
    accent === "emerald"
      ? "w-full bg-emerald-600 hover:bg-emerald-700"
      : accent === "indigo"
      ? "w-full bg-indigo-600 hover:bg-indigo-700"
      : "w-full";

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="adm">Admission number</Label>
        <Input
          id="adm"
          name="admissionNumber"
          required
          autoComplete="off"
          placeholder="e.g. SJS-2024-001"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dob">
          {audience === "parent" ? "Child's date of birth" : "Date of birth"}
        </Label>
        <Input id="dob" name="dob" type="date" required />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={pending} className={btnClass}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}
