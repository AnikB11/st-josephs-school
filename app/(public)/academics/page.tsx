import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, FlaskConical, Languages, Calculator, Globe2, Palette, CheckCircle2 } from "lucide-react";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { AdmissionsCta } from "@/components/site/admissions-cta";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Academics",
  description:
    "Pre-Primary through Senior Secondary — curriculum, classroom, examinations.",
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
    range: "Nursery – KG",
    title: "Pre-Primary",
    intro:
      "A play-based foundation built on language, motor skills, and social development. Children learn through movement, music, and structured play — not worksheets.",
    pillars: [
      "8:1 student-teacher ratio",
      "Storytelling-led literacy",
      "Outdoor play every day",
      "Parent-included transition into Class I",
    ],
    subjects: ["Phonics", "Number sense", "Movement", "Music", "Art", "Free play"],
    imageKey: "pre",
  },
  {
    range: "Class I – V",
    title: "Primary School",
    intro:
      "Strong foundations in literacy, numeracy, and inquiry — the curiosity years. Subject specialists start joining the homeroom team from Class III.",
    pillars: [
      "Reading workshops daily",
      "Mental-math and problem-solving",
      "First exposure to lab sciences",
      "Weekly arts and sport in the timetable",
    ],
    subjects: ["English", "Hindi", "Mathematics", "EVS", "Computer", "Arts", "Sport"],
    imageKey: "primary",
  },
  {
    range: "Class VI – VIII",
    title: "Middle School",
    intro:
      "Subject specialisation begins. Students learn to think critically, write well, and own their work. Project-based assessments sit alongside written exams.",
    pillars: [
      "Subject-specialist teaching",
      "Annual research project",
      "Inter-house debates and quizzes",
      "Introduction to a second language",
    ],
    subjects: ["English", "Hindi / Sanskrit", "Mathematics", "Science", "Social Studies", "Computer", "Arts", "Sport"],
    imageKey: "middle",
  },
  {
    range: "Class IX – X",
    title: "Secondary School",
    intro:
      "CBSE syllabus delivered with depth and care. The two years that shape the student's relationship with rigour, time-management, and self-direction.",
    pillars: [
      "Topic-tested mastery framework",
      "Continuous formative assessment",
      "Career and stream counselling",
      "Board-paper analysis & preparation",
    ],
    subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Applications"],
    imageKey: "secondary",
  },
  {
    range: "Class XI – XII",
    title: "Senior Secondary",
    intro:
      "Streams in Science, Commerce, and Humanities. Two-year capstone research projects, university-prep mentoring, and exposure to real-world problems.",
    pillars: [
      "Science · Commerce · Humanities streams",
      "Independent capstone project",
      "University and entrance-exam mentoring",
      "Visiting lectures and industry visits",
    ],
    subjects: [
      "English Core",
      "Stream majors (Physics / Accountancy / History etc.)",
      "Optional applied subjects",
      "Physical Education",
    ],
    imageKey: "senior",
  },
];

const CURRICULUM = [
  { icon: BookOpen,     title: "English & literature",        body: "Daily reading, weekly writing, and a love-of-language that runs from Nursery to Class XII." },
  { icon: Languages,    title: "Languages",                   body: "Hindi as the second language across all grades; Sanskrit and French as options from Class VI." },
  { icon: Calculator,   title: "Mathematics",                 body: "Conceptual mastery before procedural fluency. Annual Olympiads from Class III." },
  { icon: FlaskConical, title: "Sciences",                    body: "Hands-on labs from Class VI. Research projects in Physics, Chemistry, and Biology in senior years." },
  { icon: Globe2,       title: "Social sciences",             body: "History, geography, civics and economics — taught with primary sources and current events." },
  { icon: Palette,      title: "Arts & physical education",   body: "Studio art, music, drama, and sport — every term, every year, for every student." },
];

const EXAMS = [
  { name: "Formative checks",       cadence: "Continuous",          weight: "20%", notes: "Quizzes, in-class work, lab reports." },
  { name: "Unit assessments",       cadence: "Every 4–5 weeks",     weight: "20%", notes: "Per-subject, short written paper." },
  { name: "Mid-year examination",   cadence: "Term 1 close",        weight: "20%", notes: "Cumulative paper across all subjects." },
  { name: "Annual / Board exam",    cadence: "Term 2 close",        weight: "40%", notes: "Internal annual (Class I–IX) / CBSE Board (Class X & XII)." },
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
            {cms.academics_intro.title ?? "A curriculum that grows with the student."}
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            {cms.academics_intro.body ??
              "From the first day of nursery to the last day of Class XII, our academic program is built around depth, discipline, and discovery."}
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
                Assessment as a teaching tool, not a verdict.
              </h2>
              <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                Every test is built to give the student and teacher a clearer
                map of what&apos;s understood and what isn&apos;t. Marks are a
                consequence of learning, never the goal.
              </p>
              <p className="mt-4 leading-relaxed text-[hsl(var(--ink-soft))]">
                Class X and XII follow the CBSE board pattern; all other grades
                follow the same architecture, internally administered.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))]">
                <table className="w-full text-sm">
                  <thead className="bg-[hsl(var(--sand))]/50 text-xs uppercase tracking-[0.18em] text-[hsl(var(--ink-soft))]">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">Assessment</th>
                      <th className="px-5 py-4 text-left font-semibold">Cadence</th>
                      <th className="px-5 py-4 text-right font-semibold">Weight</th>
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
            A curriculum that <span className="italic">grows with the student.</span>
          </>
        }
        description="From the first day of nursery to the last day of Class XII, our academic programme is built around depth, discipline, and discovery."
        image={HERO_IMG}
        imageAlt="A St. Joseph's classroom"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Academics" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
