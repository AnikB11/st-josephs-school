import { Calendar, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";

const EVENTS = [
  { title: "Annual Sports Day",          date: "2026-06-08T09:00:00Z", location: "Main Field" },
  { title: "Inter-school Science Fair",  date: "2026-06-22T10:00:00Z", location: "Auditorium" },
  { title: "Founder's Day",              date: "2026-07-04T16:30:00Z", location: "Chapel & Lawn" },
];

export function EventsPreview() {
  return (
    <section className="surface-cream py-24 sm:py-32">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Calendar"
          title="What's coming up"
          description="Plan ahead — here's what's on the school calendar this term."
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
