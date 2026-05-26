import type { Metadata } from "next";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { AdmissionsCta } from "@/components/site/admissions-cta";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Campus Life",
  description:
    "Sports, events, clubs, activities, cultural programmes, and student life at St. Joseph's.",
};

const SPORTS = [
  { name: "Athletics",       blurb: "Sprints, distance, throws, jumps — annual inter-house meet." },
  { name: "Football",        blurb: "Boys' and girls' teams across U-12, U-14, U-17 brackets." },
  { name: "Basketball",      blurb: "Indoor and outdoor courts; competitive in state-level leagues." },
  { name: "Cricket",         blurb: "Two grounds, four nets, coaching from senior school onward." },
  { name: "Swimming",        blurb: "25m pool; squad training and learn-to-swim for primary." },
  { name: "Badminton",       blurb: "Six indoor courts; year-round inter-house and external fixtures." },
  { name: "Table tennis",    blurb: "Eight tables in the indoor centre; popular at every grade." },
  { name: "Yoga & wellness", blurb: "Daily morning sessions plus dedicated wellness electives." },
];

const EVENTS = [
  { title: "Founder's Day",            date: "04 Jul 2026", where: "Chapel & main lawn" },
  { title: "Annual Sports Day",        date: "08 Jun 2026", where: "Main field" },
  { title: "Inter-school Science Fair",date: "22 Jun 2026", where: "Auditorium" },
  { title: "Cultural Fest · Voltaire", date: "12 Sep 2026", where: "Campus-wide" },
  { title: "Christmas Carol Service",  date: "20 Dec 2026", where: "Chapel" },
  { title: "Annual Day · Class XII",   date: "17 Feb 2027", where: "Auditorium" },
];

const CLUBS = [
  { name: "Robotics Club",   tag: "STEM",    body: "FTC- and FRC-format builds, year-round." },
  { name: "Model UN",        tag: "Civic",   body: "Three inter-school MUNs hosted on campus." },
  { name: "Debate Society",  tag: "Speech",  body: "British and Asian parliamentary formats." },
  { name: "Quiz Circle",     tag: "Trivia",  body: "Weekly drills; inter-school circuit team." },
  { name: "Photography",     tag: "Arts",    body: "Darkroom, digital workflow, and exhibitions." },
  { name: "Coding Club",     tag: "STEM",    body: "From Scratch in primary to web apps in senior." },
  { name: "Eco Club",        tag: "Service", body: "Campus composting, waste audit, tree planting." },
  { name: "School Newspaper",tag: "Writing", body: "Student-edited quarterly, in print and online." },
];

const ACTIVITIES = [
  { name: "Service learning",     body: "50 hours / year for senior students — old-age homes, neighbourhood schools, environment drives." },
  { name: "Trekking & adventure", body: "Annual Himalayan trek for Class IX–XII; adventure camps for younger grades." },
  { name: "Field trips",          body: "Subject-linked trips every term — museums, factories, courts, and farms." },
  { name: "Exchange programmes",  body: "Two-week exchange with partner schools in Bhutan and the UK for senior students." },
  { name: "Visiting speakers",    body: "Authors, scientists, athletes, and alumni — at least one per term." },
];

const CULTURAL = [
  { name: "Choir",          body: "Junior, senior, and chamber choirs — perform at school and city events." },
  { name: "Orchestra",      body: "Strings, woodwind, brass and percussion; rehearses twice a week." },
  { name: "Drama Society",  body: "One full production every year, plus inter-house drama festival." },
  { name: "Dance",          body: "Bharatanatyam, contemporary, and folk — performed at Annual Day." },
  { name: "Visual arts",    body: "Studio access for all senior students; annual exhibition in March." },
];

const HOUSES = [
  { name: "Loyola",   color: "Crimson",  motto: "Strength through service" },
  { name: "Xavier",   color: "Indigo",   motto: "Reach further" },
  { name: "Aquinas",  color: "Forest",   motto: "Think well, do well" },
  { name: "Aloysius", color: "Saffron",  motto: "Courage and grace" },
];

const DAY = [
  { time: "07:50", text: "Gates open" },
  { time: "08:10", text: "Assembly & reflection" },
  { time: "08:30", text: "Period 1" },
  { time: "10:50", text: "Mid-morning break" },
  { time: "13:00", text: "Lunch in the dining hall" },
  { time: "14:00", text: "Afternoon periods" },
  { time: "15:30", text: "Clubs, sport & rehearsals" },
  { time: "16:30", text: "Day ends · buses depart" },
];

function ImageBand({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="container-wide pb-20 sm:pb-24">
      <div className="relative aspect-[16/7] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
      </div>
    </section>
  );
}

