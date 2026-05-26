import { cn } from "@/lib/utils";

/**
 * Compact, consistent hero band used on every interior page.
 * Server component — animation comes purely from CSS hero-entrance.
 * Sits on solid ivory; imagery lives inline further down each page.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  variant = "ivory",
}: {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  /** Accepted for backwards-compat; the hero no longer renders a backdrop. */
  image?: string;
  imageAlt?: string;
  align?: "center" | "left";
  className?: string;
  variant?: "ivory" | "navy" | "paper";
}) {
  const surface =
    variant === "navy"
      ? "bg-[hsl(var(--primary))] text-white"
      : variant === "paper"
      ? "surface-paper"
      : "surface-ivory";

  return (
    <section
      className={cn(
        "relative isolate border-b border-[hsl(var(--border))]/70",
        surface,
        className,
      )}
    >
      <div
        className={cn(
          "container-wide relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24",
          align === "center" && "text-center",
        )}
      >
        {eyebrow && (
          <p
            className={cn(
              "hero-entrance hero-entrance-d1 text-[11px] font-semibold uppercase tracking-[0.22em]",
              variant === "navy" ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--primary))]",
            )}
          >
            <span className="gold-rule">{eyebrow}</span>
          </p>
        )}
        <h1
          className={cn(
            "hero-entrance hero-entrance-d2 mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[64px]",
            variant === "navy" ? "text-white" : "text-[hsl(var(--ink))]",
            align === "center" && "mx-auto",
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "hero-entrance hero-entrance-d3 mt-6 max-w-2xl font-sans text-base leading-relaxed sm:text-lg",
              variant === "navy" ? "text-white/80" : "text-[hsl(var(--ink-soft))]",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
