import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCHOOL } from "@/lib/constants";

// Backdrop image — Unsplash by default, override with env for school photography.
// TODO: replace with a real campus photo (1600w+) and update via NEXT_PUBLIC_HERO_IMAGE.
const HERO_IMAGE =
  process.env.NEXT_PUBLIC_HERO_IMAGE ??
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2400&q=80";

const HERO_VIDEO_WEBM = process.env.NEXT_PUBLIC_HERO_VIDEO_WEBM ?? "";
const HERO_VIDEO_MP4 = process.env.NEXT_PUBLIC_HERO_VIDEO_MP4 ?? "";
const HAS_VIDEO = Boolean(HERO_VIDEO_WEBM || HERO_VIDEO_MP4);

export function Hero({
  headline,
  subhead,
  image,
}: {
  headline?: string | null;
  subhead?: string | null;
  image?: string | null;
}) {
  const heroSrc = image || HERO_IMAGE;
  return (
    <section
      className="relative isolate flex w-full flex-col overflow-hidden surface-ivory"
      style={{ minHeight: "min(92svh, 880px)" }}
    >
      {/* Backdrop image — gently animated */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover slow-pan"
        />
        {HAS_VIDEO && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
          >
            {HERO_VIDEO_WEBM && <source src={HERO_VIDEO_WEBM} type="video/webm" />}
            {HERO_VIDEO_MP4 && <source src={HERO_VIDEO_MP4} type="video/mp4" />}
          </video>
        )}
      </div>

      {/* Ivory wash — keeps it bright & premium */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--ivory))]/80 via-[hsl(var(--ivory))]/70 to-[hsl(var(--ivory))]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,transparent_30%,hsl(var(--ivory))_85%)]"
      />

      <div className="container-wide relative z-10 flex flex-1 flex-col items-center justify-center pt-32 pb-16 text-center sm:pt-36">
        <div className="hero-entrance hero-entrance-d1 inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--primary))]/15 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--primary))] shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
          Admissions open for 2026–27
        </div>

        <h1 className="hero-entrance hero-entrance-d2 font-display mt-7 max-w-5xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-[hsl(var(--ink))] sm:text-6xl lg:text-[80px]">
          {headline ? (
            headline
          ) : (
            <>
              An education for the
              <br />
              <span className="italic text-[hsl(var(--primary))]">curious, the kind</span>
              {", and the brave."}
            </>
          )}
        </h1>

        <p className="hero-entrance hero-entrance-d3 mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[hsl(var(--ink-soft))] sm:text-xl">
          {subhead ??
            `${SCHOOL.name} has nurtured generations of thoughtful, capable young people since ${SCHOOL.founded} — blending classical rigor with modern ideas.`}
        </p>

        <div className="hero-entrance hero-entrance-d4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/admissions">
            <Button
              size="lg"
              className="group h-12 rounded-full bg-[hsl(var(--primary))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--ivory))] shadow-md transition-all hover:bg-[hsl(var(--primary))]/90 hover:shadow-lg"
            >
              Begin your application
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/about">
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-[hsl(var(--primary))]/20 bg-white/60 px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--ink))] backdrop-blur hover:bg-white"
            >
              Discover the school
            </Button>
          </Link>
        </div>

        {/* Tagline — small inline meta */}
        <p className="hero-entrance hero-entrance-d5 mt-12 text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(var(--ink-soft))]/70">
          {SCHOOL.tagline}
        </p>
      </div>

      {/* Scroll indicator — wrapper uses justify-center (no -translate-x-1/2)
          and the bouncing element is a block <div> so its translate3d
          animation doesn't stack with a parent transform on half-pixel
          positions (the prior subpixel jitter source). */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center text-[hsl(var(--ink-soft))]/60"
        aria-hidden
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">Scroll</span>
          <div className="scroll-bounce">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
