"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";

export type MediaItem = {
  id: string;
  cloudinary_url: string;
  display_order: number;
  caption: string | null;
  width: number | null;
  height: number | null;
};

export function MediaGrid({
  items,
  albumId,
  coverUrl,
}: {
  items: MediaItem[];
  albumId: string;
  coverUrl: string | null;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function call(url: string, options: RequestInit, successMsg: string) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success(successMsg);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this photo from the album?")) return;
    setBusyId(id);
    await call(`/api/gallery/media/${id}`, { method: "DELETE" }, "Photo removed");
  }

  async function swap(a: MediaItem, b: MediaItem) {
    setBusyId(a.id);
    try {
      await Promise.all([
        fetch(`/api/gallery/media/${a.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ display_order: b.display_order }),
        }),
        fetch(`/api/gallery/media/${b.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ display_order: a.display_order }),
        }),
      ]);
      router.refresh();
    } catch (err) {
      toast.error("Failed to reorder");
    } finally {
      setBusyId(null);
    }
  }

  async function setCover(url: string) {
    setBusyId(url);
    await call(
      `/api/gallery/albums/${albumId}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cover_url: url }),
      },
      "Cover updated",
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        No photos yet. Use the uploader above to add some.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m, i) => {
        const isCover = coverUrl === m.cloudinary_url;
        return (
          <div
            key={m.id}
            className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white"
          >
            <div className="relative aspect-[4/3] bg-slate-100">
              <Image
                src={m.cloudinary_url}
                alt={m.caption ?? "Photo"}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover"
              />
              {isCover && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-900 shadow">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Cover
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-xs text-slate-500">#{i + 1}</span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={i === 0 || busyId !== null}
                  onClick={() => swap(m, items[i - 1])}
                  className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={i === items.length - 1 || busyId !== null}
                  onClick={() => swap(m, items[i + 1])}
                  className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={busyId !== null || isCover}
                  onClick={() => setCover(m.cloudinary_url)}
                  title="Use as cover"
                  className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-amber-500 disabled:opacity-30"
                  aria-label="Set as cover"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => remove(m.id)}
                  className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
