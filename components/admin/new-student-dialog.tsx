"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PhotoUpload } from "@/components/admin/photo-upload";

type Parent = { id: string; full_name: string; email: string | null; phone: string | null };

export function NewStudentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // student
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [grade, setGrade] = useState("1");
  const [section, setSection] = useState("A");
  const [roll, setRoll] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // parent
  const [parentMode, setParentMode] = useState<"existing" | "new">("new");
  const [parentSearch, setParentSearch] = useState("");
  const [parents, setParents] = useState<Parent[]>([]);
  const [parentId, setParentId] = useState<string | undefined>();
  const [newParent, setNewParent] = useState({ full_name: "", email: "", phone: "", occupation: "" });

  useEffect(() => {
    if (parentMode !== "existing") return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/parents${parentSearch ? `?q=${encodeURIComponent(parentSearch)}` : ""}`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const data = await res.json();
          setParents(data.parents ?? []);
        }
      } catch {
        /* aborted */
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [parentSearch, parentMode]);

  function reset() {
    setFullName("");
    setDob("");
    setGender("");
    setGrade("1");
    setSection("A");
    setRoll("");
    setBloodGroup("");
    setAddress("");
    setPhotoUrl(null);
    setParentMode("new");
    setParentSearch("");
    setParentId(undefined);
    setNewParent({ full_name: "", email: "", phone: "", occupation: "" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !dob) {
      toast.error("Name and date of birth are required");
      return;
    }
    if (parentMode === "existing" && !parentId) {
      toast.error("Pick a parent or switch to 'New parent'");
      return;
    }
    if (parentMode === "new" && !newParent.full_name.trim()) {
      toast.error("Parent name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: fullName.trim(),
        date_of_birth: dob,
        gender: gender || undefined,
        grade,
        section,
        roll_number: roll.trim() || undefined,
        blood_group: bloodGroup.trim() || undefined,
        address: address.trim() || undefined,
        photo_url: photoUrl ?? undefined,
      };
      if (parentMode === "existing") {
        payload.parent_id = parentId;
      } else {
        payload.parent = {
          full_name: newParent.full_name.trim(),
          email: newParent.email.trim() || undefined,
          phone: newParent.phone.trim() || undefined,
          occupation: newParent.occupation.trim() || undefined,
        };
      }

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.error?.formErrors?.[0] ??
            err.error?.fieldErrors
              ? JSON.stringify(err.error.fieldErrors)
              : err.error ?? "Failed to add student",
        );
      }
      const data = await res.json();
      toast.success(`Admitted: ${data.student?.admission_number}`);
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Add student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add a new student</DialogTitle>
          <DialogDescription>
            An admission number is generated automatically. A class will be created if it
            doesn't already exist for this academic year.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Student basics */}
          <section className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-slate-900">Student</h3>
            <PhotoUpload value={photoUrl} onChange={setPhotoUrl} folder="students" label="Photo" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="s-name">Full name</Label>
                <Input
                  id="s-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="s-dob">Date of birth</Label>
                <Input
                  id="s-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Class</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Nursery", "KG", ...Array.from({ length: 12 }, (_, i) => String(i + 1))].map(
                      (g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Section</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E"].map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="s-roll">Roll number</Label>
                <Input
                  id="s-roll"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="s-bg">Blood group</Label>
                <Input
                  id="s-bg"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  placeholder="O+"
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="s-addr">Address</Label>
                <Textarea
                  id="s-addr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          {/* Parent */}
          <section className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-slate-900">Parent / Guardian</h3>
            <Tabs value={parentMode} onValueChange={(v) => setParentMode(v as "existing" | "new")}>
              <TabsList>
                <TabsTrigger value="new">Add new parent</TabsTrigger>
                <TabsTrigger value="existing">Link existing parent</TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="p-name">Full name</Label>
                    <Input
                      id="p-name"
                      value={newParent.full_name}
                      onChange={(e) => setNewParent({ ...newParent, full_name: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="p-email">Email</Label>
                    <Input
                      id="p-email"
                      type="email"
                      value={newParent.email}
                      onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="p-phone">Phone</Label>
                    <Input
                      id="p-phone"
                      value={newParent.phone}
                      onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="p-occ">Occupation</Label>
                    <Input
                      id="p-occ"
                      value={newParent.occupation}
                      onChange={(e) => setNewParent({ ...newParent, occupation: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="existing" className="space-y-3 pt-2">
                <Input
                  placeholder="Search by name, email, or phone"
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                />
                <div className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                  {parents.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">No parents found.</p>
                  ) : (
                    parents.map((p) => (
                      <label
                        key={p.id}
                        className={`flex cursor-pointer items-center gap-3 p-3 text-sm transition-colors ${
                          parentId === p.id ? "bg-primary/5" : "hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="parent_pick"
                          checked={parentId === p.id}
                          onChange={() => setParentId(p.id)}
                          className="h-4 w-4 text-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">{p.full_name}</p>
                          <p className="truncate text-xs text-slate-500">
                            {[p.email, p.phone].filter(Boolean).join(" · ") || "—"}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Admit student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
