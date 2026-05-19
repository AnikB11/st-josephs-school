import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { AdmissionsCta } from "@/components/site/admissions-cta";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Admissions are open for 2026–27. Read about the process, key dates, and how to apply.",
};

const STEPS = [
  { n: "01", title: "Online form", body: "Fill the digital application — about 10 minutes." },
  { n: "02", title: "Document upload", body: "Birth certificate, prior report card, and a photo." },
  { n: "03", title: "Interaction", body: "A short, friendly conversation with the child and parents." },
  { n: "04", title: "Decision", body: "Outcomes communicated within 10 working days." },
];

const FEES = [
  { stage: "Pre-Primary", quarterly: "₹ 22,000" },
  { stage: "Primary (I–V)", quarterly: "₹ 28,000" },
  { stage: "Middle (VI–VIII)", quarterly: "₹ 32,000" },
  { stage: "Senior (IX–XII)", quarterly: "₹ 38,000" },
];

export default function AdmissionsPage() {
  return (
    <>
      <section className="container-wide py-20 sm:py-28">
        <SectionHeading
          eyebrow="Admissions 2026–27"
          title="Becoming part of St. Joseph's."
          description="Our admissions process is designed to be transparent and respectful of families' time."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-slate-200/70 bg-white p-6"
            >
              <p className="font-display text-2xl font-semibold text-primary">{s.n}</p>
              <h3 className="font-display mt-2 text-base font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50/50 py-20 sm:py-28">
        <div className="container-wide grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="What we look for"
              title="Curiosity over credentials."
              description="We admit children based on potential, not pedigree. Here's what the committee considers:"
            />
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "Age-appropriate readiness for the grade applied",
                "Genuine curiosity and willingness to engage",
                "A supportive home environment",
                "Prior academic record (where available)",
                "Fit with the school's values",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-emerald" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading
              eyebrow="Fees structure"
              title="Transparent, all-inclusive."
            />
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Stage</th>
                    <th className="px-5 py-3 text-right">Per quarter</th>
                  </tr>
                </thead>
                <tbody>
                  {FEES.map((f) => (
                    <tr key={f.stage} className="border-t border-slate-100">
                      <td className="px-5 py-3.5 text-slate-800">{f.stage}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                        {f.quarterly}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              One-time admission fee of ₹ 25,000 applies. Need-based scholarships available.
            </p>
            <div className="mt-6">
              <Button size="lg">Start application</Button>
            </div>
          </div>
        </div>
      </section>

      <AdmissionsCta />
    </>
  );
}
