import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { PrincipalMessage } from "@/components/site/principal-message";
import { Stats } from "@/components/site/stats";
import { SCHOOL } from "@/lib/constants";
import { getCmsSections } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SCHOOL.name}: our story, our mission, and the people who make the community.`,
};

const VALUES = [
  {
    title: "Academic rigor",
    body: "A curriculum that challenges and supports — designed to graduate students who can think, not just recite.",
  },
  {
    title: "Whole-child education",
    body: "Sports, arts, service, and reflection sit alongside academics, not behind them.",
  },
  {
    title: "Community first",
    body: "Small classes, known students, and parents who are partners — not customers.",
  },
];

const MILESTONES = [
  { year: "1965", text: "School founded by the Sisters of St. Joseph" },
  { year: "1982", text: "Class XII batch graduates with state-topping results" },
  { year: "2001", text: "New senior wing and science labs inaugurated" },
  { year: "2019", text: "Sports complex and 200-seat auditorium" },
  { year: "2024", text: "Digital classrooms across all grades" },
];

export default async function AboutPage() {
  const cms = await getCmsSections(["about_intro", "principal_message"]);
  return (
    <>
      <section className="container-wide py-20 sm:py-28">
        <SectionHeading
          eyebrow="About us"
          title={cms.about_intro.title ?? "A school built on character, curiosity, and care."}
          description={
            cms.about_intro.body ??
            `${SCHOOL.name} was founded in ${SCHOOL.founded} with a simple idea — that every child deserves to be known. Six decades on, that idea still shapes everything we do.`
          }
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-slate-200/70 bg-white p-6"
            >
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Stats />

      <PrincipalMessage title={cms.principal_message.title} body={cms.principal_message.body} />

      <section className="container-wide py-20 sm:py-28">
        <SectionHeading eyebrow="Our journey" title="Six decades, in moments." />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MILESTONES.map((m) => (
            <li
              key={m.year}
              className="rounded-2xl border border-slate-200/70 bg-white p-6"
            >
              <p className="font-display text-2xl font-semibold text-primary">
                {m.year}
              </p>
              <p className="mt-1 text-sm text-slate-700">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
