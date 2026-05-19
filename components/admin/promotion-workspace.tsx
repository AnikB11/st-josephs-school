"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, ArrowUpRight, GraduationCap, Loader2, RotateCw, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, initials } from "@/lib/utils";

type Cls = { id: string; grade: string; section: string; academic_year: string | null };
type Action = "promote" | "retain" | "graduate" | "transfer";

type Student = {
  id: string;
  full_name: string;
  admission_number: string;
  roll_number: string | null;
};

type Preview = {
  source_class: Cls;
  next_year_label: string | null;
  suggestion: { next_grade: string | null; status: "promoted" | "graduated" };
  students: Student[];
};

type Decision = {
  student_id: string;
  action: Action;
  target_grade?: string;
  target_section?: string;
};

const ACTIONS: { value: Action; label: string; icon: typeof ArrowUpRight; cls: string }[] = [
  { value: "promote", label: "Promote", icon: ArrowUpRight, cls: "bg-emerald/10 text-emerald" },
  { value: "retain", label: "Retain", icon: RotateCw, cls: "bg-amber-50 text-amber-700" },
  { value: "graduate", label: "Graduate", icon: GraduationCap, cls: "bg-primary/10 text-primary" },
  { value: "transfer", label: "Transfer", icon: UserX, cls: "bg-slate-100 text-slate-600" },
];

