"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PdfUpload } from "@/components/admin/pdf-upload";

type Assignment = {
  id: string;
  class_id: string;
  subject_id: string | null;
  classes: { id: string; grade: string; section: string } | null;
  subjects: { id: string; name: string; code: string | null } | null;
};

export function NewAssignmentDialog({ assignments }: { assignments: Assignment[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(true);

  // unique classes from assignments
  const classOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    assignments.forEach((a) => {
      if (a.classes && !map.has(a.class_id)) {
        map.set(a.class_id, {
          id: a.class_id,
          label: `Class ${a.classes.grade}-${a.classes.section}`,
        });
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  // subject options filtered by selected class
  const subjectOptions = useMemo(
    () =>
      assignments
        .filter((a) => a.class_id === classId && a.subjects)
        .map((a) => ({
          id: a.subjects!.id,
          label: a.subjects!.name + (a.subjects!.code ? ` (${a.subjects!.code})` : ""),
        })),
    [assignments, classId],
  );

  function reset() {
    setClassId("");
    setSubjectId("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setMaxMarks("");
    setPdfUrl(null);
    setIsPublished(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) return toast.error("Pick a class");
    if (!title.trim()) return toast.error("Title is required");

    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          subject_id: subjectId || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          pdf_url: pdfUrl ?? undefined,
          due_date: dueDate || undefined,
          max_marks: maxMarks ? Number(maxMarks) : undefined,
          is_published: isPublished,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err.error === "string" ? err.error : "Failed to create");
      }
      toast.success("Assignment created");
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New assignment</DialogTitle>
          <DialogDescription>
            Post an assignment to a class. Students see it in their dashboard once published.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Class</Label>
              <Select
                value={classId}
                onValueChange={(v) => {
                  setClassId(v);
                  setSubjectId("");
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pick a class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-slate-500">
                      No class assignments yet
                    </div>
                  ) : (
                    classOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
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
                  {subjectOptions.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-slate-500">
                      Pick a class first
                    </div>
                  ) : (
                    subjectOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="a-title">Title</Label>
            <Input
              id="a-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="Algebra worksheet — Chapter 4"
              required
            />
          </div>

          <div>
            <Label htmlFor="a-desc">Instructions</Label>
            <Textarea
              id="a-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5"
              placeholder="Solve problems 1-15 and upload your work as a PDF."
            />
          </div>

          <PdfUpload value={pdfUrl} onChange={setPdfUrl} folder="assignments" label="Attachment (optional)" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-due">Due date (optional)</Label>
              <Input
                id="a-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="a-max">Max marks (optional)</Label>
              <Input
                id="a-max"
                type="number"
                min="0"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="mt-1.5"
                placeholder="20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Publish to students</p>
              <p className="text-xs text-slate-500">
                Drafts are hidden from students until you publish.
              </p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
