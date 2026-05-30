"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublishResultsButton({
  examId,
  classId,
  unpublish,
  label,
}: {
  examId: string;
  classId?: string;
  unpublish?: boolean;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    const confirmMsg = unpublish
      ? "Unpublish results? Parents will no longer see them."
      : classId
        ? "Publish all uploaded result PDFs for this class? Parents will see them immediately."
        : "Publish all uploaded result PDFs for this exam (every class)?";
    if (!confirm(confirmMsg)) return;

    setBusy(true);
    try {
      const res = await fetch("/api/results", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exam_id: examId,
          class_id: classId,
          unpublish: unpublish ?? false,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      const data = await res.json();
      toast.success(`${unpublish ? "Unpublished" : "Published"} ${data.updated} result rows`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={run} disabled={busy} variant={unpublish ? "outline" : "emerald"} size="sm">
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : unpublish ? (
        <Undo2 className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
