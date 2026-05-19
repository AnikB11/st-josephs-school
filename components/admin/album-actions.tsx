"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Trash2, EyeOff, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AlbumActions({
  id,
  slug,
  isPublished,
}: {
  id: string;
  slug: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>, msg: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/gallery/albums/${id}`, {
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
    if (!confirm("Delete this album and all its photos? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/gallery/albums/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Album deleted");
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
          <Link href={`/admin/gallery/${id}`}>
            <Eye className="h-4 w-4" /> Manage photos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/gallery/${slug}`} target="_blank">
            <ExternalLink className="h-4 w-4" /> View public
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isPublished ? (
          <DropdownMenuItem onClick={() => patch({ is_published: false }, "Album hidden")}>
            <EyeOff className="h-4 w-4" /> Unpublish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => patch({ is_published: true }, "Album published")}>
            <Eye className="h-4 w-4" /> Publish
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={remove}
          className="text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="h-4 w-4" /> Delete album
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
