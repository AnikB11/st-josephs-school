import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { formatDate } from "@/lib/utils";

const EVENTS = [
  {
    title: "Annual Sports Day",
    date: "2026-06-08T09:00:00Z",
    location: "Main Field",
    color: "from-emerald/15 to-emerald/5",
  },
  {
    title: "Inter-school Science Fair",
    date: "2026-06-22T10:00:00Z",
    location: "Auditorium",
    color: "from-primary/15 to-primary/5",
  },
  {
    title: "Founder's Day",
    date: "2026-07-04T16:30:00Z",
    location: "Chapel & Lawn",
    color: "from-amber-200/40 to-amber-100/20",
  },
];

export function EventsPreview() {
  return (
    <section className="bg-slate-50/50 py-20 sm:py-28">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Calendar"
          title="What's coming up"
          description="Plan ahead — here's what's on the school calendar this term."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {EVENTS.map((e) => {
            const d = new Date(e.date);
            return (
              <Link
                key={e.title}
                href="/notices"
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br ${e.color} bg-white p-6 transition-all hover:border-primary/30 hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                    <div className="text-center leading-tight">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        {d.toLocaleString("en-US", { month: "short" })}
                      </p>
                      <p className="font-display text-xl font-semibold text-slate-900">
                        {d.getDate()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {e.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(d, { weekday: "short", day: "2-digit", month: "short" })}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3 w-3" /> {e.location}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
