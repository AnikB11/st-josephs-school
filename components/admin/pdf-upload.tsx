"use client";

import { useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PdfUpload({
  value,
  onChange,
  folder = "documents",
  label = "PDF",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
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
      toast.success("PDF uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-xs text-primary hover:underline"
          >
            View uploaded PDF
          </a>
        ) : (
          <p className="text-xs text-slate-500">PDF · max 10MB</p>
        )}
      </div>
      <div className="flex items-center gap-2">
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
            accept="application/pdf"
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
            size="icon"
            onClick={() => onChange(null)}
            disabled={busy}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