export function PromotionWorkspace({
  classes,
  selectedClassId,
}: {
  classes: Cls[];
  selectedClassId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [running, setRunning] = useState(false);
  const [createAlumni, setCreateAlumni] = useState(true);
  const [override, setOverride] = useState("");

  function pickClass(id: string) {
    const params = new URLSearchParams();
    params.set("class_id", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (!selectedClassId) {
      setPreview(null);
      return;
    }
    const ac = new AbortController();
    setLoading(true);
    fetch(`/api/promotions/preview?class_id=${selectedClassId}`, { signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json())?.error ?? "Failed to load");
        return r.json();
      })
      .then((data: Preview) => {
        setPreview(data);
        const def = data.suggestion.status === "graduated" ? "graduate" : "promote";
        const init: Record<string, Decision> = {};
        data.students.forEach((s) => {
          init[s.id] = {
            student_id: s.id,
            action: def,
            target_grade: data.suggestion.next_grade ?? undefined,
            target_section: data.source_class.section,
          };
        });
        setDecisions(init);
        setOverride(data.suggestion.next_grade ?? "");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        toast.error(err.message ?? "Failed to load preview");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [selectedClassId]);

  function setAction(studentId: string, action: Action) {
    setDecisions((d) => {
      const existing = d[studentId];
      const next: Decision = { ...existing, student_id: studentId, action };
      if (action === "promote") {
        next.target_grade = existing?.target_grade ?? preview?.suggestion.next_grade ?? undefined;
        next.target_section = existing?.target_section ?? preview?.source_class.section;
      } else if (action === "retain") {
        next.target_grade = preview?.source_class.grade;
        next.target_section = preview?.source_class.section;
      } else {
        next.target_grade = undefined;
        next.target_section = undefined;
      }
      return { ...d, [studentId]: next };
    });
  }

  function setAll(action: Action) {
    if (!preview) return;
    const next: Record<string, Decision> = {};
    preview.students.forEach((s) => {
      next[s.id] = {
        student_id: s.id,
        action,
        target_grade:
          action === "promote"
            ? preview.suggestion.next_grade ?? undefined
            : action === "retain"
              ? preview.source_class.grade
              : undefined,
        target_section: action === "graduate" || action === "transfer" ? undefined : preview.source_class.section,
      };
    });
    setDecisions(next);
  }

  function applyOverride() {
    if (!preview) return;
    setDecisions((d) => {
      const next = { ...d };
      for (const id of Object.keys(next)) {
        if (next[id].action === "promote") next[id] = { ...next[id], target_grade: override };
      }
      return next;
    });
    toast.success(`Promote targets set to grade "${override}"`);
  }

  async function run() {
    if (!preview) return;
    const list = preview.students.map((s) => decisions[s.id]).filter(Boolean);
    if (list.length === 0) {
      toast.error("Nothing to run");
      return;
    }
    const summary = list.reduce<Record<Action, number>>(
      (acc, d) => {
        acc[d.action]++;
        return acc;
      },
      { promote: 0, retain: 0, graduate: 0, transfer: 0 },
    );
    const confirmMsg =
      `Run promotions for ${list.length} students in ${preview.source_class.grade} · ${preview.source_class.section}?\n\n` +
      `Promote: ${summary.promote} · Retain: ${summary.retain} · Graduate: ${summary.graduate} · Transfer: ${summary.transfer}\n\n` +
      `Target year: ${preview.next_year_label ?? "(next)"}.\nProceed?`;
    if (!confirm(confirmMsg)) return;

    setRunning(true);
    try {
      const res = await fetch("/api/promotions/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source_class_id: preview.source_class.id,
          decisions: list,
          create_alumni: createAlumni,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      const data = await res.json();
      toast.success(
        `Done. Promoted ${data.summary.promoted} · Retained ${data.summary.retained} · Graduated ${data.summary.graduated} · Transferred ${data.summary.transferred}`,
      );
      router.refresh();
      // Clear and reload preview — students are no longer in this class
      setPreview(null);
      setDecisions({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Source class</CardTitle>
          <CardDescription>
            Pick the class you want to promote. We'll suggest the next-grade target — you can override per student.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClassId} onValueChange={pickClass}>
            <SelectTrigger>
              <SelectValue placeholder={classes.length ? "Select class" : "No classes yet"} />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  Class {c.grade} · Section {c.section}
                  {c.academic_year && ` · ${c.academic_year}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
          <p className="mt-2">Loading roster…</p>
        </div>
      )}

      {preview && !loading && (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">From</p>
                  <p className="font-display text-base font-semibold text-slate-900">
                    Class {preview.source_class.grade} · {preview.source_class.section}
                  </p>
                  {preview.source_class.academic_year && (
                    <p className="text-xs text-slate-500">{preview.source_class.academic_year}</p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">To (suggested)</p>
                  <p className="font-display text-base font-semibold text-slate-900">
                    {preview.suggestion.status === "graduated"
                      ? "Graduated (no class)"
                      : `Class ${preview.suggestion.next_grade ?? "—"} · ${preview.source_class.section}`}
                  </p>
                  {preview.next_year_label && (
                    <p className="text-xs text-slate-500">{preview.next_year_label}</p>
                  )}
                </div>
              </div>

              {preview.suggestion.next_grade && (
                <div className="flex items-end gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-700">Override promote target</p>
                    <Input
                      value={override}
                      onChange={(e) => setOverride(e.target.value)}
                      className="mt-1 h-9 w-24"
                      placeholder="e.g. 7"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={applyOverride}>
                    Apply
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white p-3">
            <div className="text-xs text-slate-500">
              Quick set all: {" "}
              {ACTIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  className="mx-0.5 rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                  onClick={() => setAll(a.value)}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={createAlumni}
                onChange={(e) => setCreateAlumni(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              Auto-create alumni records for graduating students
            </label>
            <Button onClick={run} disabled={running || preview.students.length === 0}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
              Run promotions
            </Button>
          </div>

          {preview.students.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              No active students in this class.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
              <ul className="divide-y divide-slate-100">
                {preview.students.map((s) => {
                  const d = decisions[s.id];
                  return (
                    <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
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
                        {ACTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const active = d?.action === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAction(s.id, opt.value)}
                              className={cn(
                                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all",
                                active ? opt.cls + " ring-2 ring-current/30" : "text-slate-400 hover:bg-slate-100",
                              )}
                              aria-pressed={active}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {(d?.action === "promote" || d?.action === "retain") && d.target_grade && (
                        <Badge variant="outline" className="text-xs">
                          → Class {d.target_grade} · {d.target_section}
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
