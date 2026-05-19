import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SCHOOL.name}. Phone, email, and office hours.`,
};

export default function ContactPage() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <SectionHeading
        eyebrow="Get in touch"
        title="We'd love to hear from you."
        description="Whether you're considering admission, an alumnus, or just curious — drop us a line."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">Campus</p>
              <p className="text-sm text-slate-600">{SCHOOL.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">Phone</p>
              <a href={`tel:${SCHOOL.phone}`} className="text-sm text-slate-600 hover:text-primary">
                {SCHOOL.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">Email</p>
              <a href={`mailto:${SCHOOL.email}`} className="text-sm text-slate-600 hover:text-primary">
                {SCHOOL.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">Office hours</p>
              <p className="text-sm text-slate-600">
                Monday – Friday · 8:00 AM – 3:30 PM<br />
                Saturday · 9:00 AM – 12:30 PM
              </p>
            </div>
          </div>
        </div>

        <form
          action="/api/contact"
          method="POST"
          className="lg:col-span-3 rounded-2xl border border-slate-200/70 bg-white p-6 sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
          <Button type="submit" className="mt-6 w-full sm:w-auto">
            Send message
          </Button>
        </form>
      </div>
    </section>
  );
}
