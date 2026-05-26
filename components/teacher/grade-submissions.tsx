"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, formatDate } from "@/lib/utils";

type Student = {
  id: string;
  full_name: string;
  admission_number: string;
  roll_number: string | null;
};

type Submission = {
  id: string;
  pdf_url: string | null;
  remarks: string | null;
  marks_obtained: number | null;
  status: string;
  submitted_at: string;
  graded_at: string | null;
  students: Student | null;
};

export function GradeSubmissions({
  assignmentId,
  maxMarks,
  roster,
  submissions,
}: {
  assignmentId: string;
  maxMarks: number | null;
  roster: Student[];
  submissions: Submission[];
}) {
  const router = useRouter();
  const byStudent = new Map<string, Submission>();
  submissions.forEach((s) => {
    if (s.students) byStudent.set(s.students.id, s);
  });

  // local grade state per submission id
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    submissions.forEach((s) => {
      init[s.id] = s.marks_obtained?.toString() ?? "";
    });
    return init;
  });
  const [remarks, setRemarks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    submissions.forEach((s) => {
      init[s.id] = s.remarks ?? "";
    });
    return init;
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  async function grade(submissionId: string) {
    const raw = grades[submissionId]?.trim();
    if (raw === "" || raw === undefined) {
      toast.error("Enter marks");
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) {
      toast.error("Marks must be a number");
      return;
    }
    setSavingId(submissionId);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          marks_obtained: maxMarks !== null ? Math.max(0, Math.min(n, maxMarks)) : n,
          remarks: remarks[submissionId]?.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Graded");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSavingId(null);
    }
  }

  if (roster.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        No active students in this class.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {roster.map((student) => {
        const sub = byStudent.get(student.id);
        return (
          <li key={student.id} className="space-y-3 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-display">
                    {initials(student.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900">{student.full_name}</p>
                  <p className="font-mono text-xs text-slate-500">
                    {student.admission_number}
                    {student.roll_number && ` · Roll ${student.roll_number}`}
                  </p>
                </div>
              </div>
              {sub ? (
                sub.status === "graded" ? (
                  <Badge variant="success">
                    Graded
                    {sub.marks_obtained !== null && (
                      <span className="ml-1">
                        · {sub.marks_obtained}
                        {maxMarks !== null && `/${maxMarks}`}
                      </span>
                    )}
                  </Badge>
                ) : (
                  <Badge variant="warning">Pending grading</Badge>
                )
              ) : (
                <Badge variant="outline">Not submitted</Badge>
              )}
            </div>

            {sub && (
              <div className="ml-12 space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Submitted {formatDate(sub.submitted_at)}</span>
                  {sub.pdf_url && (
                    <a
                      href={sub.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 font-medium text-slate-600 hover:border-primary/40 hover:text-primary"
                    >
                      <FileText className="h-3.5 w-3.5" /> View PDF
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={maxMarks ?? undefined}
                    placeholder="Marks"
                    value={grades[sub.id] ?? ""}
                    onChange={(e) =>
                      setGrades((g) => ({ ...g, [sub.id]: e.target.value }))
                    }
                    className="h-9 w-24"
                  />
                  <Input
                    placeholder="Remarks (optional)"
                    value={remarks[sub.id] ?? ""}
                    onChange={(e) =>
                      setRemarks((r) => ({ ...r, [sub.id]: e.target.value }))
                    }
                    className="h-9 flex-1 min-w-[200px]"
                  />
                  <Button
                    size="sm"
                    onClick={() => grade(sub.id)}
                    disabled={savingId === sub.id}
                  >
                    {savingId === sub.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
