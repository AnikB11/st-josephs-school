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

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Admissions to St. Joseph's School, Kingston — process, eligibility, documents, FAQs, and enquiry. Nursery through Class XII (Science), ICSE curriculum.",
  alternates: { canonical: "/admissions" },
  openGraph: { url: "/admissions", type: "website" },
};

const PROCESS = [
  { n: "01", title: "Enquiry",           body: "Get in touch through the school office or the enquiry form on this page." },
  { n: "02", title: "Prospectus & form", body: "Collect the admission form and prospectus from the school office in Kingston." },
  { n: "03", title: "Documents",         body: "Submit the completed form with the required certificates and previous records." },
  { n: "04", title: "Interaction",       body: "A short interaction with the child and parents — friendly and unhurried." },
  { n: "05", title: "Confirmation",      body: "On selection, the admission is confirmed by paying the prescribed admission fees at the office." },
];

const ELIGIBILITY = [
  { grade: "Nursery",          age: "Around 3 years of age at the start of the academic session", notes: "First entry into school — no prior schooling required." },
  { grade: "LKG / UKG",        age: "Age-appropriate at session start",                            notes: "Nursery / LKG report from the previous school where applicable." },
  { grade: "Class I – V",      age: "Age-appropriate at session start",                            notes: "Previous class report card and progress record required." },
  { grade: "Class VI – IX",    age: "Age-appropriate at session start",                            notes: "Transfer Certificate and previous school report required." },
  { grade: "Class XI (Science)", age: "Pass Class X (CISCE or equivalent)",                        notes: "Admission based on Class X marks; Science stream only." },
];

// The school publishes the fee structure directly. Rather than list numbers
// that go out of date, we point families to the admissions office for the
// current session's fee schedule.
const FEES = [
  { stage: "Pre-Primary (Nursery – UKG)", quarterly: "Contact office" },
  { stage: "Primary (I – IV)",            quarterly: "Contact office" },
  { stage: "Middle (V – VIII)",           quarterly: "Contact office" },
  { stage: "Secondary & Senior Secondary (IX – XII)", quarterly: "Contact office" },
];

const DOCS = [
  { icon: IdCard,     title: "Birth certificate",       body: "Original and a photocopy — issued by the municipality or hospital." },
  { icon: ScrollText, title: "Previous report card",    body: "The most recent report card and progress record from the current school." },
  { icon: Stamp,      title: "Transfer Certificate",    body: "Original Transfer Certificate from the previous school, for Class II and above." },
  { icon: ImageIcon,  title: "Photographs",             body: "Recent passport-size photographs of the child and both parents." },
  { icon: FileText,   title: "Parent identification",   body: "Photocopies of Aadhaar or valid ID of both parents / guardians." },
  { icon: FileText,   title: "Medical & vaccination",   body: "Immunisation record and any relevant medical history of the child." },
];

const FAQS = [
  {
    q: "When does the admissions process open?",
    a: "Enquiries are welcomed throughout the year. Admissions to the new academic session are typically announced through the school office and public notices — please contact us to know the current schedule.",
  },
  {
    q: "Is there an entrance test?",
    a: "For Nursery and lower classes, admission is based on a short, friendly interaction with the child and parents. For higher classes, a brief written assessment in the core subjects may be conducted.",
  },
  {
    q: "What is the medium of instruction?",
    a: "The medium of instruction is English throughout the school. Students study Hindi or Nepali as a second language; a third language (Hindi or Nepali) is compulsory for Classes V, VI, and VII.",
  },
  {
    q: "Does the school have a hostel?",
    a: "Yes. Separate hostels for boys and girls are run by the school management with the Cluny Sisters. Outstation students are recommended to make use of the hostel facilities.",
  },
  {
    q: "Which board is the school affiliated to?",
    a: "St. Joseph's School, Kingston is affiliated with the Council for the Indian School Certificate Examinations, New Delhi. Class X sits the ICSE examination and Class XII sits the ISC (Science stream).",
  },
  {
    q: "Can we visit the school before applying?",
    a: "Yes — parents are welcome to visit the campus during office hours. Please call the school office to confirm a convenient time.",
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
            {cms.admissions_intro.title ?? "A simple, transparent admissions process."}
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            {cms.admissions_intro.body ??
              "We welcome families who share our commitment to academic excellence, moral formation, and service to society. The process below is designed to be clear and respectful of your time."}
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
                Age, readiness, and a willingness to grow.
              </h2>
              <p className="mt-5 leading-relaxed text-[hsl(var(--ink-soft))]">
                Age is calculated at the start of the academic session. Children are welcomed
                on the basis of readiness and character, without discrimination of caste, creed,
                or economic status.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-[hsl(var(--ink))]">
                {[
                  "Age-appropriate readiness for the class applied for",
                  "A supportive home environment and regular attendance",
                  "Previous school record, where applicable",
                  "Openness to English medium instruction",
                  "Alignment with the school's motto — Love & Service",
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
                  Fee structure
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {FEES.map((f) => (
                    <div
                      key={f.stage}
                      className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-4 py-3"
                    >
                      <span className="text-sm text-[hsl(var(--ink-soft))]">{f.stage}</span>
                      <span className="font-display text-sm font-semibold text-[hsl(var(--primary))]">
                        {f.quarterly}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[hsl(var(--ink-soft))]">
                  The current session&apos;s fee schedule and hostel charges are shared through the
                  school office. Please contact us for details.
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
            What to keep ready when you apply.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            Please bring photocopies for the school office, along with the originals for
            verification. The list below is standard for admission at each level.
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
                Share a few details and the school office will be in touch with the next steps —
                including the current session&apos;s admission schedule and an invitation to visit
                the campus in Rhenock.
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
                Office hours: Monday – Friday, 9:00 AM – 2:00 PM. Saturdays by appointment.
                Parents are welcome to visit the school campus during office hours.
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
        eyebrow="Admissions"
        title={
          <>
            Join a school shaped by
            <br />
            <span className="italic">love and service.</span>
          </>
        }
        description="Admissions to St. Joseph's School, Kingston follow a clear, unhurried process. Speak with our office to visit the campus and understand the next steps."
        image={HERO_IMG}
        imageAlt="An open day at St. Joseph's School, Kingston"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
      />

      <TabbedPage tabs={tabs} />

      <AdmissionsCta />
    </>
  );
}
