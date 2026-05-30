import type { Metadata } from "next";
import Image from "next/image";
import { Building2, FlaskConical, Library, Trophy, Music, Utensils } from "lucide-react";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { TabSplit } from "@/components/site/tab-section";
import { AdmissionsCta } from "@/components/site/admissions-cta";
import { SCHOOL } from "@/lib/constants";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: `About ${SCHOOL.name}: our story, principal, mission, facilities and leadership.`,
};


const MILESTONES = [
  { year: "1965", text: "School founded by the Sisters of St. Joseph" },
  { year: "1982", text: "Class XII batch graduates with state-topping results" },
  { year: "2001", text: "New senior wing and science labs inaugurated" },
  { year: "2019", text: "Sports complex and 200-seat auditorium" },
  { year: "2024", text: "Digital classrooms across all grades" },
];

const FACILITIES = [
  { icon: Library,      title: "Library & Reading Halls", body: "30,000 titles, periodicals, digital archives, and dedicated study halls for senior students." },
  { icon: FlaskConical, title: "Science & Tech Labs",     body: "Physics, chemistry, biology, robotics, and a dedicated computer lab — refreshed in 2024." },
  { icon: Trophy,       title: "Sports Complex",          body: "Athletics track, football, basketball, swimming pool, indoor courts, and a yoga studio." },
  { icon: Music,        title: "Auditorium & Studios",    body: "A 200-seat auditorium plus dedicated music, dance, and visual-art studios." },
  { icon: Utensils,     title: "Dining & Cafeteria",      body: "Nutritionist-planned menus, allergen tracking, and an open-plan dining hall." },
  { icon: Building2,    title: "Pastoral & Counselling",  body: "On-campus counsellors, infirmary, and a confidential pastoral-care programme." },
];

const LEADERSHIP = [
  { name: "Mrs. Margaret Rosario",   role: "Principal",                  since: "2014" },
  { name: "Mr. Sandeep Iyer",        role: "Vice Principal · Academics", since: "2017" },
  { name: "Ms. Anjali Verma",        role: "Vice Principal · Pastoral",  since: "2019" },
  { name: "Mr. Faisal Ahmed",        role: "Director of Sport",          since: "2020" },
  { name: "Dr. Reena Kapoor",        role: "Head of Sciences",           since: "2012" },
  { name: "Ms. Lara D'Souza",        role: "Head of Humanities",         since: "2015" },
];

