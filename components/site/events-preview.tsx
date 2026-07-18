import { Calendar, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";

const EVENTS = [
  { title: "Feast of St. Joseph",        date: "2027-03-19T09:00:00Z", location: "School Chapel" },
  { title: "Annual Sports Meet",         date: "2027-02-15T09:00:00Z", location: "Main Ground" },
  { title: "Christmas Carol Service",    date: "2026-12-19T17:00:00Z", location: "Chapel & Assembly Hall" },
];

export function EventsPreview() {
  return (
    <section className="surface-cream py-24 sm:py-32">
      <div className="container-wide">
        <SectionHeading
          eyebrow="School calendar"
          title="Marking the year together"
          description="Feasts, meets, and gatherings that shape life on campus. Exact dates are confirmed in the school circulars each term."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {EVENTS.map((e, i) => {
            const d = new Date(e.date);
            return (
              <Reveal key={e.title} delay={i * 0.08}>
                <div
                  className="group relative flex h-full items-start gap-4 overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[hsl(var(--border))] bg-white">
                    <div className="text-center leading-tight" suppressHydrationWarning>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
                        {d.toLocaleString("en-US", { month: "short" })}
                      </p>
                      <p className="font-display text-2xl font-semibold text-[hsl(var(--ink))]">
                        {d.getDate()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[hsl(var(--ink))] group-hover:text-[hsl(var(--primary))]">
                      {e.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[hsl(var(--ink-soft))]" suppressHydrationWarning>
                      <Calendar className="h-3 w-3" />
                      {formatDate(d, { weekday: "short", day: "2-digit", month: "short" })}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[hsl(var(--ink-soft))]">
                      <MapPin className="h-3 w-3" /> {e.location}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
