import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/motion/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { SCHOOL } from "@/lib/constants";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SCHOOL.name}. Phone, email, and office hours.`,
};

type ContactItem = {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
};

const CONTACT_ITEMS: ContactItem[] = [
  { icon: MapPin, label: "Campus",       value: SCHOOL.address },
  { icon: Phone,  label: "Phone",        value: SCHOOL.phone, href: `tel:${SCHOOL.phone}` },
  { icon: Mail,   label: "Email",        value: SCHOOL.email, href: `mailto:${SCHOOL.email}` },
  { icon: Clock,  label: "Office hours", value: "Mon – Fri · 8:00 AM – 3:30 PM\nSat · 9:00 AM – 12:30 PM" },
];

export default async function ContactPage() {
  const cms = await getCmsSections([
    "contact_intro",
    "contact_hero_image",
    "contact_visit_image",
  ]);
  const HERO_IMG = resolveImage("contact_hero_image", cms.contact_hero_image);
  const CAMPUS_IMG = resolveImage("contact_visit_image", cms.contact_visit_image);
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title={cms.contact_intro.title ?? "We'd love to hear from you."}
        description={
          cms.contact_intro.body ??
          "Whether you're considering admission, an alumnus, or just curious — drop us a line."
        }
        image={HERO_IMG}
      />

      <section className="container-wide py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-5">
          <Reveal variant="left" className="lg:col-span-2">
            <ul className="space-y-7">
              {CONTACT_ITEMS.map((it) => (
                <li key={it.label} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]">
                    <it.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-[hsl(var(--ink))]">
                      {it.label}
                    </p>
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

            <div className="mt-10">
              <ParallaxImage
                src={CAMPUS_IMG}
                alt="St. Joseph's campus"
                wrapperClassName="aspect-[4/3]"
                intensity={40}
              />
            </div>
          </Reveal>

          <Reveal variant="right" className="lg:col-span-3">
            <form
              action="/api/contact"
              method="POST"
              className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 sm:p-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
                <span className="gold-rule">Send a message</span>
              </p>
              <h3 className="font-display mt-3 text-2xl font-semibold text-[hsl(var(--ink))]">
                Write to us.
              </h3>

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
                <Input id="subject" name="subject" required className="mt-1.5" />
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
