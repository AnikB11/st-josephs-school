import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Megaphone,
  Pin,
  Sun,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import { formatDate } from "@/lib/utils";
import type { Notice, NoticeCategory } from "@/types/database";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Notices",
  description: "Announcements, academic notices, and events from the school office.",
};

export const revalidate = 60;

const FETCH_LIMIT = 200;

async function fetchNotices(): Promise<Notice[]> {
  try {
    const supabase = createSupabaseStaticClient();
    const { data } = await supabase
      .from("notices")
      .select(
        "id,title,slug,category,audience,is_pinned,published_at,body,pdf_url,expires_at,archived_at,created_by,created_at",
      )
      .is("archived_at", null)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(FETCH_LIMIT);
    return (data as Notice[] | null) ?? [];
  } catch {
    return [];
  }
}

type TabId = "general" | "academic" | "examinations" | "holidays" | "circulars";

function bucketFor(n: Notice): TabId {
  const t = n.title.toLowerCase();
  if (n.category === "holiday") return "holidays";
  if (n.category === "academic") {
    if (/exam|test|board|result|paper/.test(t)) return "examinations";
    return "academic";
  }
  if (n.category === "general") return "general";
  // urgent + event categories funnel into Circulars unless title says otherwise
  if (/exam|test|board|paper|result/.test(t)) return "examinations";
  if (/holiday|break|vacation|leave/.test(t)) return "holidays";
  return "circulars";
}

const CATEGORY_LABEL: Record<NoticeCategory, string> = {
  general: "General",
  academic: "Academic",
  event: "Event",
  urgent: "Urgent",
  holiday: "Holiday",
};

function NoticeCard({ n }: { n: Notice }) {
  return (
    <Link
      href={`/notices/${n.slug}`}
      className="group flex flex-col gap-3 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6 transition-all hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {n.is_pinned && (
              <Badge variant="default" className="bg-[hsl(var(--primary))] text-[hsl(var(--ivory))]">
                <Pin className="mr-1 h-3 w-3" />
                Pinned
              </Badge>
            )}
            <Badge variant="secondary">{CATEGORY_LABEL[n.category] ?? n.category}</Badge>
            <Badge variant="outline">{n.audience}</Badge>
            {n.pdf_url && (
              <Badge variant="outline" className="border-[hsl(var(--gold))]/60 text-[hsl(var(--ink))]">
                PDF
              </Badge>
            )}
          </div>
          <h3 className="font-display mt-3 text-lg font-semibold text-[hsl(var(--ink))] group-hover:text-[hsl(var(--primary))]">
            {n.title}
          </h3>
          {n.body && (
            <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-[hsl(var(--ink-soft))]">
              {n.body}
            </p>
          )}
        </div>
      </div>
      <span className="shrink-0 text-xs text-[hsl(var(--ink-soft))]">
        {formatDate(n.published_at)}
      </span>
    </Link>
  );
}

function NoticeList({
  items,
  emptyTitle,
  emptyBody,
}: {
  items: Notice[];
  emptyTitle: string;
  emptyBody: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-16 text-center">
        <FileText className="mx-auto h-10 w-10 text-[hsl(var(--ink-soft))]/40" />
        <h4 className="font-display mt-5 text-lg font-semibold text-[hsl(var(--ink))]">
          {emptyTitle}
        </h4>
        <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--ink-soft))]">{emptyBody}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((n) => (
        <NoticeCard key={n.id} n={n} />
      ))}
    </div>
  );
}

function TabIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof FileText;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
          <span className="gold-rule">{eyebrow}</span>
        </p>
        <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-3xl font-semibold text-[hsl(var(--ink))]">{count}</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--ink-soft))]">live</p>
        </div>
      </div>
    </div>
  );
}

export default async function NoticesPage() {
  const [notices, cms] = await Promise.all([
    fetchNotices(),
    getCmsSections(["notices_hero_image"]),
  ]);
  const HERO_IMG = resolveImage("notices_hero_image", cms.notices_hero_image);

  const buckets: Record<TabId, Notice[]> = {
    general: [], academic: [], examinations: [], holidays: [], circulars: [],
  };
  for (const n of notices) buckets[bucketFor(n)].push(n);

  const tabs: TabItem[] = [
    {
      id: "general",
      label: "General",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <TabIntro
            eyebrow="School office"
            title="General announcements."
            description="Day-to-day updates from the school office — parent communications, schedule changes, and reminders."
            icon={Megaphone}
            count={buckets.general.length}
          />
          <div className="mt-12">
            <NoticeList
              items={buckets.general}
              emptyTitle="No general notices right now"
              emptyBody="When the office sends out new announcements, they'll appear here."
            />
          </div>
        </section>
      ),
    },
    {
      id: "academic",
      label: "Academic",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <TabIntro
            eyebrow="Curriculum & classes"
            title="Academic notices."
            description="Syllabus updates, project briefs, teacher communications, and curriculum-specific announcements."
            icon={BookOpen}
            count={buckets.academic.length}
          />
          <div className="mt-12">
            <NoticeList
              items={buckets.academic}
              emptyTitle="No academic notices right now"
              emptyBody="Departments will post here when there are syllabus changes, project briefs, or class-specific notes."
            />
          </div>
        </section>
      ),
    },
    {
      id: "examinations",
      label: "Examinations",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <TabIntro
            eyebrow="Exams & results"
            title="Examination notices."
            description="Datesheets, hall tickets, board updates, and result announcements — everything the examination cell publishes."
            icon={GraduationCap}
            count={buckets.examinations.length}
          />
          <div className="mt-12">
            <NoticeList
              items={buckets.examinations}
              emptyTitle="No examination notices right now"
              emptyBody="Datesheets and result announcements will appear here ahead of each examination cycle."
            />
          </div>
        </section>
      ),
    },
    {
      id: "holidays",
      label: "Holidays",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <TabIntro
            eyebrow="Calendar"
            title="Holiday notices."
            description="Term breaks, declared holidays, festival closures, and academic calendar updates."
            icon={Sun}
            count={buckets.holidays.length}
          />
          <div className="mt-12">
            <NoticeList
              items={buckets.holidays}
              emptyTitle="No holiday notices right now"
              emptyBody="Term break dates and festival closures will be posted here."
            />
          </div>
        </section>
      ),
    },
    {
      id: "circulars",
      label: "Circulars",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <TabIntro
            eyebrow="Office circulars"
            title="Circulars & urgent updates."
            description="Formal circulars, urgent notices, and event communications routed through the school office."
            icon={ClipboardList}
            count={buckets.circulars.length}
          />
          <div className="mt-12">
            <NoticeList
              items={buckets.circulars}
              emptyTitle="No circulars right now"
              emptyBody="Urgent notices and formal circulars appear here as soon as the office issues them."
            />
          </div>
          <div className="mt-12 flex justify-center">
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-[hsl(var(--primary))]/30 px-7 text-sm font-semibold tracking-wide text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/8"
              >
                Can't find a notice? Contact the office
              </Button>
            </Link>
          </div>
        </section>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="Notices"
        title={
          <>
            School <span className="italic">announcements.</span>
          </>
        }
        description="Academic, administrative, and event notices — pinned items appear first."
        image={HERO_IMG}
        imageAlt="School notice board"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Notices" }]}
      />
      <TabbedPage tabs={tabs} />
    </>
  );
}
