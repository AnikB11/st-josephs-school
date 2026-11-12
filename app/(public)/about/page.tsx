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
  description: `${SCHOOL.name} is a co-educational ICSE school in Kingston, Rhenock, Pakyong District, Sikkim — established in 1996 under the Roman Catholic Diocese of Darjeeling–Sikkim.`,
};


const MILESTONES = [
  { year: "1996", text: "Founded in February by the Roman Catholic Diocese of Darjeeling–Sikkim, in the quiet hills of Kingston, Rhenock." },
  { year: "2000s", text: "Classes gradually expanded across primary, middle, and secondary levels, with English medium and a strong ICSE foundation." },
  { year: "2010s", text: "Senior secondary Science stream introduced; sporting, cultural, and service activities become part of daily school life." },
  { year: "Today", text: "A co-educational ICSE school of Nursery to Class XII, serving families across Sikkim and beyond." },
];

const FACILITIES = [
  { icon: Library,      title: "Library & reading room",     body: "A well-stocked library that grows every year — supporting reading, research, and independent study from primary onwards." },
  { icon: FlaskConical, title: "Science & computer labs",    body: "Dedicated Physics, Chemistry, Biology, and computer laboratories that support the ICSE curriculum from middle school upward." },
  { icon: Trophy,       title: "Sports & athletics",         body: "Grounds and courts for cricket, football, basketball, volleyball, badminton, table tennis, and athletics — for every pupil, every year." },
  { icon: Music,        title: "Chapel & assembly hall",     body: "Spaces that anchor daily assembly, prayer, cultural programmes, and school-wide gatherings across the year." },
  { icon: Utensils,     title: "Hostel & dining",            body: "Separate hostels for boys and girls, run by the school management and the Cluny Sisters, with wholesome, home-style meals." },
  { icon: Building2,    title: "Pastoral care",              body: "A community shaped by Christian values, with class teachers, wardens, and counsellors who know each child by name." },
];

