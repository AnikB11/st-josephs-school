import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCHOOL } from "@/lib/constants";
import { heroVideoUrl, isVideoUrl } from "@/lib/cms-images";
import { cn } from "@/lib/utils";

// Backdrop image — Unsplash by default, override with env for school photography.
// TODO: replace with a real campus photo (1600w+) and update via NEXT_PUBLIC_HERO_IMAGE.
const HERO_IMAGE =
  process.env.NEXT_PUBLIC_HERO_IMAGE ??
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2400&q=80";

export function Hero({
  headline,
  subhead,
  image,
}: {
  headline?: string | null;
  subhead?: string | null;
  /**
   * CMS-controlled background URL. Detected as video vs image by
   * `isVideoUrl(...)` — videos render as a muted autoplay loop, images as a
   * `next/image` with the `slow-pan` zoom. Drives the `home_hero_image`
   * slot in /admin/cms.
   *
   * Style note: the two backdrops need *different* overlay treatments. A
   * still photo can sit behind a heavy ivory wash (the original premium
   * editorial feel). A motion clip can't — the wash kills its detail. So
   * when video is detected we invert the whole hero into a dark cinematic
   * mode (subtle ink gradient, white type) and only switch the overlay +
   * type colors. Layout stays identical.
   */
  image?: string | null;
}) {
  const heroSrc = image || HERO_IMAGE;
  const isVideo = isVideoUrl(heroSrc);
  const videoSrc = isVideo ? heroVideoUrl(heroSrc) : null;

  return (
    <section
      className="relative isolate flex w-full flex-col overflow-hidden surface-ivory"
      style={{ minHeight: "min(92svh, 880px)" }}
    >
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-0 -z-20">
        {isVideo && videoSrc ? (
          // No `slow-pan` — the video already has motion; stacking a CSS
          // zoom on top reads as glitchy. `playsInline` keeps iOS Safari
          // from fullscreening the clip on load.
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={heroSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover slow-pan"
          />
        )}
      </div>

      {/* Wash — light for image, cinematic dark for video */}
      {isVideo ? (
        <>
          {/* Soft ink gradient. Top is darker (where the eyebrow / pill
              sits), middle is the lightest so the video punches through,
              bottom darkens again to ground the CTA row. Numbers tuned so
              text stays AAA-readable on top of a wide range of content. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--ink))]/55 via-[hsl(var(--ink))]/30 to-[hsl(var(--ink))]/70"
          />
          {/* A subtle vignette pulls the eye to the center copy without
              actually darkening the video itself. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,hsl(var(--ink))/0.4_100%)]"
          />
          {/* Hand off into the ivory section below — keeps the page-flow
              feel rather than a hard cut. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[hsl(var(--ivory))] to-transparent"
          />
        </>
      ) : (
        <>
          {/* Original ivory wash for the still-image hero */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--ivory))]/80 via-[hsl(var(--ivory))]/70 to-[hsl(var(--ivory))]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,transparent_30%,hsl(var(--ivory))_85%)]"
          />
        </>
      )}

      <div className="container-wide relative z-10 flex flex-1 flex-col items-center justify-center pt-32 pb-16 text-center sm:pt-36">
        <div
          className={cn(
            "hero-entrance hero-entrance-d1 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm backdrop-blur-sm",
            isVideo
              ? "border-white/25 bg-white/10 text-white"
              : "border-[hsl(var(--primary))]/15 bg-white/70 text-[hsl(var(--primary))]",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
          Admissions open for 2026–27
        </div>

        <h1
          className={cn(
            "hero-entrance hero-entrance-d2 font-display mt-7 max-w-5xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[80px]",
            isVideo ? "text-white" : "text-[hsl(var(--ink))]",
          )}
        >
          {headline ? (
            headline
          ) : (
            <>
              An education for the
              <br />
              <span
                className={cn(
                  "italic",
                  isVideo ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--primary))]",
                )}
              >
                curious, the kind
              </span>
              {", and the brave."}
            </>
          )}
        </h1>

        <p
          className={cn(
            "hero-entrance hero-entrance-d3 mt-6 max-w-2xl font-sans text-lg leading-relaxed sm:text-xl",
            isVideo ? "text-white/85" : "text-[hsl(var(--ink-soft))]",
          )}
        >
          {subhead ??
            `${SCHOOL.name} has nurtured generations of thoughtful, capable young people since ${SCHOOL.founded} — blending classical rigor with modern ideas.`}
        </p>

        <div className="hero-entrance hero-entrance-d4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/admissions">
            <Button
              size="lg"
              className={cn(
                "group h-12 rounded-full px-7 text-[14px] font-semibold tracking-wide shadow-md transition-all hover:shadow-lg",
                isVideo
                  ? // Gold-on-ink reads beautifully against video and matches the eyebrow chip.
                    "bg-[hsl(var(--ivory))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--ivory))]/90"
                  : "bg-[hsl(var(--primary))] text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90",
              )}
            >
              Begin your application
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/about">
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "h-12 rounded-full px-7 text-[14px] font-semibold tracking-wide backdrop-blur",
                isVideo
                  ? "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  : "border-[hsl(var(--primary))]/20 bg-white/60 text-[hsl(var(--ink))] hover:bg-white",
              )}
            >
              Discover the school
            </Button>
          </Link>
        </div>

        {/* Tagline — small inline meta */}
        <p
          className={cn(
            "hero-entrance hero-entrance-d5 mt-12 text-[11px] font-semibold uppercase tracking-[0.32em]",
            isVideo ? "text-white/60" : "text-[hsl(var(--ink-soft))]/70",
          )}
        >
          {SCHOOL.tagline}
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center",
          isVideo ? "text-white/60" : "text-[hsl(var(--ink-soft))]/60",
        )}
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
