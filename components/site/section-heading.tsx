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
        <span className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="heading mt-4 text-balance text-3xl font-semibold sm:text-4xl">
        {title}
      </h2>
      {description && <p className="lead mt-3 text-base">{description}</p>}
    </div>
  );
}
