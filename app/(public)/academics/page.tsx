import type { Metadata } from "next";
import { BookOpen, FlaskConical, Microscope, Palette, Trophy, Users } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "Academics",
  description:
    "From early years to senior secondary — our academic philosophy, programs, and approach.",
};

const STAGES = [
  {
    name: "Pre-Primary",
    range: "Nursery – KG",
    body: "A play-based foundation built on language, motor skills, and social development.",
  },
  {
    name: "Primary",
    range: "Class I – V",
    body: "Strong foundations in literacy, numeracy, and inquiry — the curiosity years.",
  },
  {
    name: "Middle School",
    range: "Class VI – VIII",
    body: "Subject specialization begins. Students learn to think critically and write well.",
  },
  {
    name: "Senior Secondary",
    range: "Class IX – XII",
    body: "Streams in Science, Commerce, and Humanities — preparing students for board exams and beyond.",
  },
];

const PILLARS = [
  { icon: BookOpen, title: "Rigorous core" },
  { icon: FlaskConical, title: "Hands-on science" },
  { icon: Palette, title: "Strong arts" },
  { icon: Trophy, title: "Sports for all" },
  { icon: Users, title: "Service learning" },
  { icon: Microscope, title: "Research projects" },
];

export default function AcademicsPage() {
  return (
    <>
      <section className="container-wide py-20 sm:py-28">
        <SectionHeading
          eyebrow="Academics"
          title="A curriculum that grows with the student."
          description="From the first day of nursery to the last day of Class XII, our academic program is built around depth, discipline, and discovery."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {STAGES.map((s) => (
            <article key={s.name} className="rounded-2xl border border-slate-200/70 bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {s.range}
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold text-slate-900">
                {s.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50/50 py-20 sm:py-28">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Our pillars"
            title="Six things every student gets to do."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Embedded into the timetable for every grade.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
