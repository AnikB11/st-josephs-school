"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PhotoUpload({
  value,
  onChange,
  folder = "students",
  label = "Photo",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const data = (await res.json()) as { secure_url: string };
      onChange(data.secure_url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
        {value ? (
          <Image src={value} alt={label} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-slate-400">
            {label}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="inline-flex">
          <Button asChild variant="outline" size="sm" disabled={busy} type="button">
            <span className="cursor-pointer">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {value ? "Replace" : "Upload"}
            </span>
          </Button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
        </label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            disabled={busy}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4" /> Remove
          </Button>
        )}
        <p className="text-xs text-slate-500">JPG, PNG, or WebP · max 10MB</p>
      </div>
    </div>
  );
}
