"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AlumniRecord = {
  id: string;
  full_name: string;
  graduation_year: number;
  current_position: string | null;
  current_company: string | null;
  bio: string | null;
  linkedin_url: string | null;
  email: string | null;
  is_public: boolean;
};

export function AlumniProfileForm({
  userId,
  defaultName,
  existing,
}: {
  userId: string | null;
  defaultName: string;
  existing: AlumniRecord | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(existing?.full_name ?? defaultName);
  const [gradYear, setGradYear] = useState(existing?.graduation_year?.toString() ?? "");
  const [role, setRole] = useState(existing?.current_position ?? "");
  const [company, setCompany] = useState(existing?.current_company ?? "");
  const [linkedin, setLinkedin] = useState(existing?.linkedin_url ?? "");
  const [bio, setBio] = useState(existing?.bio ?? "");

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!gradYear || isNaN(Number(gradYear))) {
      toast.error("Please enter a valid graduation year");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: name.trim(),
        graduation_year: Number(gradYear),
        current_position: role.trim() || null,
        current_company: company.trim() || null,
        bio: bio.trim() || null,
        linkedin_url: linkedin.trim() || null,
        is_public: true,
      };

      if (existing) {
        /* Update existing profile */
        const res = await fetch(`/api/alumni/${existing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Failed to update profile");
        }
        toast.success("Profile updated!");
      } else {
        /* Create new profile */
        if (userId) payload.user_id = userId;
        const res = await fetch("/api/alumni", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            typeof err.error === "string" ? err.error : "Failed to save profile",
          );
        }
        toast.success("Profile created! You're now in the alumni directory.");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your profile</CardTitle>
        <CardDescription>
          {existing
            ? "Update your alumni directory listing."
            : "How you appear in the public alumni directory."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="alumni-name">Full name</Label>
          <Input
            id="alumni-name"
            className="mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="alumni-grad-year">Graduation year</Label>
          <Input
            id="alumni-grad-year"
            type="number"
            className="mt-1.5"
            placeholder="e.g. 2014"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="alumni-role">Current role</Label>
          <Input
            id="alumni-role"
            className="mt-1.5"
            placeholder="e.g. Product Manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="alumni-company">Company</Label>
          <Input
            id="alumni-company"
            className="mt-1.5"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="alumni-linkedin">LinkedIn URL</Label>
          <Input
            id="alumni-linkedin"
            className="mt-1.5"
            placeholder="https://linkedin.com/in/…"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="alumni-bio">Short bio</Label>
          <Textarea
            id="alumni-bio"
            className="mt-1.5"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existing ? "Update profile" : "Save profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
