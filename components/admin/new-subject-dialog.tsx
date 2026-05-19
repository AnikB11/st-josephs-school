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

export function NewSubjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [grade, setGrade] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || null,
          grade: grade.trim() || null,
          max_marks: maxMarks,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Subject added");
      setOpen(false);
      setName("");
      setCode("");
      setGrade("");
      setMaxMarks(100);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4" /> Add subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a subject</DialogTitle>
          <DialogDescription>
            Subjects are reused across exams. Leave grade blank if the subject applies to all grades.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="sub-name">Name</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mathematics"
              className="mt-1.5"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="sub-code">Code</Label>
              <Input
                id="sub-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MATH"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="sub-grade">Grade (optional)</Label>
              <Input
                id="sub-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 10"
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="sub-max">Max marks</Label>
            <Input
              id="sub-max"
              type="number"
              min={1}
              max={1000}
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Add subject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
