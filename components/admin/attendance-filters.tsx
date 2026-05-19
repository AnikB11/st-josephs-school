"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Cls = { id: string; grade: string; section: string };

export function AttendanceFilters({
  classes,
  selectedClassId,
  selectedDate,
}: {
  classes: Cls[];
  selectedClassId?: string;
  selectedDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function update(next: { class_id?: string; date?: string }) {
    const params = new URLSearchParams();
    const classId = next.class_id ?? selectedClassId;
    const date = next.date ?? selectedDate;
    if (classId) params.set("class_id", classId);
    if (date) params.set("date", date);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
      <Select value={selectedClassId} onValueChange={(v) => update({ class_id: v })}>
        <SelectTrigger>
          <SelectValue placeholder={classes.length === 0 ? "No classes yet" : "Select class"} />
        </SelectTrigger>
        <SelectContent>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              Class {c.grade} · Section {c.section}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => update({ date: e.target.value })}
      />
    </div>
  );
}
