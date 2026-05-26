"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Upload, File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = ["general", "academic", "event", "urgent", "holiday"] as const;
const AUDIENCES = ["all", "parents", "students", "alumni", "staff"] as const;

export function NewNoticeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("general");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileState, setFileState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileError, setFileError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function reset() {
    setTitle("");
    setBody("");
    setCategory("general");
    setAudience("all");
    setExpiresAt("");
    setIsPinned(false);
    setPdfUrl("");
    setPdfName("");
    setFileState("idle");
    setFileError("");
  }

  async function handleFileUpload(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit");
      return;
    }

    setFileState("uploading");
    setFileError("");
    setPdfName(file.name);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "notices");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const data = await res.json();
      setPdfUrl(data.secure_url);
      setFileState("done");
    } catch (err) {
      setFileState("error");
      setFileError(err instanceof Error ? err.message : "Failed to upload file");
      setPdfUrl("");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim() || null,
          category,
          audience,
          is_pinned: isPinned,
          pdf_url: pdfUrl.trim() || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.formErrors?.[0] ?? err.error ?? "Failed to publish");
      }

      toast.success("Notice published");
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New notice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publish a notice</DialogTitle>
          <DialogDescription>
            Notices appear on the public site and (depending on audience) inside parent / alumni
            portals.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="notice-title">Title</Label>
            <Input
              id="notice-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mid-term examination schedule announced"
              required
              className="mt-1.5"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="notice-body">Body</Label>
            <Textarea
              id="notice-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Class IX–XII mid-term examinations begin on…"
              className="mt-1.5"
              maxLength={10000}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="notice-expires">Expires on</Label>
              <Input
                id="notice-expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-slate-500">
                Auto-archives 60 days after this date.
              </p>
            </div>
          </div>
          
          <div>
            <Label>PDF Attachment (optional)</Label>
            {fileState === "idle" || fileState === "error" ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className={`mt-1.5 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-900">
                  Drop a PDF here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-slate-500">Max 10MB</p>
                {fileState === "error" && <p className="mt-2 text-xs text-red-500">{fileError}</p>}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            ) : (
              <div className="mt-1.5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 pr-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
                    {fileState === "uploading" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{pdfName}</p>
                    <p className="text-xs text-slate-500">
                      {fileState === "uploading" ? "Uploading..." : "Ready"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFileState("idle");
                    setPdfUrl("");
                    setPdfName("");
                  }}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Pin to top of the list
          </label>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish notice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