// Leadership names are deliberately generic until published by the school; the
// Governing Body is chaired by the Bishop of Darjeeling–Sikkim.
const LEADERSHIP = [
  { name: "Bishop of Darjeeling–Sikkim", role: "President, Governing Body",           since: "Ex officio" },
  { name: "Diocesan Board of Education", role: "School Management",                    since: "Since 1996" },
  { name: "The Principal",               role: "Head of School",                       since: "Kingston, Rhenock" },
  { name: "The Vice Principal",          role: "Academic & Pastoral Oversight",        since: "" },
  { name: "The Cluny Sisters",           role: "Girls' Hostel & Pastoral Support",       since: "" },
  { name: "Faculty & House Staff",       role: "Class Teachers, Wardens, Coordinators", since: "" },
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
            eyebrow="Since 1996"
            title={cms.about_intro.title ?? "A school built on faith, learning, and service."}
            image={STORY_IMG}
            imageAlt="St. Joseph's School, Kingston — Rhenock, Sikkim"
          >
            <p>
              {cms.about_intro.body ??
                `${SCHOOL.name} was established in February ${SCHOOL.founded} by the Roman Catholic Diocese of Darjeeling–Sikkim. Set at 1,030 metres above mean sea level in Kingston, Rhenock, the school opened its doors with a simple purpose — to educate the young people of Sikkim in the spirit of Love & Service.`}
            </p>
            <p>
              The school is under the religious jurisdiction of the Diocese, and the Bishop
              of Darjeeling–Sikkim serves as President of the Governing Body. From its
              first classrooms to today&apos;s ICSE-affiliated campus, St. Joseph&apos;s
              has grown steadily while holding on to the warmth and discipline of its
              earliest years.
            </p>
          </TabSplit>

          {/* Timeline */}
          <section className="surface-cream py-20 sm:py-24">
            <div className="container-wide">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Our journey</span>
              </p>
              <h3 className="font-display mt-4 text-3xl font-semibold text-[hsl(var(--ink))] sm:text-4xl">
                A quiet journey, in moments.
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
                  alt="The Principal — St. Joseph's School, Kingston"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">From the Principal&apos;s desk</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-[hsl(var(--ink))] sm:text-5xl">
                {cms.principal_message.title ?? "An education rooted in love and service."}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
                {cms.principal_message.body ??
                  "St. Joseph's School, Kingston has been shaped, since 1996, by a simple conviction — that true education must form the mind, the heart, and the conscience together. We prepare our students for examinations and for life; for career and for community; for excellence and for service. Every child here is known, guided, and challenged to grow into a whole human being."}
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
                  Love of God, and service of people — this is what we teach, and what we hope every child will carry home.
                </blockquote>
              </figure>
              <div className="mt-6 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--primary))] font-display text-sm font-semibold text-[hsl(var(--ivory))]">
                  SJK
                </div>
                <div>
                  <p className="font-display text-[15px] font-semibold text-[hsl(var(--ink))]">
                    The Principal
                  </p>
                  <p className="text-xs text-[hsl(var(--ink-soft))]">
                    St. Joseph&apos;s School, Kingston · Rhenock, Sikkim
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
                  <span className="gold-rule">Our Mission</span>
                </p>
                <h3 className="font-display mt-4 text-3xl font-semibold leading-tight text-[hsl(var(--ink))]">
                  To form young people who are intellectually competent, morally sound, and open to growth.
                </h3>
                <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                  We seek to nurture individuals who are psychologically whole, imbued with a sense
                  of the divine, and committed to the cause of justice, love, and peace. Together
                  with parents and well-wishers, we work to build a humane society free from
                  prejudice and discrimination — one that upholds the dignity of every human person.
                </p>
              </div>
              <div className="rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--primary))] p-10 text-[hsl(var(--ivory))]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                  <span className="gold-rule">Our Vision</span>
                </p>
                <h3 className="font-display mt-4 text-3xl font-semibold leading-tight">
                  Love of God. Service of people.
                </h3>
                <p className="mt-5 leading-relaxed text-white/80">
                  Our motto — <em>Love &amp; Service</em> — points to the kind of graduates we hope
                  to send into the world: thoughtful, principled, and generous with their gifts.
                  Especially attentive to the underprivileged, and unafraid to work for a fairer,
                  kinder Sikkim.
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
                The values that shape every decision.
              </h3>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  { t: "Academic excellence",       b: "An ICSE curriculum taught with depth and care — English medium, with Hindi and Nepali as second languages." },
                  { t: "Moral & spiritual formation", b: "Christian values open to every faith — daily assembly, reflection, and a school life anchored in dignity and respect." },
                  { t: "Service to society",        b: "A commitment to justice, love, and peace — especially in service of the underprivileged in our community." },
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
              <span className="gold-rule">Our campus</span>
            </p>
            <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              A campus built for study, sport, and service.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
              Set high in the hills of Rhenock, the school offers well-equipped classrooms,
              laboratories, sports grounds, and residential facilities — everything students need
              for a rounded ICSE education.
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
                alt="Campus facilities at St. Joseph's School, Kingston"
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
            <span className="gold-rule">Governance & management</span>
          </p>
          <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            A school entrusted to the Diocese.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            St. Joseph&apos;s School, Kingston is managed by the Roman Catholic Diocese of
            Darjeeling–Sikkim. The Bishop of Darjeeling–Sikkim is the President of the
            Governing Body, and the school is administered by the Principal, Vice Principal,
            faculty, and the Cluny Sisters who care for our residential students.
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
                  {p.since && (
                    <p className="mt-0.5 text-xs text-[hsl(var(--ink-soft))]/70">
                      {p.since}
                    </p>
                  )}
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
        eyebrow="About the school"
        title={
          <>
            A quiet school in the hills,
            <br />
            <span className="italic">founded in 1996.</span>
          </>
        }
        description="Our story, our mission, and the community we have built together in Rhenock — from the first classroom to today."
        image={HERO_IMG}
        imageAlt="St. Joseph's School, Kingston — Rhenock, Sikkim"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
