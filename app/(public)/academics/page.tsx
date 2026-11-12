import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, FlaskConical, Languages, Calculator, Globe2, Palette, CheckCircle2 } from "lucide-react";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { AdmissionsCta } from "@/components/site/admissions-cta";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Academics",
  description:
    "Nursery to Class XII (Science) — the ICSE and ISC curriculum at St. Joseph's School, Kingston, Rhenock. Affiliated with the ICSE, New Delhi.",
  alternates: { canonical: "/academics" },
  openGraph: { url: "/academics", type: "website" },
};

type Stage = {
  range: string;
  title: string;
  intro: string;
  pillars: string[];
  subjects: string[];
  image: string;
};

type StageTemplate = Omit<Stage, "image"> & { imageKey: keyof typeof STAGE_IMAGE_KEYS };

const STAGE_IMAGE_KEYS = {
  pre: "academics_preprimary_image",
  primary: "academics_primary_image",
  middle: "academics_middle_image",
  secondary: "academics_secondary_image",
  senior: "academics_senior_image",
} as const;

const STAGE_TEMPLATES: StageTemplate[] = [
  {
    range: "Nursery – UKG",
    title: "Pre-Primary",
    intro:
      "A gentle, play-based introduction to school life. Children learn through songs, stories, art, and structured activity — building early language, number sense, and social confidence.",
    pillars: [
      "English medium from the very first day",
      "Songs, rhymes, and storytelling-led learning",
      "Motor skills, art, music, and free play",
      "A warm, unhurried transition into Class I",
    ],
    subjects: ["English", "Number work", "Rhymes & stories", "Art & craft", "Music & movement"],
    imageKey: "pre",
  },
  {
    range: "Class I – IV",
    title: "Primary School",
    intro:
      "The foundational years — building strong reading, writing, and reasoning habits. Lessons stay hands-on and grounded, with a steady rhythm of learning, activity, and reflection.",
    pillars: [
      "Reading and writing habits built daily",
      "Concrete, hands-on mathematics",
      "First encounters with Environmental Studies",
      "Weekly art, music, moral science, and games",
    ],
    subjects: ["English", "Hindi / Nepali", "Mathematics", "EVS", "Computer", "Art", "Moral Science", "Games"],
    imageKey: "primary",
  },
  {
    range: "Class V – VIII",
    title: "Middle School",
    intro:
      "Subject specialisation begins. Students move into full ICSE-aligned Science and Social Science, and take a third language — Hindi or Nepali — alongside their second language.",
    pillars: [
      "Subject-specialist teaching from Class V",
      "Third language: Hindi or Nepali (Classes V–VII)",
      "Introduction to laboratory work in Class VII",
      "Project work, debates, quizzes, and reading circles",
    ],
    subjects: ["English", "Hindi", "Nepali", "Mathematics", "Science", "History & Civics", "Geography", "Computer Applications", "Art"],
    imageKey: "middle",
  },
  {
    range: "Class IX – X",
    title: "Secondary (ICSE)",
    intro:
      "The two years that prepare students for the Indian Certificate of Secondary Education. Concepts are taught with depth, and continuous assessment supports steady preparation for the ICSE Board examination.",
    pillars: [
      "ICSE syllabus, New Delhi",
      "Written examinations and internal assessments",
      "Careful career and stream counselling",
      "Regular practice papers and revision cycles",
    ],
    subjects: ["English", "Second Language (Hindi / Nepali)", "History, Civics & Geography", "Mathematics", "Science (Physics · Chemistry · Biology)", "Computer Applications"],
    imageKey: "secondary",
  },
  {
    range: "Class XI – XII (Science)",
    title: "Senior Secondary (ISC)",
    intro:
      "The Science stream, leading to the Indian School Certificate examination. Students focus on Physics, Chemistry, Biology, Mathematics, and Computer Science — with strong preparation for higher studies and entrance examinations.",
    pillars: [
      "ISC syllabus, New Delhi",
      "Science stream: Physics · Chemistry · Biology / Mathematics / Computer Science",
      "Mentoring for higher studies and entrance tests",
      "Independent practical work in the laboratories",
    ],
    subjects: [
      "English",
      "Physics",
      "Chemistry",
      "Biology / Mathematics",
      "Computer Science (optional)",
      "Environmental Education & Physical Education",
    ],
    imageKey: "senior",
  },
];

const CURRICULUM = [
  { icon: BookOpen,     title: "English",              body: "English is the medium of instruction throughout the school. Reading, writing, and clear expression are taught with care from the earliest years." },
  { icon: Languages,    title: "Hindi & Nepali",       body: "Every student studies either Hindi or Nepali as the second language. In Classes V, VI, and VII, a third language is taught to strengthen fluency in both." },
  { icon: Calculator,   title: "Mathematics",          body: "Conceptual understanding is built patiently, from arithmetic in the primary years to the deeper reasoning of the ICSE and ISC syllabi." },
  { icon: FlaskConical, title: "Sciences",             body: "Physics, Chemistry, and Biology in laboratory-supported classes — leading into the ISC Science stream at senior secondary level." },
  { icon: Globe2,       title: "History, Civics & Geography", body: "The social sciences are taught with attention to Sikkim, India, and the wider world — encouraging citizenship and civic awareness." },
  { icon: Palette,      title: "Art, Music & Games",   body: "Art, music, moral science, and games remain part of the timetable throughout the school — not extras, but part of a rounded education." },
];

