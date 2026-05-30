"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Eye, EyeOff, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AlumniDialog, type AlumniInput } from "@/components/admin/alumni-dialog";

export function AlumniActions({ alumnus }: { alumnus: AlumniInput }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isPending = alumnus.status === "pending";

  async function setStatus(action: "approve" | "reject") {
    const reason =
      action === "reject"
        ? window.prompt(`Reason for rejecting ${alumnus.full_name}? (optional)`) ?? null
        : null;
    setBusy(true);
    try {
      const res = await fetch(`/api/alumni/${alumnus.id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action === "approve" ? { action } : { action, reason }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success(action === "approve" ? "Alumnus approved" : "Request rejected");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility() {
    setBusy(true);
    try {
      const res = await fetch(`/api/alumni/${alumnus.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_public: !alumnus.is_public }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success(alumnus.is_public ? "Hidden from directory" : "Now public");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete ${alumnus.full_name}'s alumni profile? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/alumni/${alumnus.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Alumnus deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={busy}
          className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          aria-label="Actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isPending && (
            <>
              <DropdownMenuItem
                onClick={() => setStatus("approve")}
                className="text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800"
              >
                <Check className="h-4 w-4" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatus("reject")}
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
              >
                <X className="h-4 w-4" /> Reject
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {alumnus.status === "rejected" && (
            <>
              <DropdownMenuItem
                onClick={() => setStatus("approve")}
                className="text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800"
              >
                <Check className="h-4 w-4" /> Approve anyway
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleVisibility}>
            {alumnus.is_public ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide from directory
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Make public
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={remove}
            className="text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlumniDialog mode="edit" initial={alumnus} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
