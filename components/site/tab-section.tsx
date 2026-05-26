import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Two-column tab content layout: text on one side, media on the other.
 * Server component, no animation libraries.
 */
export function TabSplit({
  eyebrow,
  title,
  children,
  image,
  imageAlt = "",
  reverse = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  image?: string;
  imageAlt?: string;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("container-wide py-20 sm:py-24 lg:py-28", className)}>
      <div
        className={cn(
          "grid items-center gap-12 lg:grid-cols-12",
          reverse && "lg:[&>div:first-child]:order-2",
        )}
      >
        <div className="lg:col-span-6">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
              <span className="gold-rule">{eyebrow}</span>
            </p>
          )}
          <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <div className="prose mt-6 max-w-none text-[hsl(var(--ink-soft))]">
            {children}
          </div>
        </div>
        {image && (
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
