"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type RosterRow = {
  id: string;
  full_name: string;
  admission_number: string;
  roll_number: string | null;
};

export function MarksEntry({
  examId,
  classId,
  subjectId,
  maxMarks,
  roster,
  initial,
}: {
  examId: string;
  classId: string;
  subjectId: string;
  maxMarks: number;
  roster: RosterRow[];
  initial: Record<string, { marks_obtained: number; max_marks: number }>;
}) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    roster.forEach((s) => {
      m[s.id] = initial[s.id]?.marks_obtained?.toString() ?? "";
    });
    return m;
  });
  const [saving, setSaving] = useState(false);

  function update(studentId: string, value: string) {
    setMarks((m) => ({ ...m, [studentId]: value }));
  }

  async function save() {
    const payload = {
      exam_id: examId,
      subject_id: subjectId,
      class_id: classId,
      marks: roster
        .map((s) => {
          const v = marks[s.id]?.trim();
          if (v === "" || v === undefined) return null;
          const n = Number(v);
          if (Number.isNaN(n)) return null;
          return {
            student_id: s.id,
            marks_obtained: Math.max(0, Math.min(n, maxMarks)),
            max_marks: maxMarks,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    };

    if (payload.marks.length === 0) {
      toast.error("Enter at least one mark");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      const data = await res.json();
      toast.success(`Saved ${data.saved} marks as draft`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-4">
        <p className="text-xs text-slate-500">
          Max marks <span className="font-semibold text-slate-900">{maxMarks}</span> · grades are
          auto-assigned from percentage on save
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save as draft
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
        <ul className="divide-y divide-slate-100">
          {roster.map((s) => (
            <li key={s.id} className="flex items-center gap-4 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{s.full_name}</p>
                <p className="truncate font-mono text-xs text-slate-500">
                  {s.admission_number}
                  {s.roll_number ? ` · Roll ${s.roll_number}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={maxMarks}
                  step="0.5"
                  value={marks[s.id] ?? ""}
                  onChange={(e) => update(s.id, e.target.value)}
                  className="h-9 w-24 text-right"
                  placeholder="—"
                />
                <span className="text-xs text-slate-400">/ {maxMarks}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
