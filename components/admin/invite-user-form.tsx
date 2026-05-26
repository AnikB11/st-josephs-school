"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = ["admin", "teacher", "parent", "student", "alumni"] as const;

export function InviteUserForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<string>("parent");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") ?? "").trim(),
      fullName: String(form.get("fullName") ?? "").trim(),
      role,
    };

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Failed to invite" }));
      toast.error(error ?? "Failed to invite");
      return;
    }

    toast.success(`Invite sent to ${payload.email}`);
    (e.target as HTMLFormElement).reset();
    setRole("parent");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_140px_120px] sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="invite-name">Full name</Label>
        <Input id="invite-name" name="fullName" placeholder="Jane Sharma" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" name="email" type="email" placeholder="jane@example.com" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="invite-role">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="invite-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send invite"}
      </Button>
    </form>
  );
}
