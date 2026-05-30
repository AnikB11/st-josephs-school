"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; label: string };

/**
 * Exam + class picker for the PDF-upload results flow. (Subject is intentionally
 * not in the picker: one PDF per (student, exam) holds all subjects already.)
 */
export function ResultsFilters({
  exams,
  classes,
  selected,
}: {
  exams: Option[];
  classes: Option[];
  selected: { exam_id?: string; class_id?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();

  function update(patch: Partial<typeof selected>) {
    const params = new URLSearchParams();
    const next = { ...selected, ...patch };
    if (next.exam_id) params.set("exam_id", next.exam_id);
    if (next.class_id) params.set("class_id", next.class_id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Select value={selected.exam_id} onValueChange={(v) => update({ exam_id: v })}>
        <SelectTrigger>
          <SelectValue placeholder={exams.length ? "Select exam" : "No exams yet"} />
        </SelectTrigger>
        <SelectContent>
          {exams.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selected.class_id} onValueChange={(v) => update({ class_id: v })}>
        <SelectTrigger>
          <SelectValue placeholder={classes.length ? "Select class" : "No classes yet"} />
        </SelectTrigger>
        <SelectContent>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
