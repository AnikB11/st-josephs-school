"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, RotateCcw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CmsImageUploaderProps {
  sectionKey: string;
  currentUrl: string | null;
  fallbackUrl: string;
  label: string;
  /** Aspect ratio for the preview thumbnail. */
  aspect?: string;
  onSaved?: () => void;
}

export function CmsImageUploader({
  sectionKey,
  currentUrl,
  fallbackUrl,
  label,
  aspect = "16/9",
  onSaved,
}: CmsImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || fallbackUrl;
  const isCustom = Boolean(previewUrl);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are supported");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File must be under 10 MB");
        return;
      }

      setUploading(true);
      try {
        // 1. Upload to Cloudinary
        const form = new FormData();
        form.append("file", file);
        form.append("folder", "website/cms");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Upload failed");
        }
        const { secure_url } = await uploadRes.json();

        // 2. Save image_url to CMS
        setSaving(true);
        const cmsRes = await fetch(`/api/cms/${encodeURIComponent(sectionKey)}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image_url: secure_url }),
        });
        if (!cmsRes.ok) {
          const err = await cmsRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Save failed");
        }

        setPreviewUrl(secure_url);
        toast.success("Image updated");
        onSaved?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        setSaving(false);
      }
    },
    [sectionKey, onSaved],
  );

  const handleReset = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/${encodeURIComponent(sectionKey)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image_url: null }),
      });
      if (!res.ok) throw new Error("Reset failed");
      setPreviewUrl(null);
      toast.success("Reverted to default image");
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSaving(false);
    }
  }, [sectionKey, onSaved]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const busy = uploading || saving;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600">{label}</p>

      {/* Preview + Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !busy && fileRef.current?.click()}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all",
          busy
            ? "pointer-events-none border-slate-200 opacity-60"
            : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30",
        )}
        style={{ aspectRatio: aspect }}
      >
        {/* Current image */}
        <Image
          src={displayUrl}
          alt={label}
          fill
          sizes="400px"
          className="object-cover"
          unoptimized={displayUrl.startsWith("http")}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-white" />
              <span className="text-xs font-semibold text-white">
                Click or drag to replace
              </span>
            </>
          )}
        </div>

        {/* Status badges */}
        {isCustom && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            Custom
          </span>
        )}
        {!isCustom && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            Default
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="h-8 gap-1.5 rounded-lg text-xs"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Upload
        </Button>
        {isCustom && (
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={handleReset}
            className="h-8 gap-1.5 rounded-lg text-xs text-slate-500 hover:text-red-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to default
          </Button>
        )}
      </div>

      <p className="text-[10px] text-slate-400">
        key: <code className="rounded bg-slate-100 px-1 font-mono">{sectionKey}</code>
      </p>
    </div>
  );
}
