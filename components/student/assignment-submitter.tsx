"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PdfUpload } from "@/components/admin/pdf-upload";
import { formatDate } from "@/lib/utils";

type Submission = {
  id: string;
  pdf_url: string | null;
  remarks: string | null;
  marks_obtained: number | null;
  status: string;
  submitted_at: string;
};

export function AssignmentSubmitter({
  assignmentId,
  studentId,
  assignmentPdfUrl,
  submission,
  maxMarks,
}: {
  assignmentId: string;
  studentId: string;
  assignmentPdfUrl: string | null;
  submission: Submission | null;
  maxMarks: number | null;
}) {
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(submission?.pdf_url ?? null);
  const [remarks, setRemarks] = useState(submission?.remarks ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!pdfUrl) {
      toast.error("Upload your PDF before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          pdf_url: pdfUrl,
          remarks: remarks.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success(submission ? "Submission updated" : "Submitted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const isGraded = submission?.status === "graded";

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      {assignmentPdfUrl && (
        <a
          href={assignmentPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <FileText className="h-3.5 w-3.5" /> Open teacher's attachment
        </a>
      )}

      {isGraded && submission ? (
        <div className="rounded-lg bg-white p-3 ring-1 ring-emerald/20">
          <p className="text-sm font-medium text-emerald">
            Graded · {submission.marks_obtained ?? "—"}
            {maxMarks !== null && `/${maxMarks}`}
          </p>
          {submission.remarks && (
            <p className="mt-1 text-xs text-slate-600">
              <span className="font-medium">Feedback:</span> {submission.remarks}
            </p>
          )}
          {submission.pdf_url && (
            <a
              href={submission.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <FileText className="h-3 w-3" /> Your submission
            </a>
          )}
        </div>
      ) : (
        <>
          <PdfUpload
            value={pdfUrl}
            onChange={setPdfUrl}
            folder={`submissions/${assignmentId}`}
            label="Your submission"
          />
          <Textarea
            placeholder="Notes for your teacher (optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
          />
          <div className="flex items-center justify-between">
            {submission ? (
              <p className="text-xs text-slate-500">
                Submitted {formatDate(submission.submitted_at)} — submit again to update
              </p>
            ) : (
              <span />
            )}
            <Button size="sm" onClick={submit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submission ? "Update submission" : "Submit"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