const EXAMS = [
  { name: "Class work & internal assessment", cadence: "Continuous",     weight: "Formative",  notes: "Class exercises, projects, notebook work, and oral evaluation." },
  { name: "Unit / cycle tests",               cadence: "Each term",      weight: "Formative",  notes: "Short written tests to consolidate learning between examinations." },
  { name: "Half-yearly examination",          cadence: "Mid-session",    weight: "Summative",  notes: "Written papers across all subjects, aligned with the ICSE pattern." },
  { name: "Annual / Board examination",       cadence: "End of session", weight: "Summative",  notes: "Internal annual (Nursery – IX, XI) or ICSE / ISC Board (Class X & XII)." },
];

export default async function AcademicsPage() {
  const cms = await getCmsSections([
    "academics_intro",
    "academics_hero_image",
    "academics_preprimary_image",
    "academics_primary_image",
    "academics_middle_image",
    "academics_secondary_image",
    "academics_senior_image",
  ]);
  const HERO_IMG = resolveImage("academics_hero_image", cms.academics_hero_image);
  const stageImage: Record<keyof typeof STAGE_IMAGE_KEYS, string> = {
    pre: resolveImage("academics_preprimary_image", cms.academics_preprimary_image),
    primary: resolveImage("academics_primary_image", cms.academics_primary_image),
    middle: resolveImage("academics_middle_image", cms.academics_middle_image),
    secondary: resolveImage("academics_secondary_image", cms.academics_secondary_image),
    senior: resolveImage("academics_senior_image", cms.academics_senior_image),
  };
  const STAGES: Stage[] = STAGE_TEMPLATES.map((t) => ({
    range: t.range,
    title: t.title,
    intro: t.intro,
    pillars: t.pillars,
    subjects: t.subjects,
    image: stageImage[t.imageKey],
  }));

  const stageTab = (s: Stage): TabItem => ({
    id: s.title.toLowerCase().replace(/\s+/g, "-"),
    label: s.title,
    content: (
      <section className="container-wide py-20 sm:py-24 lg:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">{s.range}</span>
            </p>
            <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
              {s.title}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
              {s.intro}
            </p>

            <ul className="mt-8 space-y-2.5">
              {s.pillars.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-[hsl(var(--ink))]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--gold))]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--ink-soft))]/70">
                Core subjects
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--ink))]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
              <Image
                src={s.image}
                alt={`${s.title} classroom`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    ),
  });

  const tabs: TabItem[] = [
    ...STAGES.map(stageTab),
    {
      id: "curriculum",
      label: "Curriculum",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">The curriculum</span>
          </p>
          <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            {cms.academics_intro.title ?? "An ICSE curriculum, taught with depth and care."}
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            {cms.academics_intro.body ??
              "St. Joseph's School is affiliated with the Council for the Indian School Certificate Examinations, New Delhi. Instruction is in English, with Hindi and Nepali as second languages, from Nursery all the way to Class XII (Science)."}
          </p>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CURRICULUM.map((c) => (
              <article
                key={c.title}
                className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-xl font-semibold text-[hsl(var(--ink))]">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                  {c.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: "examinations",
      label: "Examinations",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">How we assess</span>
              </p>
              <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
                Assessment that supports the learning.
              </h2>
              <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                Our assessment pattern mirrors the ICSE framework — continuous class work and
                unit tests through the term, followed by half-yearly and annual written examinations.
                Marks are a signal of learning, not the purpose of it.
              </p>
              <p className="mt-4 leading-relaxed text-[hsl(var(--ink-soft))]">
                Class X sits the ICSE Board examination and Class XII the ISC examination, both
                conducted by the Council for the Indian School Certificate Examinations, New Delhi.
                All other classes follow the same architecture, administered internally.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))]">
                <table className="w-full text-sm">
                  <thead className="bg-[hsl(var(--sand))]/50 text-xs uppercase tracking-[0.18em] text-[hsl(var(--ink-soft))]">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">Assessment</th>
                      <th className="px-5 py-4 text-left font-semibold">Cadence</th>
                      <th className="px-5 py-4 text-right font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXAMS.map((e) => (
                      <tr key={e.name} className="border-t border-[hsl(var(--border))]">
                        <td className="px-5 py-4">
                          <p className="font-medium text-[hsl(var(--ink))]">{e.name}</p>
                          <p className="mt-0.5 text-xs text-[hsl(var(--ink-soft))]">{e.notes}</p>
                        </td>
                        <td className="px-5 py-4 text-[hsl(var(--ink-soft))]">{e.cadence}</td>
                        <td className="px-5 py-4 text-right font-display text-base font-semibold text-[hsl(var(--ink))]">
                          {e.weight}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-[hsl(var(--ink-soft))]">
                Published results are accessible via the public
                <a href="/results" className="ml-1 text-[hsl(var(--primary))] underline-offset-4 hover:underline">
                  result lookup
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="Academics"
        title={
          <>
            The ICSE curriculum,
            <br />
            <span className="italic">taught with care.</span>
          </>
        }
        description="From Nursery to Class XII (Science), St. Joseph's follows the ICSE syllabus in English medium — with Hindi and Nepali as second languages."
        image={HERO_IMG}
        imageAlt="A classroom at St. Joseph's School, Kingston"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Academics" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
