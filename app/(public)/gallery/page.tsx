import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera, Images, MapPin, Music, PartyPopper, Trophy, Users } from "lucide-react";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import { formatDate } from "@/lib/utils";
import type { GalleryAlbum } from "@/types/database";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from the school year — events, classrooms, sports, and arts.",
};

export const revalidate = 60;

type AlbumCategory = "events" | "campus" | "sports" | "cultural" | "celebrations" | "student-life";

const CATEGORY_RULES: { id: AlbumCategory; match: RegExp }[] = [
  { id: "sports",         match: /sport|athlet|football|cricket|basketball|swim|track|tournament/i },
  { id: "cultural",       match: /cultural|music|dance|drama|theatre|art|exhibit|recital|concert/i },
  { id: "celebrations",   match: /founders?|day|festival|christmas|diwali|holi|republic|independence|annual|graduation/i },
  { id: "campus",         match: /campus|tour|facility|library|lab|building|garden|chapel/i },
  { id: "student-life",   match: /class|student|life|workshop|club|prefect|orientation|excursion|picnic/i },
];

function categorize(title: string): AlbumCategory {
  for (const r of CATEGORY_RULES) if (r.match.test(title)) return r.id;
  return "events";
}

async function fetchAlbums(): Promise<GalleryAlbum[]> {
  try {
    const supabase = createSupabaseStaticClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("id,title,slug,cover_url,event_date,created_at")
      .eq("is_published", true)
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(96);
    return (data as GalleryAlbum[] | null) ?? [];
  } catch {
    return [];
  }
}