export default async function CampusLifePage() {
  const cms = await getCmsSections([
    "campus_hero_image",
    "campus_sports_image",
    "campus_events_image",
    "campus_clubs_image",
    "campus_activities_image",
    "campus_cultural_image",
    "campus_student_image",
  ]);
  const HERO_IMG = resolveImage("campus_hero_image", cms.campus_hero_image);
  const SPORTS_IMG = resolveImage("campus_sports_image", cms.campus_sports_image);
  const EVENTS_IMG = resolveImage("campus_events_image", cms.campus_events_image);
  const CLUBS_IMG = resolveImage("campus_clubs_image", cms.campus_clubs_image);
  const ACT_IMG = resolveImage("campus_activities_image", cms.campus_activities_image);
  const CULT_IMG = resolveImage("campus_cultural_image", cms.campus_cultural_image);
  const STUDENT_IMG = resolveImage("campus_student_image", cms.campus_student_image);

  const tabs: TabItem[] = [
    {
      id: "sports",
      label: "Sports",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">Sport for all</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              Every body. Every term. Every year.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
              Athletics is part of the timetable, not an extra — and our teams
              compete in district, state, and national fixtures across eight
              disciplines.
            </p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SPORTS.map((s) => (
                <article
                  key={s.name}
                  className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-[hsl(var(--ink))]">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                    {s.blurb}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <ImageBand src={SPORTS_IMG} alt="Annual sports day at St. Joseph's" />
        </>
      ),
    },
    {
      id: "events",
      label: "Events",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">The calendar</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              Dates that mark the year.
            </h2>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {EVENTS.map((e) => (
                <article
                  key={e.title}
                  className="flex items-start gap-4 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
                >
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[hsl(var(--border))] bg-white text-center">
                    <span className="font-display text-base font-semibold text-[hsl(var(--ink))]">
                      {e.date.split(" ")[0]}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
                      {e.date.split(" ")[1]}
                    </span>
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[hsl(var(--ink))]">
                      {e.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[hsl(var(--ink-soft))]">
                      <Calendar className="h-3 w-3" /> {e.date}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[hsl(var(--ink-soft))]">
                      <MapPin className="h-3 w-3" /> {e.where}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <ImageBand src={EVENTS_IMG} alt="Annual Day on the school auditorium stage" />
        </>
      ),
    },
    {
      id: "clubs",
      label: "Clubs",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">Student-led</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              Find your people. Build your thing.
            </h2>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CLUBS.map((c) => (
                <article
                  key={c.name}
                  className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
                >
                  <span className="inline-flex rounded-full bg-[hsl(var(--primary))]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
                    {c.tag}
                  </span>
                  <h3 className="font-display mt-3 text-lg font-semibold text-[hsl(var(--ink))]">
                    {c.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                    {c.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <ImageBand src={CLUBS_IMG} alt="Robotics club at work" />
        </>
      ),
    },
    {
      id: "activities",
      label: "Activities",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">Beyond the gates</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              The school doesn&apos;t end at the bell.
            </h2>
            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              {ACTIVITIES.map((a) => (
                <article
                  key={a.name}
                  className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7"
                >
                  <h3 className="font-display text-xl font-semibold text-[hsl(var(--ink))]">
                    {a.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                    {a.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <ImageBand src={ACT_IMG} alt="Service learning at a neighbourhood school" />
        </>
      ),
    },
    {
      id: "cultural",
      label: "Cultural Programs",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">The cultural calendar</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              Music, drama, dance, art — every day.
            </h2>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CULTURAL.map((c) => (
                <article
                  key={c.name}
                  className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7"
                >
                  <h3 className="font-display text-xl font-semibold text-[hsl(var(--ink))]">
                    {c.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                    {c.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <ImageBand src={CULT_IMG} alt="The school choir in performance" />
        </>
      ),
    },
    {
      id: "student-life",
      label: "Student Life",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">The houses</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              Four houses, one campus.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
              Every student is assigned a house on their first day — and stays
              in it through Class XII.
            </p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HOUSES.map((h) => (
                <div
                  key={h.name}
                  className="h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                    {h.color}
                  </p>
                  <h3 className="font-display mt-3 text-3xl font-semibold text-[hsl(var(--ink))]">
                    {h.name}
                  </h3>
                  <p className="mt-3 font-display text-sm italic text-[hsl(var(--ink-soft))]">
                    &ldquo;{h.motto}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-cream py-20 sm:py-24">
            <div className="container-wide">
              <div className="grid items-start gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                    <span className="gold-rule">A day on campus</span>
                  </p>
                  <h3 className="font-display mt-4 text-balance text-3xl font-semibold text-[hsl(var(--ink))] sm:text-4xl">
                    From assembly to the last bus home.
                  </h3>
                  <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                    A typical school day — academic in the morning, expressive
                    in the afternoon.
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <ol className="relative">
                    <span
                      aria-hidden
                      className="absolute left-[63px] top-2 bottom-2 w-px bg-[hsl(var(--border))]"
                    />
                    {DAY.map((d) => (
                      <li
                        key={d.time}
                        className="relative grid grid-cols-[64px_16px_1fr] items-center gap-5 py-3"
                      >
                        <span className="font-mono text-sm font-semibold tabular-nums text-[hsl(var(--primary))]">
                          {d.time}
                        </span>
                        <span className="relative h-3 w-3 rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--ivory))]">
                          <span className="absolute inset-0.5 rounded-full bg-[hsl(var(--gold))]" />
                        </span>
                        <p className="text-sm text-[hsl(var(--ink))] sm:text-base">
                          {d.text}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <ImageBand src={STUDENT_IMG} alt="Students between classes" />
        </>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="Campus life"
        title={
          <>
            What happens <span className="italic">between the bells.</span>
          </>
        }
        description="An education at St. Joseph's is more than what's on the timetable — it's a community, built every day."
        image={HERO_IMG}
        imageAlt="Students at St. Joseph's"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Campus Life" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
