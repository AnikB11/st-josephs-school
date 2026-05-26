"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
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
import { PhotoUpload } from "@/components/admin/photo-upload";

export function NewTeacherDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().slice(0, 10));
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  function reset() {
    setFullName("");
    setEmail("");
    setEmployeeCode("");
    setPhone("");
    setQualification("");
    setDateOfJoining(new Date().toISOString().slice(0, 10));
    setPhotoUrl(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          invited_email: email.trim() || undefined,
          employee_code: employeeCode.trim() || undefined,
          phone: phone.trim() || undefined,
          qualification: qualification.trim() || undefined,
          date_of_joining: dateOfJoining,
          photo_url: photoUrl ?? undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.error === "string" ? err.error : "Failed to invite teacher",
        );
      }
      toast.success(`${fullName} invited`);
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
          <UserPlus className="h-4 w-4" /> Invite teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite a teacher</DialogTitle>
          <DialogDescription>
            With both an email and an employee code, the teacher can immediately sign
            in at <span className="font-medium text-slate-700">/teacher/login</span>{" "}
            using the email + employee code as the password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} folder="teachers" label="Photo" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="t-name">Full name</Label>
              <Input
                id="t-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="t-email">Email (Google account)</Label>
              <Input
                id="t-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                placeholder="teacher@gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="t-emp">Employee code</Label>
              <Input
                id="t-emp"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                className="mt-1.5"
                placeholder="TCH-001"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Acts as the teacher's initial password — share it privately.
              </p>
            </div>
            <div>
              <Label htmlFor="t-phone">Phone</Label>
              <Input
                id="t-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="t-doj">Date of joining</Label>
              <Input
                id="t-doj"
                type="date"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="t-qual">Qualification</Label>
              <Input
                id="t-qual"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="mt-1.5"
                placeholder="M.Sc. Mathematics, B.Ed."
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
