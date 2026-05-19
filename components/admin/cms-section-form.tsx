"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CmsSectionForm({
  sectionKey,
  initialTitle,
  initialBody,
  placeholder,
}: {
  sectionKey: string;
  initialTitle: string;
  initialBody: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/cms/${encodeURIComponent(sectionKey)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          body: body.trim() || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      toast.success("Saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${sectionKey}-title`}>Title</Label>
        <Input
          id={`${sectionKey}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5"
          placeholder={placeholder}
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor={`${sectionKey}-body`}>Body</Label>
        <Textarea
          id={`${sectionKey}-body`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1.5"
          rows={4}
          maxLength={20000}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </div>
    </div>
  );
}
