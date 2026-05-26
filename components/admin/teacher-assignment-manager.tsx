"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Assignment = {
  id: string;
  is_class_teacher: boolean;
  classes: { id: string; grade: string; section: string } | null;
  subjects: { id: string; name: string; code: string | null } | null;
};
type ClassRow = { id: string; grade: string; section: string };
type SubjectRow = { id: string; name: string; code: string | null; grade: string | null };

export function TeacherAssignmentManager({
  teacherId,
  assignments,
  classes,
  subjects,
}: {
  teacherId: string;
  assignments: Assignment[];
  classes: ClassRow[];
  subjects: SubjectRow[];
}) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [adding, setAdding] = useState(false);

  async function add() {
    if (!classId) {
      toast.error("Pick a class");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/teachers/${teacherId}/assignments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          subject_id: subjectId || undefined,
          is_class_teacher: isClassTeacher,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Assignment added");
      setClassId("");
      setSubjectId("");
      setIsClassTeacher(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function remove(assignmentId: string) {
    if (!confirm("Remove this assignment?")) return;
    try {
      const res = await fetch(
        `/api/teachers/${teacherId}/assignments?assignment_id=${assignmentId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Assignment removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="space-y-5">
      {/* Existing assignments */}
      {assignments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No assignments yet. Add one below.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {a.classes && (
                  <Badge variant="secondary">
                    Class {a.classes.grade}-{a.classes.section}
                  </Badge>
                )}
                {a.subjects && (
                  <span className="text-sm font-medium text-slate-900">
                    {a.subjects.name}
                    {a.subjects.code && (
                      <span className="ml-1.5 font-mono text-xs text-slate-400">
                        {a.subjects.code}
                      </span>
                    )}
                  </span>
                )}
                {a.is_class_teacher && <Badge variant="default">Class teacher</Badge>}
              </div>
              <button
                onClick={() => remove(a.id)}
                className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <h4 className="font-display text-sm font-semibold text-slate-900">
          Add assignment
        </h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-slate-500">No classes yet</div>
                ) : (
                  classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      Class {c.grade}-{c.section}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subject (optional)</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {subjects.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-slate-500">No subjects yet</div>
                ) : (
                  subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {s.grade && ` (Grade ${s.grade})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <Label className="mb-1.5">Class teacher?</Label>
            <div className="flex h-9 items-center gap-2">
              <Switch checked={isClassTeacher} onCheckedChange={setIsClassTeacher} />
              <span className="text-xs text-slate-500">
                {isClassTeacher ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={add} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add assignment
          </Button>
        </div>
      </div>
    </div>
  );
}
