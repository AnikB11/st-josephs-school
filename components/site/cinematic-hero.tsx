import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

/**
 * Cinematic full-bleed hero used at the top of major institutional pages.
 * Server component — entrance is CSS-only.
 */
export function CinematicHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  breadcrumb = [],
  height = "tall",
  align = "left",
  className,
  cta,
}: {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  image: string;
  imageAlt?: string;
  breadcrumb?: Crumb[];
  height?: "tall" | "short";
  align?: "left" | "center";
  className?: string;
  cta?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative isolate w-full overflow-hidden text-white",
        height === "tall" ? "min-h-[68svh] lg:min-h-[78svh]" : "min-h-[44svh]",
        className,
      )}
    >
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover slow-pan"
        />
      </div>
      {/* Dark cinematic wash */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--ink))]/35 via-[hsl(var(--ink))]/55 to-[hsl(var(--ink))]/85"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[hsl(var(--ivory))] to-transparent"
      />

      <div
        className={cn(
          "container-wide relative flex h-full flex-col justify-end pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24",
          align === "center" && "items-center text-center",
        )}
        style={{ minHeight: "inherit" }}
      >
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="hero-entrance hero-entrance-d1 mb-6 flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-white/70"
          >
            {breadcrumb.map((c, i) => {
              const last = i === breadcrumb.length - 1;
              return (
                <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  {c.href && !last ? (
                    <Link href={c.href} className="nav-underline hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span className={cn(last && "text-white")}>{c.label}</span>
                  )}
                  {!last && <ChevronRight className="h-3 w-3 text-white/40" />}
                </span>
              );
            })}
          </nav>
        )}

        {eyebrow && (
          <p className="hero-entrance hero-entrance-d1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--gold))]">
            <span className="gold-rule">{eyebrow}</span>
          </p>
        )}

        <h1 className="hero-entrance hero-entrance-d2 mt-4 max-w-4xl text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[80px]">
          {title}
        </h1>

        {description && (
          <p className="hero-entrance hero-entrance-d3 mt-6 max-w-2xl font-sans text-base leading-relaxed text-white/80 sm:text-lg">
            {description}
          </p>
        )}

        {cta && (
          <div className="hero-entrance hero-entrance-d3 mt-8 flex flex-wrap items-center gap-3">
            {cta}
          </div>
        )}
      </div>
    </section>
  );
}
