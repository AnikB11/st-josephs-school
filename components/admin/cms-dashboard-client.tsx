"use client";

import { useState } from "react";
import {
  Layout,
  Info,
  BookOpen,
  GraduationCap,
  Phone,
  Image as ImageIcon,
  Bell,
  Users,
  Trophy,
  Sparkles,
  Globe,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CmsSectionForm } from "@/components/admin/cms-section-form";
import { CmsImageUploader } from "@/components/admin/cms-image-uploader";
import { CmsMediaUploader } from "@/components/admin/cms-media-uploader";
import { SiteLinksForm } from "@/components/admin/site-links-form";
import { IMAGE_PAGES } from "@/lib/cms-images";

type CmsRow = {
  section_key: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
};

const PAGES = [
  { id: "home", label: "Homepage", icon: Layout },
  { id: "about", label: "About Page", icon: Info },
  { id: "academics", label: "Academics Page", icon: BookOpen },
  { id: "campus-life", label: "Campus Life Page", icon: Sparkles },
  { id: "admissions", label: "Admissions Page", icon: GraduationCap },
  { id: "gallery", label: "Gallery Page", icon: ImageIcon },
  { id: "notices", label: "Notices Page", icon: Bell },
  { id: "alumni", label: "Alumni Page", icon: Users },
  { id: "contact", label: "Contact Page", icon: Phone },
  { id: "results", label: "Results Page", icon: Trophy },
  { id: "site-wide", label: "Site-wide (Footer & WhatsApp)", icon: Globe },
];

const PAGE_SECTIONS: Record<string, { key: string; title: string; placeholder?: string }[]> = {
  home: [
    { key: "hero_headline", title: "Hero Headline", placeholder: "A modern ecosystem for tomorrow's leaders." },
    { key: "principal_message", title: "Principal's Message Summary", placeholder: "A short note from the principal…" },
  ],
  about: [
    { key: "about_intro", title: "Introduction Text", placeholder: "A school built on character, curiosity, and care." },
    { key: "principal_message", title: "Full Principal's Message", placeholder: "A short note from the principal…" },
  ],
  academics: [
    { key: "academics_intro", title: "Academics Introduction", placeholder: "Not just what to think, but how to think." },
  ],
  "campus-life": [],
  admissions: [
    { key: "admissions_intro", title: "Admissions Process Introduction", placeholder: "Join a community that knows your child." },
  ],
  contact: [
    { key: "contact_intro", title: "Contact Information Introduction", placeholder: "We're here to help. Reach out to us." },
  ],
  gallery: [
    { key: "gallery_intro", title: "Gallery Album Introduction", placeholder: "Moments from our vibrant campus life." },
  ],
  notices: [
    { key: "notices_intro", title: "Notice Board Introduction", placeholder: "Important announcements and circulars." },
  ],
  alumni: [],
  results: [],
};

export function CmsDashboardClient({ initialData }: { initialData: Record<string, CmsRow> }) {
  const [selectedPage, setSelectedPage] = useState<string>("home");

  const pageInfo = PAGES.find((p) => p.id === selectedPage);
  const activeSections = PAGE_SECTIONS[selectedPage] || [];
  const imageGroup = IMAGE_PAGES.find((p) => p.pageId === selectedPage);
  const imageSlots = imageGroup?.slots ?? [];
  const PageIcon = pageInfo?.icon || Layout;

  return (
    <div className="space-y-6">
      {/* Page Selector Card */}
      <Card className="border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Select Page to Edit</CardTitle>
          <CardDescription>
            Pick a page to manage its copy and images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-sm items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <PageIcon className="h-5 w-5" />
            </div>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Page..." />
              </SelectTrigger>
              <SelectContent>
                {PAGES.map((p) => {
                  const Icon = p.icon;
                  return (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{p.label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Page heading */}
      <div className="flex items-center gap-2 px-1">
        <PageIcon className="h-5 w-5 text-blue-600" />
        <h2 className="font-display text-lg font-bold text-slate-900">
          Editing: {pageInfo?.label}
        </h2>
      </div>

      {/* Text sections */}
      {activeSections.length > 0 && (
        <div className="grid gap-6">
          {activeSections.map((s) => {
            const row = initialData[s.key];
            return (
              <Card
                key={s.key}
                className="border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_6px_24px_rgba(0,0,0,0.04)]"
              >
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900">{s.title}</CardTitle>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                      key: {s.key}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <CmsSectionForm
                    sectionKey={s.key}
                    initialTitle={row?.title ?? ""}
                    initialBody={row?.body ?? ""}
                    placeholder={s.placeholder}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Image sections */}
      {imageSlots.length > 0 && (
        <Card className="border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Images</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Upload custom images for this page. JPEG / PNG / WebP, up to 10 MB.
              Resetting falls back to the original placeholder.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {imageSlots.map((slot) => {
                const common = {
                  sectionKey: slot.key,
                  label: slot.label,
                  currentUrl: initialData[slot.key]?.image_url ?? null,
                  fallbackUrl: slot.fallback,
                };
                return slot.mediaType === "media" ? (
                  <CmsMediaUploader key={slot.key} {...common} />
                ) : (
                  <CmsImageUploader key={slot.key} {...common} />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPage === "site-wide" && (
        <Card className="border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Footer social links & floating WhatsApp
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Edit the social links shown in the footer and configure the
              floating WhatsApp chat button that appears on every public page.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <SiteLinksForm
              initial={{
                facebook: initialData["footer_social_facebook"]?.body ?? "",
                instagram: initialData["footer_social_instagram"]?.body ?? "",
                youtube: initialData["footer_social_youtube"]?.body ?? "",
                whatsappNumber: initialData["whatsapp_number"]?.body ?? "",
                whatsappMessage: initialData["whatsapp_message"]?.body ?? "",
              }}
            />
          </CardContent>
        </Card>
      )}

      {activeSections.length === 0 && imageSlots.length === 0 && selectedPage !== "site-wide" && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
          No editable content configured for this page.
        </div>
      )}
    </div>
  );
}
