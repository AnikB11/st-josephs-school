"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Initial = {
  facebook: string;
  instagram: string;
  youtube: string;
  whatsappNumber: string;
  whatsappMessage: string;
};

const KEY_MAP: Record<keyof Initial, string> = {
  facebook: "footer_social_facebook",
  instagram: "footer_social_instagram",
  youtube: "footer_social_youtube",
  whatsappNumber: "whatsapp_number",
  whatsappMessage: "whatsapp_message",
};

export function SiteLinksForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [values, setValues] = useState<Initial>(initial);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof Initial>(field: K, v: string) {
    setValues((prev) => ({ ...prev, [field]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const changed = (Object.keys(KEY_MAP) as (keyof Initial)[]).filter(
        (k) => values[k] !== initial[k],
      );
      if (changed.length === 0) {
        toast.info("No changes");
        return;
      }
      await Promise.all(
        changed.map((field) =>
          fetch(`/api/cms/${encodeURIComponent(KEY_MAP[field])}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ body: values[field].trim() || null }),
          }).then(async (r) => {
            if (!r.ok) throw new Error((await r.json())?.error ?? "Failed");
          }),
        ),
      );
      toast.success("Saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4 text-[#1877F2]" />
            Facebook URL
          </Label>
          <Input
            id="facebook"
            type="url"
            value={values.facebook}
            onChange={(e) => update("facebook", e.target.value)}
            className="mt-1.5"
            placeholder="https://facebook.com/yourpage"
            maxLength={500}
          />
        </div>
        <div>
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-[#E4405F]" />
            Instagram URL
          </Label>
          <Input
            id="instagram"
            type="url"
            value={values.instagram}
            onChange={(e) => update("instagram", e.target.value)}
            className="mt-1.5"
            placeholder="https://instagram.com/yourpage"
            maxLength={500}
          />
        </div>
        <div>
          <Label htmlFor="youtube" className="flex items-center gap-2">
            <Youtube className="h-4 w-4 text-[#FF0000]" />
            YouTube URL
          </Label>
          <Input
            id="youtube"
            type="url"
            value={values.youtube}
            onChange={(e) => update("youtube", e.target.value)}
            className="mt-1.5"
            placeholder="https://youtube.com/@yourchannel"
            maxLength={500}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <h3 className="text-sm font-semibold text-slate-900">
            Floating WhatsApp button
          </h3>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          The button appears on every public page when a number is set. Leave
          empty to hide it.
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="whatsapp_number">WhatsApp number</Label>
            <Input
              id="whatsapp_number"
              value={values.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              className="mt-1.5"
              placeholder="e.g. 919876543210 (country code + number, no +)"
              maxLength={20}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Include country code, digits only. Example: <code>919876543210</code> for India +91.
            </p>
          </div>
          <div>
            <Label htmlFor="whatsapp_message">
              Pre-filled message <span className="text-slate-400">(optional)</span>
            </Label>
            <Textarea
              id="whatsapp_message"
              value={values.whatsappMessage}
              onChange={(e) => update("whatsappMessage", e.target.value)}
              className="mt-1.5"
              rows={3}
              placeholder="Hello, I'd like to know more about admissions."
              maxLength={500}
            />
          </div>
        </div>
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
