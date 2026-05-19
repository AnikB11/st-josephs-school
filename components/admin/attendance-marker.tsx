"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Check, X, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type Roster = {
  id: string;
  admission_number: string;
  full_name: string;
  roll_number: string | null;
  photo_url: string | null;
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof Check; cls: string }[] = [
  { value: "present", label: "Present", icon: Check, cls: "bg-emerald/10 text-emerald" },
  { value: "absent", label: "Absent", icon: X, cls: "bg-red-50 text-red-600" },
  { value: "late", label: "Late", icon: Clock, cls: "bg-amber-50 text-amber-700" },
  { value: "excused", label: "Excused", icon: FileText, cls: "bg-slate-100 text-slate-600" },
];

export function AttendanceMarker({
  classId,
  date,
  roster,
  initial,
}: {
  classId: string;
  date: string;
  roster: Roster[];
  initial: Record<string, AttendanceStatus>;
}) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(initial);
  const [saving, setSaving] = useState(false);

  function set(studentId: string, status: AttendanceStatus) {
    setMarks((m) => ({ ...m, [studentId]: status }));
  }

  function setAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {};
    roster.forEach((s) => (next[s.id] = status));
    setMarks(next);
  }

  async function save() {
    const payload = {
      class_id: classId,
      date,
      marks: roster.map((s) => ({
        student_id: s.id,
        status: marks[s.id] ?? "absent",
      })),
    };
    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed to save");
      const data = await res.json();
      toast.success(`Saved attendance for ${data.saved} students`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const summary = roster.reduce(
    (acc, s) => {
      const status = marks[s.id];
      if (status) acc[status]++;
      else acc.unmarked++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 } as Record<string, number>,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald" /> {summary.present} present
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" /> {summary.absent} absent
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> {summary.late} late
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> {summary.excused} excused
          </span>
          {summary.unmarked > 0 && (
            <span className="text-slate-400">· {summary.unmarked} unmarked</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAll("present")}>
            Mark all present
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save attendance
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
        <ul className="divide-y divide-slate-100">
          {roster.map((s) => {
            const status = marks[s.id];
            return (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-display">
                    {initials(s.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{s.full_name}</p>
                  <p className="truncate font-mono text-xs text-slate-500">
                    {s.admission_number}
                    {s.roll_number ? ` · Roll ${s.roll_number}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {STATUS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set(s.id, opt.value)}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all",
                          active ? opt.cls + " ring-2 ring-current/30" : "text-slate-400 hover:bg-slate-100",
                        )}
                        title={opt.label}
                        aria-pressed={active}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
