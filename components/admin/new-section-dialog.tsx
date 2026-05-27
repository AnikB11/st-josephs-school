"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function NewSectionDialog({
  grade,
  existing,
}: {
  grade: string;
  existing: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Suggest the next letter not yet used in this class.
  const suggested = (() => {
    for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H"]) {
      if (!existing.includes(letter)) return letter;
    }
    return "";
  })();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = section.trim().toUpperCase();
    if (!value) {
      toast.error("Enter a section name (e.g. A, B, C)");
      return;
    }
    if (existing.includes(value)) {
      toast.error(`Section ${value} already exists in Class ${grade}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/classes/sections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ grade, section: value }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Could not create section");
      }
      toast.success(`Created Section ${value} in Class ${grade}`);
      setSection("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create section");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setSection(suggested);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add section
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a section to Class {grade}</DialogTitle>
          <DialogDescription>
            Existing sections: {existing.length === 0 ? "—" : existing.join(", ")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="section-input">Section name</Label>
            <Input
              id="section-input"
              autoFocus
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder={suggested || "A"}
              maxLength={5}
              className="mt-1.5 font-mono uppercase"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              A single letter (A, B, C…) or short code. The section appears in the class
              detail page right away.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create section
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
