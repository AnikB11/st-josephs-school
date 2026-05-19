"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "queued" | "uploading" | "done" | "error";

type QueueItem = {
  id: string;
  file: File;
  preview: string;
  status: Status;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  error?: string;
};

export function MediaUploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(f.type),
    );
    const skipped = files.length - list.length;
    if (skipped > 0) toast.error(`Skipped ${skipped} unsupported file${skipped === 1 ? "" : "s"}`);
    if (list.length === 0) return;

    const items: QueueItem[] = list.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      file: f,
      preview: URL.createObjectURL(f),
      status: "queued",
    }));
    setQueue((q) => [...q, ...items]);
    void Promise.all(items.map(uploadOne));
  }

  async function uploadOne(item: QueueItem) {
    setQueue((q) =>
      q.map((it) => (it.id === item.id ? { ...it, status: "uploading" as Status } : it)),
    );
    try {
      const form = new FormData();
      form.append("file", item.file);
      form.append("folder", `gallery/${albumId}`);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const data = (await res.json()) as {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
      };
      setQueue((q) =>
        q.map((it) =>
          it.id === item.id
            ? {
                ...it,
                status: "done",
                url: data.secure_url,
                publicId: data.public_id,
                width: data.width,
                height: data.height,
              }
            : it,
        ),
      );
    } catch (err) {
      setQueue((q) =>
        q.map((it) =>
          it.id === item.id
            ? { ...it, status: "error", error: err instanceof Error ? err.message : "Failed" }
            : it,
        ),
      );
    }
  }

  function remove(id: string) {
    setQueue((q) => q.filter((it) => it.id !== id));
  }

  async function attachAll() {
    const done = queue.filter((it) => it.status === "done" && it.url);
    if (done.length === 0) {
      toast.error("Nothing to add yet");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery/media", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          album_id: albumId,
          items: done.map((it) => ({
            cloudinary_url: it.url!,
            cloudinary_public_id: it.publicId ?? null,
            width: it.width ?? null,
            height: it.height ?? null,
          })),
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      const data = await res.json();
      toast.success(`Added ${data.added} photo${data.added === 1 ? "" : "s"} to album`);
      setQueue([]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const doneCount = queue.filter((it) => it.status === "done").length;
  const erroredCount = queue.filter((it) => it.status === "error").length;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed bg-white p-10 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-slate-200",
        )}
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-900">
          Drop photos here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-primary hover:underline"
          >
            browse files
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP, MP4, WebM · max 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {queue.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              {doneCount} ready · {erroredCount > 0 && `${erroredCount} failed · `}
              {queue.length} total
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setQueue([])} disabled={saving}>
                Clear
              </Button>
              <Button onClick={attachAll} disabled={saving || doneCount === 0}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Add {doneCount} to album
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {queue.map((it) => (
              <div
                key={it.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
              >
                <Image src={it.preview} alt="" fill sizes="120px" className="object-cover" />
                {it.status !== "done" && (
                  <div className="absolute inset-0 grid place-items-center bg-slate-900/50 text-white">
                    {it.status === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : it.status === "error" ? (
                      <span className="px-1 text-center text-[10px]">{it.error ?? "failed"}</span>
                    ) : (
                      <span className="text-[10px]">queued</span>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-slate-700 shadow"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
