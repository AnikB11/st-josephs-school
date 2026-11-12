import type { Metadata } from "next";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { AdmissionsCta } from "@/components/site/admissions-cta";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Campus Life",
  description:
    "Sports, events, clubs, service, and cultural life at St. Joseph's School, Kingston — a co-educational ICSE school in Rhenock, Sikkim.",
};

const ACADEMIES = [
  { name: "Music",   tag: "Creative", body: "Keyboard, guitar, and ukulele — group sessions and small-ensemble practice that build creativity, expression, and discipline." },
  { name: "Dance",   tag: "Creative", body: "An opportunity to express rhythm and movement, building confidence and coordination through folk, traditional, and contemporary forms." },
  { name: "Football",  tag: "Sport",  body: "Encouraging physical fitness, teamwork, sportsmanship, and discipline through regular coaching and inter-house matches." },
  { name: "Basketball", tag: "Sport", body: "Developing coordination, concentration, teamwork, and competitive spirit on the school court." },
  { name: "Badminton",  tag: "Sport", body: "Building agility, focus, and sporting discipline through year-round play in the school hall." },
  { name: "Personal Development", tag: "Life skills", body: "Strengthening confidence, communication, leadership, and interpersonal abilities for life beyond the classroom." },
];

const SPORTS = [
  { name: "Cricket",       blurb: "One of the school's favourite sports — with coaching, inter-house matches, and regular practice sessions." },
  { name: "Football",      blurb: "Played on the main ground through most of the year, with house teams for boys and girls at every level." },
  { name: "Basketball",    blurb: "Practised on the school court, with regular inter-house tournaments and friendly fixtures." },
  { name: "Volleyball",    blurb: "A staple of school games — teamwork, timing, and the everyday joy of an evening match." },
  { name: "Badminton",     blurb: "Played year-round in the school hall; popular across primary, middle, and senior classes." },
  { name: "Table tennis",  blurb: "An indoor favourite, with tables set up for practice, doubles, and friendly matches." },
  { name: "Athletics",     blurb: "Sprints, middle-distance, and field events — leading up to the Annual Sports Meet each year." },
  { name: "Games & drill", blurb: "Physical education, morning drill, and games as part of the timetable for every pupil." },
];

// Dates below are the recurring day/month for events that mark the school year.
// The office publishes the actual year's schedule through the notices system.
const EVENTS = [
  { title: "School Anniversary",       date: "12 Feb", where: "School grounds" },
  { title: "Feast of St. Joseph",      date: "19 Mar", where: "School Chapel" },
  { title: "Annual Sports Meet",       date: "Nov",    where: "Main Ground" },
  { title: "Independence Day",         date: "15 Aug", where: "Assembly Ground" },
  { title: "Teachers' Day",            date: "05 Sep", where: "Assembly Hall" },
  { title: "Christmas Carol Service",  date: "Dec",    where: "Chapel & Assembly Hall" },
];

const CLUBS = [
  { name: "Literary & Debate",  tag: "Speech",   body: "English elocution, debate, and creative writing — with inter-class and inter-house rounds." },
  { name: "Quiz Circle",        tag: "Knowledge", body: "General knowledge and current-affairs quizzes for middle and senior classes." },
  { name: "Eco Club",           tag: "Service",  body: "Tree planting, campus clean-ups, and awareness drives across the school year." },
  { name: "Art & Craft",        tag: "Arts",     body: "Drawing, painting, and craft — with student work displayed at school events." },
  { name: "Music & Choir",      tag: "Music",    body: "Choir practice for morning assembly, carol services, and school celebrations." },
  { name: "Dance",              tag: "Culture",  body: "Folk, traditional, and contemporary — performed at Annual Day and cultural programmes." },
  { name: "Science Club",       tag: "STEM",     body: "Small experiments, models, and science exhibitions for middle school onwards." },
  { name: "Sports Committee",   tag: "Games",    body: "Student-led team that helps organise inter-house tournaments and the Annual Sports Meet." },
];

