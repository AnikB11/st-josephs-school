import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";

type Stat =
  | { value: number; suffix?: string; label: string; hint: string }
  | { display: string; label: string; hint: string };

const STATS: Stat[] = [
  { value: 1996, label: "Established", hint: "Under the Diocese of Darjeeling–Sikkim" },
  { display: "Nursery–XII", label: "Classes offered", hint: "Co-educational, Science at senior level" },
  { display: "CISCE", label: "Affiliation", hint: "Council for the ICSE, New Delhi" },
  { value: 1030, suffix: " m", label: "Altitude", hint: "Above mean sea level at Rhenock" },
];

export function Stats() {
  return (
    <section className="relative border-y border-[hsl(var(--border))] surface-cream">
      <div className="container-wide py-20">
        <div className="grid grid-cols-2 gap-10 sm:gap-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="flex flex-col">
              <p className="font-display text-5xl font-semibold text-[hsl(var(--ink))] tabular-nums sm:text-6xl">
                {"value" in s ? (
                  <CountUp to={s.value} suffix={s.suffix ?? ""} duration={1.4} />
                ) : (
                  <span>{s.display}</span>
                )}
              </p>
              <span className="mt-3 h-px w-8 bg-[hsl(var(--gold))]" />
              <p className="mt-3 font-display text-sm font-semibold tracking-wide text-[hsl(var(--ink))]">
                {s.label}
              </p>
              <p className="mt-1 font-sans text-xs text-[hsl(var(--ink-soft))]">
                {s.hint}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
