"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Film, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isVideoUrl } from "@/lib/cms-images";
import { cn } from "@/lib/utils";

type MediaKind = "image" | "video";

const ACCEPT: Record<MediaKind, string> = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm",
};

async function destroyCloudinaryAsset(url: string | null): Promise<void> {
  if (!url) return;
  if (url.includes("/website/fallbacks/")) return;
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* non-fatal */
  }
}

interface CmsMediaUploaderProps {
  sectionKey: string;
  currentUrl: string | null;
  fallbackUrl: string;
  label: string;
  aspect?: string;
  onSaved?: () => void;
}

/**
 * Uploader for CMS slots that can hold either an image or a short video
 * (e.g. the homepage hero background). The active media type is inferred
 * from whatever's currently saved, and the admin can toggle it before
 * uploading. The URL still lives in `website_content.image_url` — the
 * column name is historical; the value is just text.
 */
export function CmsMediaUploader({
  sectionKey,
  currentUrl,
  fallbackUrl,
  label,
  aspect = "16/9",
  onSaved,
}: CmsMediaUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<MediaKind>(() =>
    isVideoUrl(currentUrl) ? "video" : "image",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || fallbackUrl;
  const isCustom = Boolean(previewUrl);
  const displayIsVideo = useMemo(() => isVideoUrl(displayUrl), [displayUrl]);

  const handleUpload = useCallback(
    async (file: File) => {
      const expectingVideo = mode === "video";
      const isVid = file.type.startsWith("video/");
      const isImg = file.type.startsWith("image/");
      if (expectingVideo && !isVid) {
        toast.error("Video mode is on — please pick an MP4 or WebM file");
        return;
      }
      if (!expectingVideo && !isImg) {
        toast.error("Image mode is on — please pick a JPG, PNG or WebP");
        return;
      }
      // Server validates the rest (size limits, exact MIME), but check
      // the bigger of the two ceilings client-side to fail fast.
      const maxMb = isVid ? 25 : 10;
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`File exceeds ${maxMb} MB limit`);
        return;
      }

      const previousUrl = previewUrl;
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", "website/cms");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Upload failed");
        }
        const { secure_url } = await uploadRes.json();

        setSaving(true);
        const cmsRes = await fetch(
          `/api/cms/${encodeURIComponent(sectionKey)}`,
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ image_url: secure_url }),
          },
        );
        if (!cmsRes.ok) {
          const err = await cmsRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Save failed");
        }

        await destroyCloudinaryAsset(previousUrl);

        setPreviewUrl(secure_url);
        toast.success(isVid ? "Video updated" : "Image updated");
        onSaved?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        setSaving(false);
      }
    },
    [mode, sectionKey, previewUrl, onSaved],
  );

  const handleDelete = useCallback(async () => {
    const toRemove = previewUrl;
    if (!toRemove) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Delete this media? It will be removed from Cloudinary and the slot will revert to the default image.",
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/cms/${encodeURIComponent(sectionKey)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image_url: null }),
      });
      if (!res.ok) throw new Error("Delete failed");

      await destroyCloudinaryAsset(toRemove);

      setPreviewUrl(null);
      setMode("image"); // fallback is always an image
      toast.success("Media deleted");
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }, [sectionKey, previewUrl, onSaved]);

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
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-600">{label}</p>
        {/* Mode toggle — segmented control. Drives the file picker's
            `accept` and the upload-time validation. */}
        <div
          role="tablist"
          aria-label="Media type"
          className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "image"}
            onClick={() => setMode("image")}
            disabled={busy}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
              mode === "image"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <ImageIcon className="h-3 w-3" /> Image
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "video"}
            onClick={() => setMode("video")}
            disabled={busy}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
              mode === "video"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <Film className="h-3 w-3" /> Video
          </button>
        </div>
      </div>

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
        {displayIsVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={displayUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={displayUrl}
            alt={label}
            fill
            sizes="400px"
            className="object-cover"
            unoptimized={displayUrl.startsWith("http")}
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-white" />
              <span className="text-xs font-semibold text-white">
                Click or drag to {mode === "video" ? "upload video" : "upload image"}
              </span>
            </>
          )}
        </div>

        {isCustom ? (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            Custom {displayIsVideo ? "video" : "image"}
          </span>
        ) : (
          <span className="absolute left-2 top-2 rounded-full bg-slate-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            Default
          </span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT[mode]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="h-8 gap-1.5 rounded-lg text-xs"
        >
          {mode === "video" ? (
            <Film className="h-3.5 w-3.5" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
          {isCustom ? "Replace" : `Upload ${mode}`}
        </Button>
        {isCustom && (
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={handleDelete}
            className="h-8 gap-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </div>

      <p className="text-[10px] text-slate-400">
        key: <code className="rounded bg-slate-100 px-1 font-mono">{sectionKey}</code>
        {mode === "video" && (
          <span className="ml-2">
            · video clipped to 15 s on delivery, looped on the public page
          </span>
        )}
      </p>
    </div>
  );
}