const ACTIVITIES = [
  { name: "Service to society",   body: "Small acts of service in and around Rhenock — visits, drives, and outreach that live out the school motto." },
  { name: "Educational visits",   body: "Subject-linked trips and outings that take learning outside the classroom and into the surrounding hills." },
  { name: "Assembly & guest speakers", body: "Morning assembly opens the day with reflection, notices, and, from time to time, visiting speakers." },
  { name: "Inter-house competitions", body: "Debates, quizzes, sports meets, and cultural events across the school year." },
  { name: "Faith formation",      body: "A gentle programme of prayer, moral science, and reflection — open to students of every faith." },
];

const CULTURAL = [
  { name: "Choir",           body: "The school choir sings at morning assembly, the Christmas Carol Service, and cultural programmes throughout the year." },
  { name: "Drama",           body: "Class and inter-house plays, staged at Annual Day and other school events." },
  { name: "Dance",           body: "Folk, traditional, and contemporary dance — a valued part of school celebrations and cultural evenings." },
  { name: "Music",           body: "Vocal and instrumental music practice, encouraged from primary onwards." },
  { name: "Visual arts",     body: "Drawing, painting, and craft, with student work displayed at school events and exhibitions." },
];

// A shared rhythm of school life — assembly, prayer, activity, and reflection.
// Kept as four generic pillars (not specific house names, which are the school's
// to name) so the layout works without inventing details.
const HOUSES = [
  { name: "Assembly",         color: "Every morning",  motto: "A shared start to the day, with reflection and prayer." },
  { name: "Chapel",           color: "Weekly",         motto: "A quiet space at the centre of school life." },
  { name: "Games & sport",    color: "Daily",          motto: "Part of the timetable, not an afterthought." },
  { name: "Moral Science",    color: "Weekly",         motto: "Character and conscience, alongside academics." },
];

const DAY = [
  { time: "07:30", text: "School gates open" },
  { time: "08:00", text: "Morning assembly & prayer" },
  { time: "08:30", text: "First period begins" },
  { time: "10:30", text: "Mid-morning break" },
  { time: "12:30", text: "Lunch" },
  { time: "13:15", text: "Afternoon classes" },
  { time: "15:00", text: "Games, choir, and co-curricular activities" },
  { time: "15:45", text: "Day ends · dismissal" },
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
      id: "academies",
      label: "Academies",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">Specialised academies</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              Every talent deserves an opportunity.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
              Children develop in different ways. Alongside the classroom,
              specialised academies give students focused time to explore their
              creativity, strengthen their confidence, and discover individual
              strengths.
            </p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ACADEMIES.map((a) => (
                <article
                  key={a.name}
                  className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
                >
                  <span className="inline-flex rounded-full bg-[hsl(var(--primary))]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
                    {a.tag}
                  </span>
                  <h3 className="font-display mt-3 text-lg font-semibold text-[hsl(var(--ink))]">
                    {a.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                    {a.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <ImageBand src={CULT_IMG} alt="Students at a specialised academy session" />
        </>
      ),
    },
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
              Games and sport, for every pupil.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
              Sports, games, and co-curricular activity are treated as inseparable parts of an
              integral education. The school provides ample opportunity for physical development
              across cricket, basketball, volleyball, football, badminton, table tennis, and athletics.
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
              The days that mark our year.
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
              A place to find your voice — and your team.
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
              School is more than the timetable.
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
              Music, drama, dance, and art — part of school life.
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
              <span className="gold-rule">A shared rhythm</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              The everyday shape of school life.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
              A few things anchor every school day at Kingston — a shared assembly, a quiet chapel,
              time for games, and space for moral formation alongside academics.
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
                    From morning assembly to the final bell.
                  </h3>
                  <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                    A typical day at Kingston — a steady rhythm of study in the morning,
                    activity in the afternoon, and a quiet close before dismissal.
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
            The life between
            <br />
            <span className="italic">the lessons.</span>
          </>
        }
        description="Sport, service, prayer, and play — the daily rhythm that turns a school into a community. Set in the quiet hills of Rhenock, Sikkim."
        image={HERO_IMG}
        imageAlt="Life on campus at St. Joseph's School, Kingston"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Campus Life" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
