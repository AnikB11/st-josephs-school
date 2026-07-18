import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  Globe,
  Linkedin,
  Quote,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { initials } from "@/lib/utils";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import type { Alumnus } from "@/types/database";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Alumni",
  description: "The alumni community of St. Joseph's School, Kingston — reunions, stories, and ways to stay connected with the school in Rhenock, Sikkim.",
};

export const revalidate = 300;

// Anonymous fallback entries used only when the alumni table is empty in Supabase.
// As alumni sign up and are approved by the admin portal, this list is replaced
// with real profiles.
const PLACEHOLDER: Alumnus[] = [];

const ACHIEVEMENTS = [
  { icon: Award,     title: "Since 1996",              body: "Batches of ICSE and ISC graduates who have gone on to college, career, and community life across Sikkim and beyond." },
  { icon: BookOpen,  title: "Higher studies",          body: "Alumni pursuing under-graduate and post-graduate studies in Sikkim, West Bengal, and other parts of India." },
  { icon: Globe,     title: "In many fields",          body: "Teachers, medical professionals, engineers, civil servants, entrepreneurs, and workers in the arts and social sectors." },
  { icon: Briefcase, title: "Rooted at home",          body: "Many alumni continue to serve the people of Sikkim — in schools, hospitals, government, and small businesses." },
];

// Approximate recurring dates. Actual dates for each year are shared through the
// alumni portal and school notices.
const ALUMNI_EVENTS = [
  { date: "Feb",          title: "School Anniversary & Alumni Meet", place: "School grounds",         tag: "Open to all batches" },
  { date: "19 Mar",       title: "Feast of St. Joseph",              place: "School Chapel",           tag: "Community gathering" },
  { date: "Dec",          title: "Christmas Carol & Reunion",        place: "Chapel & Assembly Hall",  tag: "Festive" },
  { date: "Throughout year", title: "Alumni Talks & Careers Sharing", place: "On invitation from the school", tag: "Students × alumni" },
];

const STORIES = [
  {
    quote: "The teachers at Kingston taught us to work hard, but more than that, to be kind. That has stayed with me longer than any lesson.",
    name: "An alumnus",
    role: "From an early ISC batch",
  },
  {
    quote: "St. Joseph's gave me confidence in English and a love for reading — two gifts I carry into every job I do.",
    name: "An alumna",
    role: "Currently in higher studies",
  },
  {
    quote: "Love and Service is not a slogan on the school badge — it is the compass we were quietly given, and it still guides my choices.",
    name: "An alumnus",
    role: "Working in the health sector",
  },
];

async function fetchAlumni() {
  try {
    const supabase = createSupabaseStaticClient();
    const { data } = await supabase
      .from("alumni")
      .select("id,full_name,graduation_year,current_position,current_company,bio,photo_url,linkedin_url")
      .eq("is_public", true)
      .order("graduation_year", { ascending: false })
      .limit(30);
    return (data as Alumnus[]) ?? [];
  } catch {
    return [];
  }
}

function AlumnusCard({ a }: { a: Alumnus }) {
  return (
    <article className="group h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.25)]">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-[hsl(var(--primary))]/10 font-display text-[hsl(var(--primary))]">
            {initials(a.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-display truncate text-base font-semibold text-[hsl(var(--ink))]">
            {a.full_name}
          </p>
          <p className="text-xs text-[hsl(var(--ink-soft))]">Class of {a.graduation_year}</p>
        </div>
      </div>
      {a.current_position && (
        <p className="mt-4 flex items-start gap-2 text-sm text-[hsl(var(--ink))]">
          <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ink-soft))]" />
          <span>
            {a.current_position}
            {a.current_company && (
              <span className="text-[hsl(var(--ink-soft))]"> · {a.current_company}</span>
            )}
          </span>
        </p>
      )}
      {a.bio && <p className="mt-2 text-sm text-[hsl(var(--ink-soft))]">{a.bio}</p>}
      {a.linkedin_url && (
        <a
          href={a.linkedin_url}
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--primary))]"
        >
          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
        </a>
      )}
    </article>
  );
}

