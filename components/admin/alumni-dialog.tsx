"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
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
import { PhotoUpload } from "@/components/admin/photo-upload";

export type AlumniInput = {
  id?: string;
  full_name: string;
  graduation_year: number;
  current_position: string | null;
  current_company: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  is_public: boolean;
};

export function AlumniDialog({
  mode,
  initial,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  mode: "create" | "edit";
  initial?: AlumniInput;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  };
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [gradYear, setGradYear] = useState<number>(
    initial?.graduation_year ?? new Date().getFullYear(),
  );
  const [role, setRole] = useState(initial?.current_position ?? "");
  const [company, setCompany] = useState(initial?.current_company ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photo_url ?? null);
  const [linkedin, setLinkedin] = useState(initial?.linkedin_url ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? true);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!gradYear || gradYear < 1900) {
      toast.error("Graduation year is required");
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      graduation_year: gradYear,
      current_position: role.trim() || null,
      current_company: company.trim() || null,
      bio: bio.trim() || null,
      photo_url: photoUrl ?? null,
      linkedin_url: linkedin.trim() || null,
      email: email.trim() || null,
      is_public: isPublic,
    };

    setBusy(true);
    try {
      const res = await fetch(
        mode === "edit" ? `/api/alumni/${initial!.id}` : "/api/alumni",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success(mode === "edit" ? "Profile updated" : "Alumnus added");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              {mode === "edit" ? (
                <>
                  <Pencil className="h-4 w-4" /> Edit
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add alumnus
                </>
              )}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit alumnus profile" : "Add an alumnus"}
          </DialogTitle>
          <DialogDescription>
            Public profiles appear in the alumni directory at <code>/alumni</code>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} folder="alumni" label="Photo" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="a-name">Full name</Label>
              <Input
                id="a-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="a-year">Graduation year</Label>
              <Input
                id="a-year"
                type="number"
                min={1900}
                max={3000}
                value={gradYear}
                onChange={(e) => setGradYear(Number(e.target.value))}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="a-email">Email</Label>
              <Input
                id="a-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="a-role">Current role</Label>
              <Input
                id="a-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Product Manager"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="a-company">Company</Label>
              <Input
                id="a-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Stripe"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="a-linkedin">LinkedIn URL</Label>
              <Input
                id="a-linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="a-bio">Short bio</Label>
              <Textarea
                id="a-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={2000}
                className="mt-1.5"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Show this profile in the public alumni directory
          </label>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Save changes" : "Add alumnus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
