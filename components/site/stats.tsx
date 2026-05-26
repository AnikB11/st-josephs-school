import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";

const STATS = [
  { value: 800, suffix: "+", label: "Students", hint: "Pre-K through Grade XII" },
  { value: 60,  suffix: "+", label: "Years", hint: "Of community trust" },
  { value: 32,  suffix: ":1", label: "Class size", hint: "Personal attention" },
  { value: 98,  suffix: "%", label: "Pass rate", hint: "Class XII 2026" },
] as const;

export function Stats() {
  return (
    <section className="relative border-y border-[hsl(var(--border))] surface-cream">
      <div className="container-wide py-20">
        <div className="grid grid-cols-2 gap-10 sm:gap-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="flex flex-col">
              <p className="font-display text-5xl font-semibold text-[hsl(var(--ink))] tabular-nums sm:text-6xl">
                <CountUp to={s.value} suffix={s.suffix} duration={1.4} />
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
