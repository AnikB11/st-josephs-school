import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronDown, FileText, IdCard, Image as ImageIcon, Mail, Phone, ScrollText, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { AdmissionsCta } from "@/components/site/admissions-cta";
import { SCHOOL } from "@/lib/constants";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Admissions are open for 2026–27. Process, eligibility, required documents, FAQs, and enquiry form.",
};

const PROCESS = [
  { n: "01", title: "Online form",        body: "Fill the digital application — about 10 minutes." },
  { n: "02", title: "Document upload",    body: "Upload scanned copies of the required documents." },
  { n: "03", title: "Interaction",        body: "A short, friendly conversation with the child and parents." },
  { n: "04", title: "Decision",           body: "Outcomes communicated within 10 working days." },
  { n: "05", title: "Confirm seat",       body: "Pay the admission fee within 7 days to confirm the seat." },
];

const ELIGIBILITY = [
  { grade: "Nursery",       age: "Completed 3 years by 31 March",  notes: "No prior schooling required." },
  { grade: "LKG / UKG",     age: "Age-appropriate by 31 March",     notes: "Prior nursery report card preferred." },
  { grade: "Class I – V",   age: "Age-appropriate by 31 March",     notes: "Prior 2 years' report cards required." },
  { grade: "Class VI – IX", age: "Age-appropriate by 31 March",     notes: "Transfer Certificate from prior school." },
  { grade: "Class XI",      age: "Pass Class X (any board)",        notes: "Stream allocation based on Class X marks." },
];

const FEES = [
  { stage: "Pre-Primary",       quarterly: "₹ 22,000" },
  { stage: "Primary (I–V)",     quarterly: "₹ 28,000" },
  { stage: "Middle (VI–VIII)",  quarterly: "₹ 32,000" },
  { stage: "Senior (IX–XII)",   quarterly: "₹ 38,000" },
];

const DOCS = [
  { icon: IdCard,     title: "Birth certificate",       body: "Issued by the municipality or hospital — original to be sighted." },
  { icon: ScrollText, title: "Prior report card",       body: "Most recent academic year, all subjects, attendance record." },
  { icon: Stamp,      title: "Transfer certificate",    body: "Required only for Class VI and above. Original required at admission." },
  { icon: ImageIcon,  title: "Photographs",             body: "Two recent passport-size photographs of the child." },
  { icon: FileText,   title: "Parent ID + address",     body: "Aadhaar / passport copies of both parents and proof of address." },
  { icon: FileText,   title: "Medical record",          body: "Immunisation card and any relevant medical history." },
];

const FAQS = [
  {
    q: "When does the admission window open?",
    a: "Applications for the upcoming academic year open in early November and close in late January. Late applications are reviewed only if seats remain.",
  },
  {
    q: "Is there an entrance test?",
    a: "There is no written test for Nursery through Class V — admissions are based on a friendly interaction. Classes VI to XI involve a short written assessment in core subjects.",
  },
  {
    q: "Are scholarships available?",
    a: "Yes. Need-based scholarships cover up to 100% of tuition for select families each year. Merit scholarships are offered to top entrants in Classes IX and XI.",
  },
  {
    q: "Do you offer transport?",
    a: "Yes — bus routes cover most of the town across three primary corridors. Routes and stops are listed on the parent portal at the start of each session.",
  },
  {
    q: "Is there sibling priority?",
    a: "Yes. Younger siblings of current students receive priority consideration, subject to seat availability and meeting basic eligibility.",
  },
  {
    q: "When can we visit the campus?",
    a: "Open Days are held on the first Saturday of every month between October and February. Schedule a visit through the contact form on this page.",
  },
];

