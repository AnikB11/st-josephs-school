"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  MoreHorizontal,
  Trash2,
  PowerOff,
  Power,
  KeyRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function TeacherActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>, msg: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success(msg);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Remove this teacher? Their assignments will be deleted.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Teacher removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetLogin() {
    if (
      !confirm(
        "Reset this teacher's login? Their password will be set to their current employee code.",
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/teachers/${id}/reset-password`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Failed");
      toast.success("Login reset — they can sign in with email + employee code.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={busy}
        className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/teachers/${id}`}>
            <Eye className="h-4 w-4" /> View & assign
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={resetLogin}>
          <KeyRound className="h-4 w-4" /> Reset login
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isActive ? (
          <DropdownMenuItem onClick={() => patch({ is_active: false }, "Marked inactive")}>
            <PowerOff className="h-4 w-4" /> Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => patch({ is_active: true }, "Marked active")}>
            <Power className="h-4 w-4" /> Activate
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={remove}
          className="text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="h-4 w-4" /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
