import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  Music,
  Phone,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CinematicHero } from "@/components/site/cinematic-hero";
import { TabbedPage, type TabItem } from "@/components/site/tabbed-page";
import { SCHOOL } from "@/lib/constants";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SCHOOL.name}. Phone, email, departments, and support.`,
};

type ContactItem = {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
};

const CONTACT_ITEMS: ContactItem[] = [
  { icon: MapPin, label: "Campus", value: SCHOOL.address },
  { icon: Phone,  label: "Phone",  value: SCHOOL.phone, href: `tel:${SCHOOL.phone}` },
  { icon: Mail,   label: "Email",  value: SCHOOL.email, href: `mailto:${SCHOOL.email}` },
  { icon: Clock,  label: "Office hours", value: "Mon – Fri · 8:00 AM – 3:30 PM\nSat · 9:00 AM – 12:30 PM" },
];

const DEPARTMENTS = [
  { icon: BookOpen,    name: "Academics",            head: "Mr. Sandeep Iyer",      title: "Vice Principal · Academics",  email: "academics@stjosephs.edu" },
  { icon: FlaskConical,name: "Sciences",             head: "Dr. Reena Kapoor",      title: "Head of Sciences",             email: "sciences@stjosephs.edu" },
  { icon: BookOpen,    name: "Humanities",           head: "Ms. Lara D'Souza",      title: "Head of Humanities",           email: "humanities@stjosephs.edu" },
  { icon: Trophy,      name: "Sports",               head: "Mr. Faisal Ahmed",      title: "Director of Sport",            email: "sport@stjosephs.edu" },
  { icon: Music,       name: "Arts & Music",         head: "Ms. Anjali Verma",      title: "Vice Principal · Pastoral",    email: "arts@stjosephs.edu" },
  { icon: Briefcase,   name: "Administration",       head: "Mrs. Margaret Rosario", title: "Principal",                    email: "principal@stjosephs.edu" },
];

const SUPPORT_LINKS = [
  { icon: GraduationCap, title: "Parent portal",         body: "Trouble logging in or finding your child's results.", href: "/parent/login" },
  { icon: Building2,     title: "Student portal",        body: "Reset access or get help with assignments and notices.", href: "/student/login" },
  { icon: HelpCircle,    title: "Admissions enquiries",  body: "Help with the application, documents, and timelines.",  href: "/admissions" },
  { icon: LifeBuoy,      title: "General school office", body: "Anything else — we'll route your message to the right person.", href: "#enquiry-form" },
];

function ContactList() {
  return (
    <ul className="space-y-7">
      {CONTACT_ITEMS.map((it) => (
        <li key={it.label} className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
            <it.icon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">{it.label}</p>
            {it.href ? (
              <a
                href={it.href}
                className="mt-0.5 block text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--primary))]"
              >
                {it.value}
              </a>
            ) : (
              <p className="mt-0.5 whitespace-pre-line text-sm text-[hsl(var(--ink-soft))]">
                {it.value}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function EnquiryForm({
  title = "Write to us.",
  eyebrow = "Send a message",
  subject = "",
}: { title?: string; eyebrow?: string; subject?: string }) {
  return (
    <form
      id="enquiry-form"
      action="/api/contact"
      method="POST"
      className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 sm:p-10"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
        <span className="gold-rule">{eyebrow}</span>
      </p>
      <h3 className="font-display mt-3 text-2xl font-semibold text-[hsl(var(--ink))]">{title}</h3>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required className="mt-1.5" defaultValue={subject} />
      </div>
      <div className="mt-4">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} required className="mt-1.5" />
      </div>
      <Button
        type="submit"
        size="lg"
        className="mt-7 h-12 rounded-full bg-[hsl(var(--primary))] px-7 text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
      >
        Send message
      </Button>
    </form>
  );
}

export default async function ContactPage() {
  const cms = await getCmsSections([
    "contact_intro",
    "contact_hero_image",
    "contact_visit_image",
  ]);
  const HERO_IMG = resolveImage("contact_hero_image", cms.contact_hero_image);
  const CAMPUS_IMG = resolveImage("contact_visit_image", cms.contact_visit_image);
  const mapsQuery = encodeURIComponent(SCHOOL.address);
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

  const tabs: TabItem[] = [
    {
      id: "general",
      label: "General Enquiry",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Reach the school</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl">
                Get in touch with the office.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))]">
                Most general questions are answered within one school day. For anything time-sensitive,
                the office phone line is the fastest route.
              </p>
              <div className="mt-10">
                <ContactList />
              </div>
            </div>
            <div className="lg:col-span-3">
              <EnquiryForm title="Write to us." eyebrow="Send a message" />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: "admissions",
      label: "Admissions",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Admissions office</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl">
                Considering St. Joseph's?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))]">
                We respond to admissions enquiries within one working day. You can also start
                the application straight from our admissions page.
              </p>
              <div className="mt-10 space-y-7">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">
                      Admissions email
                    </p>
                    <a
                      href="mailto:admissions@stjosephs.edu"
                      className="mt-0.5 block text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--primary))]"
                    >
                      admissions@stjosephs.edu
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">
                      Admissions line
                    </p>
                    <a
                      href={`tel:${SCHOOL.phone}`}
                      className="mt-0.5 block text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--primary))]"
                    >
                      {SCHOOL.phone}
                    </a>
                    <p className="mt-0.5 text-xs text-[hsl(var(--ink-soft))]/80">Mon – Sat, 9 AM – 1 PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/admissions">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-[hsl(var(--primary))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
                  >
                    Visit admissions page
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-3">
              <EnquiryForm
                title="Ask the admissions office."
                eyebrow="Admissions enquiry"
                subject="Admissions enquiry"
              />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: "location",
      label: "Campus Location",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Find us</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl">
                Visit the campus.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))]">
                The school is open to visitors during office hours. Prospective families are
                welcome to book a guided campus tour through the admissions office.
              </p>
              <div className="mt-10 space-y-7">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">
                      Address
                    </p>
                    <p className="mt-0.5 text-sm text-[hsl(var(--ink-soft))]">{SCHOOL.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">
                      Visiting hours
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-[hsl(var(--ink-soft))]">
                      Mon – Fri · 9:00 AM – 3:00 PM{"\n"}Sat · 9:30 AM – 12:00 PM
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <a href={directionsHref} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-[hsl(var(--primary))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
                  >
                    Get directions
                  </Button>
                </a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
                <Image
                  src={CAMPUS_IMG}
                  alt="St. Joseph's campus"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))]/35 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                      <span className="gold-rule">14-acre campus</span>
                    </p>
                    <p className="font-display mt-2 text-2xl font-semibold">{SCHOOL.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: "departments",
      label: "Departments",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">Reach a department</span>
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl lg:text-5xl">
            The people you'd want to talk to.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
            Each department has a designated head of contact for parent and student questions.
            Emails are answered within one school day.
          </p>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DEPARTMENTS.map((d) => (
              <article
                key={d.name}
                className="flex h-full flex-col rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                  <d.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-xl font-semibold text-[hsl(var(--ink))]">
                  {d.name}
                </h3>
                <p className="mt-2 text-sm text-[hsl(var(--ink))]">{d.head}</p>
                <p className="text-xs text-[hsl(var(--ink-soft))]">{d.title}</p>
                <a
                  href={`mailto:${d.email}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--primary))]"
                >
                  <Mail className="h-3.5 w-3.5" /> {d.email}
                </a>
              </article>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: "support",
      label: "Support",
      content: (
        <section className="container-wide py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Help</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-3xl font-semibold leading-[1.1] text-[hsl(var(--ink))] sm:text-4xl">
                Looking for help with the website or a portal?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[hsl(var(--ink-soft))]">
                Most portal questions — parent logins, student results, missing notices — are
                handled by the school office. Pick a route below.
              </p>
            </div>
            <div className="lg:col-span-7 grid gap-5 sm:grid-cols-2">
              {SUPPORT_LINKS.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="group flex h-full flex-col rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.18)]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display mt-5 text-lg font-semibold text-[hsl(var(--ink))] group-hover:text-[hsl(var(--primary))]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-[hsl(var(--ink-soft))]">{s.body}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <EnquiryForm
              title="Still need a hand? Drop us a note."
              eyebrow="Support enquiry"
              subject="Website / portal support"
            />
          </div>
        </section>
      ),
    },
  ];

  return (
    <>
      <CinematicHero
        eyebrow="Contact"
        title={
          <>
            We'd love to hear <span className="italic">from you.</span>
          </>
        }
        description={
          cms.contact_intro.body ??
          "Whether you're considering admission, an alumnus, or just curious — drop us a line."
        }
        image={HERO_IMG}
        imageAlt="St. Joseph's campus"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <TabbedPage tabs={tabs} />
    </>
  );
}
