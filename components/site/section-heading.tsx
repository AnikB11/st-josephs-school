import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
          <span className="gold-rule">{eyebrow}</span>
        </p>
      )}
      <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && <p className="lead mt-4 text-base sm:text-lg">{description}</p>}
    </div>
  );
}