export default async function AlumniPage() {
  const [fetched, cms] = await Promise.all([
    fetchAlumni(),
    getCmsSections(["alumni_hero_image", "alumni_network_image"]),
  ]);
  const alumni = fetched.length ? fetched : PLACEHOLDER;
  const HERO_IMG = resolveImage("alumni_hero_image", cms.alumni_hero_image);
  const NETWORK_IMG = resolveImage("alumni_network_image", cms.alumni_network_image);

  const tabs: TabItem[] = [
    {
      id: "featured",
      label: "Featured Alumni",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Since 1996</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
                Where our alumni are today.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
                Teachers, doctors, engineers, civil servants, entrepreneurs, and community workers —
                the former students of St. Joseph&apos;s, Kingston, quietly carrying love and service
                into every part of their lives.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">All batches</Badge>
              <Badge variant="secondary" className="rounded-full">2020s</Badge>
              <Badge variant="secondary" className="rounded-full">2010s</Badge>
              <Badge variant="secondary" className="rounded-full">2000s</Badge>
              <Badge variant="secondary" className="rounded-full">1990s</Badge>
            </div>
          </div>
          <div className="mt-12">
            {alumni.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-16 text-center">
                <Users className="mx-auto h-10 w-10 text-[hsl(var(--ink-soft))]/40" />
                <h4 className="font-display mt-5 text-lg font-semibold text-[hsl(var(--ink))]">
                  Our alumni directory is growing.
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--ink-soft))]">
                  As former students join the alumni portal and their profiles are approved, they
                  will appear here. If you are an alumna or alumnus of St. Joseph&apos;s, Kingston —
                  we would love to hear from you.
                </p>
                <div className="mt-6">
                  <Link href="/alumni-portal/request">
                    <Button
                      className="rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
                    >
                      Request an alumni profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {alumni.map((a) => (
                  <AlumnusCard key={a.id} a={a} />
                ))}
              </div>
            )}
          </div>
        </section>
      ),
    },
    {
      id: "achievements",
      label: "Achievements",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">Where our alumni go</span>
            </p>
            <h2 className="font-display mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
              What our former students go on to do.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
              From colleges in Sikkim and neighbouring states, into varied careers and communities —
              here is the shape of what school life at Kingston prepares students for.
            </p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ACHIEVEMENTS.map((a) => (
                <article
                  key={a.title}
                  className="h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-5 text-xl font-semibold text-[hsl(var(--ink))]">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">{a.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="surface-cream py-20 sm:py-24">
            <div className="container-wide grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
                  <Image
                    src={NETWORK_IMG}
                    alt="Alumni gathering"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-span-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                  <span className="gold-rule">Giving back</span>
                </p>
                <h3 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl">
                  A quiet, lasting connection.
                </h3>
                <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))]">
                  Our alumni return in many ways — visiting for the school anniversary, mentoring
                  current students, sharing career stories, and supporting families in Rhenock.
                  Every visit is a small act of the school&apos;s motto — <em>Love &amp; Service</em> —
                  coming back home.
                </p>
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      id: "events",
      label: "Events",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">Calendar</span>
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
            Reunions, feast days, and moments to return.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
            A few gatherings anchor the alumni year. Actual dates for each session are shared
            through the alumni portal and school notices — sign in to stay in touch.
          </p>

          <ol className="relative mx-auto mt-14 max-w-3xl">
            <span
              aria-hidden
              className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--border))]"
            />
            {ALUMNI_EVENTS.map((e) => (
              <li key={e.title} className="relative grid grid-cols-[16px_1fr] gap-6 pb-10 last:pb-0">
                <span className="relative mt-2 h-4 w-4 rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--ivory))]">
                  <span className="absolute inset-1 rounded-full bg-[hsl(var(--gold))]" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                      {e.date}
                    </span>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {e.tag}
                    </Badge>
                  </div>
                  <p className="font-display mt-2 text-xl font-semibold text-[hsl(var(--ink))]">
                    {e.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[hsl(var(--ink-soft))]">
                    <CalendarDays className="h-3.5 w-3.5" /> {e.place}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ),
    },
    {
      id: "stories",
      label: "Stories",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">In their own words</span>
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
            What Kingston still means, years on.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
            A few voices from former students on what they took away from their years at St. Joseph&apos;s —
            the teachers, the values, and the small moments that have stayed.
          </p>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {STORIES.map((s) => (
              <figure
                key={s.name}
                className="flex h-full flex-col rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7"
              >
                <Quote className="h-7 w-7 text-[hsl(var(--gold))]" />
                <blockquote className="font-display mt-4 flex-1 text-xl italic leading-snug text-[hsl(var(--ink))]">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-[hsl(var(--border))]/70 pt-4">
                  <p className="font-display text-[15px] font-semibold text-[hsl(var(--ink))]">
                    {s.name}
                  </p>
                  <p className="text-xs text-[hsl(var(--ink-soft))]">{s.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: "community",
      label: "Community",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                  <span className="gold-rule">Stay connected</span>
                </p>
                <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
                  Stay connected with Kingston.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
                  The alumni portal helps former students of St. Joseph&apos;s, Kingston stay in touch,
                  find batch-mates, hear about school events, and quietly give back — through
                  mentoring, guest visits, or by simply keeping the school in their prayers.
                </p>
                <div className="mt-8 grid gap-5 sm:grid-cols-3">
                  {[
                    { icon: Users,     t: "Mentor a student",   b: "A conversation, a career story, a bit of guidance." },
                    { icon: BookOpen,  t: "Speak at assembly",  b: "Share what school and life have taught you." },
                    { icon: Award,     t: "Support the school", b: "Lend a hand to a project, event, or student in need." },
                  ].map((w) => (
                    <div key={w.t} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-5">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                        <w.icon className="h-4 w-4" />
                      </span>
                      <p className="font-display mt-4 text-sm font-semibold text-[hsl(var(--ink))]">
                        {w.t}
                      </p>
                      <p className="mt-1 text-xs text-[hsl(var(--ink-soft))]">{w.b}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
                  <Image
                    src={NETWORK_IMG}
                    alt="Alumni community"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="container-wide pb-24 sm:pb-32">
            <div className="relative overflow-hidden rounded-[32px] bg-[hsl(var(--primary))] px-8 py-14 text-center text-[hsl(var(--ivory))] sm:px-14">
              <div
                aria-hidden
                className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--gold))]/25 blur-3xl"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                <span className="gold-rule">Alumni portal</span>
              </p>
              <h3 className="font-display mt-4 text-balance text-3xl font-semibold sm:text-4xl">
                Were you once a student here?
              </h3>
              <p className="mt-3 text-white/75">
                Sign in to update your profile, hear about school events, and stay connected with
                the Kingston community.
              </p>
              <div className="mt-7">
                <Link href="/alumni-portal/login">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-[hsl(var(--ivory))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--primary))] hover:bg-[hsl(var(--ivory))]/90"
                  >
                    Sign in to alumni portal
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="Alumni"
        title={
          <>
            Once a Josephite,
            <br />
            <span className="italic">always at home in Kingston.</span>
          </>
        }
        description="The former students of St. Joseph's, Kingston — quietly at work in Sikkim and across India, carrying with them the school's spirit of love and service."
        image={HERO_IMG}
        imageAlt="Alumni of St. Joseph's"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Alumni" }]}
        cta={
          <>
            <Link href="/alumni-portal/login">
              <Button
                size="lg"
                className="h-12 rounded-full bg-[hsl(var(--ivory))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--primary))] hover:bg-[hsl(var(--ivory))]/90"
              >
                Sign in to alumni portal
              </Button>
            </Link>
            <Link href="/alumni-portal/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-7 text-[14px] font-semibold tracking-wide text-white hover:bg-white/10 hover:text-white"
              >
                Create alumni profile
              </Button>
            </Link>
          </>
        }
      />
      <TabbedPage tabs={tabs} />
    </>
  );
}