export default async function AdmissionsPage() {
  const cms = await getCmsSections([
    "admissions_intro",
    "admissions_hero_image",
    "admissions_cta_image",
  ]);
  const HERO_IMG = resolveImage("admissions_hero_image", cms.admissions_hero_image);
  const CTA_IMG = resolveImage("admissions_cta_image", cms.admissions_cta_image);

  const tabs: TabItem[] = [
    {
      id: "process",
      label: "Admission Process",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">The process</span>
          </p>
          <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            {cms.admissions_intro.title ?? "Five steps. Ten working days."}
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            {cms.admissions_intro.body ??
              "Our admissions process is designed to be transparent and respectful of families' time."}
          </p>

          <ol className="relative mt-14 grid gap-4 lg:grid-cols-5">
            {PROCESS.map((s, i) => (
              <li
                key={s.n}
                className="relative rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
              >
                <span className="font-display text-4xl font-semibold leading-none text-[hsl(var(--primary))]/85">
                  {s.n}
                </span>
                <h3 className="font-display mt-4 text-base font-semibold text-[hsl(var(--ink))]">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                  {s.body}
                </p>
                {i < PROCESS.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden lg:block absolute right-[-10px] top-1/2 h-px w-5 bg-[hsl(var(--border))]"
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="mt-12">
            <Link href="#enquiry">
              <Button
                size="lg"
                className="h-12 rounded-full bg-[hsl(var(--primary))] px-7 text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
              >
                Begin enquiry
              </Button>
            </Link>
          </div>
        </section>
      ),
    },
    {
      id: "eligibility",
      label: "Eligibility",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Who can apply</span>
              </p>
              <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
                Age, ability, and a willingness to learn.
              </h2>
              <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                Age cutoffs are calculated as of <strong>31&nbsp;March</strong>{" "}
                of the year admission is sought. We admit children based on
                potential, not pedigree.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-[hsl(var(--ink))]">
                {[
                  "Age-appropriate readiness for the grade applied",
                  "Genuine curiosity and willingness to engage",
                  "A supportive home environment",
                  "Prior academic record (where available)",
                  "Fit with the school's values",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--gold))]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))]">
                <table className="w-full text-sm">
                  <thead className="bg-[hsl(var(--sand))]/50 text-xs uppercase tracking-[0.18em] text-[hsl(var(--ink-soft))]">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">Grade</th>
                      <th className="px-5 py-4 text-left font-semibold">Age requirement</th>
                      <th className="px-5 py-4 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ELIGIBILITY.map((e) => (
                      <tr key={e.grade} className="border-t border-[hsl(var(--border))]">
                        <td className="px-5 py-4 font-display font-semibold text-[hsl(var(--ink))]">{e.grade}</td>
                        <td className="px-5 py-4 text-[hsl(var(--ink))]">{e.age}</td>
                        <td className="px-5 py-4 text-[hsl(var(--ink-soft))]">{e.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                  Fees · 2026–27
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {FEES.map((f) => (
                    <div
                      key={f.stage}
                      className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-4 py-3"
                    >
                      <span className="text-sm text-[hsl(var(--ink-soft))]">{f.stage}</span>
                      <span className="font-display text-base font-semibold text-[hsl(var(--ink))]">
                        {f.quarterly}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[hsl(var(--ink-soft))]">
                  One-time admission fee of ₹ 25,000 applies. Need-based scholarships available.
                </p>
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: "documents",
      label: "Required Documents",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">Documents checklist</span>
          </p>
          <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            What to keep ready before you apply.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            Scanned copies are sufficient at the application stage. Originals
            are sighted at admission confirmation.
          </p>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DOCS.map((d) => (
              <article
                key={d.title}
                className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                  <d.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 text-base font-semibold text-[hsl(var(--ink))]">
                  {d.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                  {d.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: "faqs",
      label: "FAQs",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">Frequently asked</span>
          </p>
          <h2 className="heading mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            Quick answers to the questions families ask most.
          </h2>

          <div className="mx-auto mt-12 max-w-3xl divide-y divide-[hsl(var(--border))] rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))]">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer items-start justify-between gap-6 list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-base font-semibold text-[hsl(var(--ink))]">
                    {f.q}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[hsl(var(--ink-soft))] transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: "enquiry",
      label: "Admission Enquiry",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Enquire</span>
              </p>
              <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl">
                Tell us about your child.
              </h2>
              <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                Share a few details and our admissions office will get back
                within two working days with the next steps — including a
                campus visit invitation.
              </p>
            </div>
            <div className="lg:col-span-3">
              <form
                action="/api/contact"
                method="POST"
                className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 sm:p-10"
              >
                <input type="hidden" name="subject" value="Admission enquiry" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="parent_name">Parent name</Label>
                    <Input id="parent_name" name="name" required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade applying for</Label>
                    <Input id="grade" name="grade" placeholder="e.g. Class IV" required className="mt-1.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="message">Anything you&apos;d like us to know</Label>
                  <Textarea id="message" name="message" rows={4} className="mt-1.5" />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="mt-7 h-12 rounded-full bg-[hsl(var(--primary))] px-7 text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
                >
                  Submit enquiry
                </Button>
              </form>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: "contact",
      label: "Contact Admissions",
      content: (
        <section className="container-wide py-20 sm:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Admissions office</span>
              </p>
              <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl">
                Talk to a person, not a portal.
              </h2>
              <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                Office hours: Mon – Fri · 9:00 AM – 2:00 PM. Open Days every
                first Saturday between October and February.
              </p>

              <ul className="mt-8 space-y-5">
                <li className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">
                      Admissions desk
                    </p>
                    <a href={`tel:${SCHOOL.phone}`} className="text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--primary))]">
                      {SCHOOL.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">
                      Admissions email
                    </p>
                    <a href={`mailto:${SCHOOL.email}`} className="text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--primary))]">
                      {SCHOOL.email}
                    </a>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
                <Image
                  src={CTA_IMG}
                  alt="St. Joseph's admissions office"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="Admissions 2026–27"
        title={
          <>
            Begin a journey that <span className="italic">lasts a lifetime.</span>
          </>
        }
        description="Our admissions process is designed to be transparent and respectful of families' time."
        image={HERO_IMG}
        imageAlt="A St. Joseph's open day"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
