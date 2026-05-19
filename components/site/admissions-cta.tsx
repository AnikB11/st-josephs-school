import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  "Holistic admissions — academic, character, and curiosity",
  "Pre-K through Class XII",
  "Need-based scholarships available",
];

export function AdmissionsCta() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-white sm:px-16">
        <div className="absolute inset-0 -z-0 bg-grid opacity-10" aria-hidden />
        <div
          className="absolute -right-32 -top-32 -z-0 h-80 w-80 rounded-full bg-primary/30 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white/80">
            Admissions 2026–27
          </span>
          <h2 className="font-display mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Begin a journey that lasts a lifetime.
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Applications for the upcoming academic year are now open. The
            process is simple, transparent, and reviewed by our admissions
            committee within 10 working days.
          </p>
          <ul className="mt-6 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4 text-emerald" /> {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admissions">
              <Button size="lg" variant="default" className="bg-white text-slate-900 hover:bg-white/90">
                Start application <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                Talk to admissions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
