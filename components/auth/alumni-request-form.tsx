"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "@/components/admin/photo-upload";

type Payload = {
  full_name: string;
  email: string;
  password: string;
  graduation_year: number;
  current_position: string | null;
  current_company: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
};

export function AlumniRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradYear, setGradYear] = useState<number>(new Date().getFullYear());
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [linkedin, setLinkedin] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const payload: Payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      graduation_year: gradYear,
      current_position: role.trim() || null,
      current_company: company.trim() || null,
      bio: bio.trim() || null,
      photo_url: photoUrl,
      linkedin_url: linkedin.trim() || null,
    };

    setBusy(true);
    try {
      const res = await fetch("/api/alumni/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string" ? body.error : "Could not submit request.",
        );
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="font-display mt-3 text-lg font-semibold text-slate-900">
          Request submitted
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Thanks! The alumni office will review your details and approve your access.
          You&apos;ll be able to sign in with your email and password once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <PhotoUpload value={photoUrl} onChange={setPhotoUrl} folder="alumni" label="Photo (optional)" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="ar-name">Full name</Label>
          <Input
            id="ar-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ar-email">Email</Label>
          <Input
            id="ar-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ar-password">Password</Label>
          <Input
            id="ar-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ar-year">Graduation year</Label>
          <Input
            id="ar-year"
            type="number"
            min={1900}
            max={3000}
            value={gradYear}
            onChange={(e) => setGradYear(Number(e.target.value))}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ar-role">Current role (optional)</Label>
          <Input
            id="ar-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Product Manager"
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ar-company">Company (optional)</Label>
          <Input
            id="ar-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Stripe"
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ar-linkedin">LinkedIn URL (optional)</Label>
          <Input
            id="ar-linkedin"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/…"
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ar-bio">Short bio (optional)</Label>
          <Textarea
            id="ar-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mt-1.5"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={busy} className="w-full h-11">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit request
      </Button>
    </form>
  );
}
