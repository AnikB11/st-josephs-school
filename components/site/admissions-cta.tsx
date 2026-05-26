import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

const BENEFITS = [
  "Holistic admissions — academic, character, and curiosity",
  "Pre-K through Class XII",
  "Need-based scholarships available",
];

// TODO: Replace with a real campus photo (1200w+).
const CTA_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80";

export function AdmissionsCta({ image }: { image?: string | null } = {}) {
  const src = image || CTA_IMAGE;
  return (
    <section className="container-wide py-24 sm:py-32">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[32px] bg-[hsl(var(--primary))] text-[hsl(var(--ivory))]">
          <div aria-hidden className="absolute inset-0 -z-10 opacity-25">
            <Image
              src={src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover slow-pan"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary))]/85 to-transparent" />
          </div>
          <div
            aria-hidden
            className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[hsl(var(--gold))]/25 blur-3xl"
          />

          <div className="relative grid gap-10 px-8 py-16 lg:grid-cols-2 lg:items-center lg:px-16 lg:py-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                <span className="gold-rule">Admissions 2026–27</span>
              </p>
              <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Begin a journey that
                <br />
                <span className="italic text-[hsl(var(--gold))]">lasts a lifetime.</span>
              </h2>
              <p className="mt-5 text-base text-white/75">
                Applications for the upcoming academic year are now open. The
                process is simple, transparent, and reviewed by our admissions
                committee within 10 working days.
              </p>
              <ul className="mt-7 space-y-2.5">
                {BENEFITS.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2.5 text-sm text-white/85"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--gold))]" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/admissions">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-[hsl(var(--ivory))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--primary))] hover:bg-[hsl(var(--ivory))]/90"
                  >
                    Start application <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/30 bg-transparent px-7 text-[14px] font-semibold tracking-wide text-white hover:bg-white/10"
                  >
                    Talk to admissions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