function AlbumGrid({ albums, emptyLabel }: { albums: GalleryAlbum[]; emptyLabel: string }) {
  if (albums.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-16 text-center">
        <Images className="mx-auto h-10 w-10 text-[hsl(var(--ink-soft))]/40" />
        <p className="mt-5 max-w-sm mx-auto text-sm text-[hsl(var(--ink-soft))]">
          {emptyLabel}
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((a) => (
        <Link key={a.id} href={`/gallery/${a.slug}`} className="group block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[hsl(var(--sand))]">
            {a.cover_url ? (
              <Image
                src={a.cover_url}
                alt={a.title}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
              />
            ) : (
              <div className="grid h-full place-items-center text-[hsl(var(--ink-soft))]/40">
                <Images className="h-12 w-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))]/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h3 className="font-display text-xl font-semibold">{a.title}</h3>
              {a.event_date && (
                <p className="text-xs opacity-85">{formatDate(a.event_date)}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CategoryIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Camera;
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
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
        <Icon className="h-6 w-6" />
      </span>
    </div>
  );
}

export default async function GalleryPage() {
  const albums = await fetchAlbums();
  const cms = await getCmsSections([
    "gallery_intro",
    "gallery_hero_image",
    "home_campus_image",
    "campus_sports_image",
    "campus_cultural_image",
    "campus_events_image",
    "campus_student_image",
  ]);
  const HERO_IMG = resolveImage("gallery_hero_image", cms.gallery_hero_image);
  const CAMPUS_IMG = resolveImage("home_campus_image", cms.home_campus_image);
  const SPORTS_IMG = resolveImage("campus_sports_image", cms.campus_sports_image);
  const CULTURAL_IMG = resolveImage("campus_cultural_image", cms.campus_cultural_image);
  const EVENTS_IMG = resolveImage("campus_events_image", cms.campus_events_image);
  const STUDENT_IMG = resolveImage("campus_student_image", cms.campus_student_image);

  const buckets: Record<AlbumCategory, GalleryAlbum[]> = {
    events: [], campus: [], sports: [], cultural: [], celebrations: [], "student-life": [],
  };
  for (const a of albums) buckets[categorize(a.title)].push(a);

  const tabs: TabItem[] = [
    {
      id: "events",
      label: "Events",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <CategoryIntro
            eyebrow="Across the calendar"
            title="A year in pictures."
            description="From annual day to inter-school finals — the milestones that mark our school year, gathered into albums."
            icon={Camera}
          />
          <div className="relative mt-12 aspect-[16/7] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
            <Image src={EVENTS_IMG} alt="School events" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))]/55 via-transparent to-transparent" />
          </div>
          <div className="mt-14">
            <AlbumGrid
              albums={albums}
              emptyLabel="No albums published yet. Check back soon — we update the gallery after every major event."
            />
          </div>
        </section>
      ),
    },
    {
      id: "campus",
      label: "Campus",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <CategoryIntro
            eyebrow="14-acre grounds"
            title="The spaces our students call home."
            description="Quiet libraries, sunlit labs, the chapel courtyard, and the long verandahs students walk every day."
            icon={MapPin}
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[CAMPUS_IMG, EVENTS_IMG, CULTURAL_IMG].map((src, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-[hsl(var(--sand))]">
                <Image src={src} alt="Campus" fill sizes="33vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mt-14">
            <AlbumGrid
              albums={buckets.campus}
              emptyLabel="Campus tour albums coming soon. In the meantime, see the Events tab for recent gatherings on campus."
            />
          </div>
        </section>
      ),
    },
    {
      id: "sports",
      label: "Sports",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <CategoryIntro
            eyebrow="On the field"
            title="Sports, training, and tournaments."
            description="Inter-house championships, district finals, and the everyday training that makes them possible."
            icon={Trophy}
          />
          <div className="mt-12 relative aspect-[16/7] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
            <Image src={SPORTS_IMG} alt="Sports at St. Joseph's" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="mt-14">
            <AlbumGrid
              albums={buckets.sports}
              emptyLabel="Sports albums will appear here as soon as the season's photos are sorted."
            />
          </div>
        </section>
      ),
    },
    {
      id: "cultural",
      label: "Cultural",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <CategoryIntro
            eyebrow="Stage and studio"
            title="Music, dance, drama, and art."
            description="The school auditorium and studios in full flow — recitals, plays, exhibitions, and rehearsals that fill the year."
            icon={Music}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[hsl(var(--sand))]">
              <Image src={CULTURAL_IMG} alt="Cultural performance" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[hsl(var(--sand))]">
              <Image src={EVENTS_IMG} alt="School event" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div className="mt-14">
            <AlbumGrid
              albums={buckets.cultural}
              emptyLabel="Cultural albums will appear here after each performance. Check back soon."
            />
          </div>
        </section>
      ),
    },
    {
      id: "celebrations",
      label: "Celebrations",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <CategoryIntro
            eyebrow="Days that matter"
            title="Founder's Day, festivals, and farewells."
            description="The days the whole school stops for — and the photographs that hold them."
            icon={PartyPopper}
          />
          <div className="mt-12 relative aspect-[16/7] overflow-hidden rounded-[28px] bg-[hsl(var(--primary))]">
            <Image src={EVENTS_IMG} alt="School celebrations" fill sizes="100vw" className="object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))]/80 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-[hsl(var(--ivory))]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                <span className="gold-rule">Since 1965</span>
              </p>
              <h3 className="font-display mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
                Six decades of shared milestones.
              </h3>
            </div>
          </div>
          <div className="mt-14">
            <AlbumGrid
              albums={buckets.celebrations}
              emptyLabel="Celebration albums are added after each event — Founder's Day, annual day, and festivals."
            />
          </div>
        </section>
      ),
    },
    {
      id: "student-life",
      label: "Student Life",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <CategoryIntro
            eyebrow="Day to day"
            title="The unposed, in-between moments."
            description="Classrooms, corridors, clubs, and breaks — the texture of school days, captured the way they actually happen."
            icon={Users}
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[STUDENT_IMG, CAMPUS_IMG, EVENTS_IMG].map((src, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-[hsl(var(--sand))]">
                <Image src={src} alt="Student life" fill sizes="33vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mt-14">
            <AlbumGrid
              albums={buckets["student-life"]}
              emptyLabel="Student-life albums will appear here as we publish them."
            />
          </div>
        </section>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="Gallery"
        title={
          <>
            A year in <span className="italic">pictures.</span>
          </>
        }
        description={
          cms.gallery_intro.body ??
          "Albums from every term — events, milestones, and the small moments that make up a school year."
        }
        image={HERO_IMG}
        imageAlt="St. Joseph's campus gallery"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <TabbedPage tabs={tabs} />
    </>
  );
}