export default async function AboutPage() {
  const cms = await getCmsSections([
    "about_intro",
    "principal_message",
    "about_hero_image",
    "about_story_image",
    "about_principal_image",
    "about_library_image",
    "about_facilities_image",
  ]);
  const HERO_IMG = resolveImage("about_hero_image", cms.about_hero_image);
  const STORY_IMG = resolveImage("about_story_image", cms.about_story_image);
  const PRINCIPAL_IMG = resolveImage("about_principal_image", cms.about_principal_image);
  const VISION_IMG = resolveImage("about_library_image", cms.about_library_image);
  const FACILITY_IMG = resolveImage("about_facilities_image", cms.about_facilities_image);

  const tabs: TabItem[] = [
    {
      id: "story",
      label: "Our Story",
      content: (
        <>
          <TabSplit
            eyebrow="Six decades"
            title={cms.about_intro.title ?? "A school built on character, curiosity, and care."}
            image={STORY_IMG}
            imageAlt="Students in the historic main quad"
          >
            <p>
              {cms.about_intro.body ??
                `${SCHOOL.name} was founded in ${SCHOOL.founded} with a simple idea — that every child deserves to be known. Six decades on, that idea still shapes everything we do.`}
            </p>
            <p>
              From a single classroom in the parish hall to today&apos;s 14-acre
              campus, the school has grown into a community of more than 800
              students, 70 teachers, and over 12,000 alumni — without losing the
              warmth of its earliest days.
            </p>
          </TabSplit>

          {/* Timeline */}
          <section className="surface-cream py-20 sm:py-24">
            <div className="container-wide">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Our journey</span>
              </p>
              <h3 className="font-display mt-4 text-3xl font-semibold text-[hsl(var(--ink))] sm:text-4xl">
                Six decades, in moments.
              </h3>
              <ol className="relative mx-auto mt-12 max-w-3xl">
                <span
                  aria-hidden
                  className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--border))]"
                />
                {MILESTONES.map((m) => (
                  <li
                    key={m.year}
                    className="relative grid grid-cols-[16px_1fr] gap-6 pb-10 last:pb-0"
                  >
                    <span className="relative mt-2 h-4 w-4 rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--ivory))]">
                      <span className="absolute inset-1 rounded-full bg-[hsl(var(--gold))]" />
                    </span>
                    <div>
                      <p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">
                        {m.year}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--ink-soft))] sm:text-base">
                        {m.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      ),
    },
    {
      id: "principal",
      label: "Principal Message",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="relative aspect-[5/6] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
                <Image
                  src={PRINCIPAL_IMG}
                  alt="Mrs. Margaret Rosario — Principal"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">From the Principal</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-[hsl(var(--ink))] sm:text-5xl">
                {cms.principal_message.title ?? "An education that lights a fire."}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
                {cms.principal_message.body ??
                  "Education is not the filling of a pail but the lighting of a fire. At St. Joseph's, we strive every day to ignite curiosity, build character, and prepare students for the world ahead — academically, ethically, and personally."}
              </p>
              <figure className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-[hsl(var(--gold))]"
                  fill="currentColor"
                >
                  <path d="M9.17 6C7.4 6 6 7.4 6 9.17v8.83h6V12H8.5c0-1.93 1.57-3.5 3.5-3.5V6H9.17Zm9 0c-1.77 0-3.17 1.4-3.17 3.17v8.83h6V12h-3.5c0-1.93 1.57-3.5 3.5-3.5V6h-2.83Z" />
                </svg>
                <blockquote className="font-display mt-2 text-xl italic leading-snug text-[hsl(var(--ink))]">
                  We don&apos;t just teach subjects — we shape the people who study them.
                </blockquote>
              </figure>
              <div className="mt-6 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--primary))] font-display text-sm font-semibold text-[hsl(var(--ivory))]">
                  MR
                </div>
                <div>
                  <p className="font-display text-[15px] font-semibold text-[hsl(var(--ink))]">
                    Mrs. Margaret Rosario
                  </p>
                  <p className="text-xs text-[hsl(var(--ink-soft))]">
                    Principal · serving since 2014
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: "mission",
      label: "Mission & Vision",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                  <span className="gold-rule">Mission</span>
                </p>
                <h3 className="font-display mt-4 text-3xl font-semibold leading-tight text-[hsl(var(--ink))]">
                  To educate the whole child — head, heart, and hand.
                </h3>
                <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                  We commit to academic rigour balanced by character formation,
                  and to learning experiences that are intellectually
                  demanding, ethically grounded, and personally meaningful.
                </p>
              </div>
              <div className="rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--primary))] p-10 text-[hsl(var(--ivory))]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                  <span className="gold-rule">Vision</span>
                </p>
                <h3 className="font-display mt-4 text-3xl font-semibold leading-tight">
                  A school known for its graduates, not its gates.
                </h3>
                <p className="mt-5 leading-relaxed text-white/80">
                  To be the school whose students are recognisable in any room
                  they walk into — by their curiosity, their kindness, and their
                  willingness to do hard things well.
                </p>
              </div>
            </div>
          </section>

          <section className="surface-cream py-20 sm:py-24">
            <div className="container-wide">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">What we believe</span>
              </p>
              <h3 className="font-display mt-4 max-w-3xl text-3xl font-semibold text-[hsl(var(--ink))] sm:text-4xl">
                Three values that shape every decision.
              </h3>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  { t: "Academic rigour",         b: "A curriculum that challenges and supports — designed to graduate students who can think, not just recite." },
                  { t: "Whole-child education",   b: "Sports, arts, service, and reflection sit alongside academics, not behind them." },
                  { t: "Community first",         b: "Small classes, known students, and parents who are partners — not customers." },
                ].map((v) => (
                  <div key={v.t} className="border-l-2 border-[hsl(var(--gold))]/60 pl-5">
                    <h4 className="font-display text-xl font-semibold text-[hsl(var(--ink))]">{v.t}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">{v.b}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      id: "facilities",
      label: "Facilities",
      content: (
        <>
          <section className="container-wide py-20 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">14-acre campus</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              The spaces where the learning happens.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
              Every facility is built around a single test — does it help students
              learn better, more deeply, more joyfully?
            </p>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FACILITIES.map((f) => (
                <article
                  key={f.title}
                  className="group h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.25)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-5 text-xl font-semibold text-[hsl(var(--ink))]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                    {f.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="container-wide pb-20 sm:pb-24">
            <div className="relative aspect-[16/7] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
              <Image
                src={FACILITY_IMG}
                alt="Science laboratory at St. Joseph's"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </section>
        </>
      ),
    },
    {
      id: "management",
      label: "Management",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">The leadership</span>
          </p>
          <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            The people who keep the school running.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            Most of our leadership has come up through the classroom. They lead
            because they teach — not the other way around.
          </p>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERSHIP.map((p) => (
              <article
                key={p.name}
                className="flex items-center gap-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
              >
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary))] font-display text-base font-semibold text-[hsl(var(--ivory))]">
                  {p.name
                    .split(" ")
                    .slice(-2)
                    .map((s) => s[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-[hsl(var(--ink))]">
                    {p.name}
                  </p>
                  <p className="text-sm text-[hsl(var(--ink-soft))]">{p.role}</p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--ink-soft))]/70">
                    Serving since {p.since}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="About us"
        title={
          <>
            Six decades of <span className="italic">becoming.</span>
          </>
        }
        description="Our story, our people, our mission — and the campus where it all happens."
        image={HERO_IMG}
        imageAlt="St. Joseph's campus"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
