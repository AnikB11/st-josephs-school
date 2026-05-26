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
  description: "Our alumni network — careers, achievements, and ways to stay connected.",
};

export const revalidate = 300;

const PLACEHOLDER: Alumnus[] = [
  { id: "1", user_id: null, student_id: null, full_name: "Anika Sharma",     graduation_year: 2014, current_position: "Product Manager",     current_company: "Stripe",       bio: "Built payment products for emerging markets.",                  photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "2", user_id: null, student_id: null, full_name: "Rohan Sen",        graduation_year: 2011, current_position: "Founder",             current_company: "Helix Bio",    bio: "Graduated IIT-B, MIT. Pioneering synthetic biology platforms.", photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "3", user_id: null, student_id: null, full_name: "Dr. Priya Kapoor", graduation_year: 2008, current_position: "Pediatric Surgeon",   current_company: "AIIMS Delhi",  bio: "Specializes in neonatal cardiac care.",                         photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "4", user_id: null, student_id: null, full_name: "Karan Iyer",       graduation_year: 2017, current_position: "Software Engineer",   current_company: "Google",       bio: "Search infrastructure team.",                                   photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "5", user_id: null, student_id: null, full_name: "Meera Joshi",      graduation_year: 2019, current_position: "PhD Candidate",       current_company: "Stanford",     bio: "Quantum information theory.",                                   photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "6", user_id: null, student_id: null, full_name: "Aditya Roy",       graduation_year: 2005, current_position: "Author & Journalist", current_company: "The Hindu",    bio: "Reports on climate and policy.",                                photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
];

const ACHIEVEMENTS = [
  { icon: Award,    title: "12,000+ alumni",      body: "Six decades of graduates, working across 40+ countries." },
  { icon: BookOpen, title: "47 Rhodes & Fulbright scholars", body: "Among our most decorated academic alumni since 1970." },
  { icon: Globe,    title: "Founders & researchers", body: "Helix Bio, Solver AI, Saraswati Labs — companies started by our alumni." },
  { icon: Briefcase,title: "Public service",      body: "Alumni in the IAS, IFS, judiciary, and across India's civil service." },
];

const ALUMNI_EVENTS = [
  { date: "Sep 14, 2026", title: "Annual Alumni Reunion",        place: "Main lawn · 6:00 PM",      tag: "Open to all batches" },
  { date: "Nov 22, 2026", title: "Class of 2001 — 25-year meet", place: "Senior Auditorium",        tag: "Class reunion" },
  { date: "Jan 30, 2027", title: "Founders' Day & Alumni Mass",  place: "School Chapel · 9:00 AM",  tag: "Anniversary" },
  { date: "Mar 18, 2027", title: "Careers Day with Alumni",      place: "Library Hall",             tag: "Students × alumni" },
];

const STORIES = [
  {
    quote: "I came back to teach physics because my teachers gave me everything. I wanted to do the same.",
    name: "Mr. Sandeep Iyer",
    role: "Class of 1995 · Vice Principal, Academics",
  },
  {
    quote: "The school taught me that excellence and kindness aren't competing values — they grow together.",
    name: "Dr. Priya Kapoor",
    role: "Class of 2008 · Pediatric Surgeon, AIIMS Delhi",
  },
  {
    quote: "Twelve years on, I still pick up the phone and call my old principal when I have a hard decision to make.",
    name: "Rohan Sen",
    role: "Class of 2011 · Founder, Helix Bio",
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
                <span className="gold-rule">Six decades of graduates</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
                Where our alumni are now.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
                Researchers, founders, teachers, doctors, artists, civil servants — a sample of the
                graduates who continue to shape the world they walked into.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">All batches</Badge>
              <Badge variant="secondary" className="rounded-full">2020s</Badge>
              <Badge variant="secondary" className="rounded-full">2010s</Badge>
              <Badge variant="secondary" className="rounded-full">2000s</Badge>
            </div>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {alumni.map((a) => (
              <AlumnusCard key={a.id} a={a} />
            ))}
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
              <span className="gold-rule">By the numbers</span>
            </p>
            <h2 className="font-display mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
              What our alumni go on to do.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
              A snapshot of where the years after school have taken our graduates — in research,
              founding, public service, and beyond.
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
                  <span className="gold-rule">Recognition</span>
                </p>
                <h3 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl">
                  Honours and recognitions.
                </h3>
                <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))]">
                  Padma Shri awards, Olympic representation, national academic toppers, and
                  industry honours — our alumni continue to bring distinction to the school
                  that helped raise them.
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
            Reunions, gatherings, and giving-back days.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
            We host four to five alumni events each year on campus. Sign in to the alumni portal
            to RSVP or to see the smaller batch-specific meets.
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
            What the school still means, years later.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
            Stories from alumni about what they carry with them — the teachers, the lessons, and
            the moments that have stayed.
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
                  A network that lasts a lifetime.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
                  The alumni portal lets you update your profile, see batch-mates, RSVP to events,
                  and find ways to give back — mentoring students, returning as a guest teacher, or
                  contributing to the scholarship fund.
                </p>
                <div className="mt-8 grid gap-5 sm:grid-cols-3">
                  {[
                    { icon: Users,     t: "Mentor a student",  b: "30 minutes a term." },
                    { icon: BookOpen,  t: "Guest teach a class", b: "Share your craft." },
                    { icon: Award,     t: "Support a scholar", b: "Sponsor a year." },
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
                Are you an alumna or alumnus?
              </h3>
              <p className="mt-3 text-white/75">
                Sign in to update your profile, RSVP to events, and join alumni-only spaces.
              </p>
              <div className="mt-7">
                <Link href="/login">
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
            A network that lasts <span className="italic">a lifetime.</span>
          </>
        }
        description="From researchers and founders to teachers and artists — our graduates are everywhere, doing remarkable things."
        image={HERO_IMG}
        imageAlt="Alumni of St. Joseph's"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Alumni" }]}
      />
      <TabbedPage tabs={tabs} />
    </>
  );
}
