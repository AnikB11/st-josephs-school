"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type StudentRosterRow = {
  id: string;
  full_name: string;
  admission_number: string;
  roll_number: string | null;
};

export type ExistingResult = {
  pdf_url: string;
  status: "draft" | "published";
};

export function ResultPdfUploader({
  examId,
  student,
  existing,
}: {
  examId: string;
  student: StudentRosterRow;
  existing: ExistingResult | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF exceeds 10 MB limit");
      e.target.value = "";
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "results");
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) throw new Error((await upRes.json())?.error ?? "Upload failed");
      const { secure_url } = (await upRes.json()) as { secure_url: string };

      const saveRes = await fetch("/api/results/pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exam_id: examId,
          student_id: student.id,
          pdf_url: secure_url,
        }),
      });
      if (!saveRes.ok) throw new Error((await saveRes.json())?.error ?? "Save failed");

      toast.success(`PDF saved for ${student.full_name}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onDelete() {
    if (!existing) return;
    if (
      !confirm(
        `Delete the result PDF for ${student.full_name}? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch("/api/results/pdf", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exam_id: examId,
          student_id: student.id,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Delete failed");
      toast.success("PDF removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {student.full_name}
        </p>
        <p className="truncate font-mono text-xs text-slate-500">
          {student.admission_number}
          {student.roll_number ? ` · Roll ${student.roll_number}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {existing ? (
          <>
            <Badge variant={existing.status === "published" ? "success" : "warning"}>
              {existing.status === "published" ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : null}
              {existing.status}
            </Badge>
            <a
              href={existing.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <FileText className="h-3.5 w-3.5" /> View
            </a>
          </>
        ) : (
          <Badge variant="outline" className="text-slate-500">
            No PDF
          </Badge>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="h-8"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {existing ? "Replace" : "Upload PDF"}
        </Button>

        {existing && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={busy}
            className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            aria-label="Delete result PDF"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onPick}
      />
    </li>
  );
}
