import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";

// TODO: Replace with a real photo of the Principal.
const PRINCIPAL_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80";

export function PrincipalMessage({
  title,
  body,
  image,
}: {
  title?: string | null;
  body?: string | null;
  image?: string | null;
}) {
  const src = image || PRINCIPAL_IMAGE;
  return (
    <section className="container-wide py-24 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <Reveal variant="left" className="lg:col-span-7">
          <figure className="relative">
            <div className="relative aspect-[5/6] overflow-hidden rounded-[28px] bg-[hsl(var(--sand))]">
              <Image
                src={src}
                alt="Principal portrait"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* Pull quote overlay */}
            <div className="absolute -bottom-6 -right-6 hidden max-w-sm rounded-2xl bg-[hsl(var(--ivory))] p-6 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.25)] ring-1 ring-[hsl(var(--border))] sm:block">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-6 w-6 text-[hsl(var(--gold))]"
                fill="currentColor"
              >
                <path d="M9.17 6C7.4 6 6 7.4 6 9.17v8.83h6V12H8.5c0-1.93 1.57-3.5 3.5-3.5V6H9.17Zm9 0c-1.77 0-3.17 1.4-3.17 3.17v8.83h6V12h-3.5c0-1.93 1.57-3.5 3.5-3.5V6h-2.83Z" />
              </svg>
              <blockquote className="font-display mt-2 text-lg italic leading-snug text-[hsl(var(--ink))]">
                We don&apos;t just teach subjects — we shape the people who study them.
              </blockquote>
            </div>
          </figure>
        </Reveal>

        <Reveal variant="right" className="lg:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">From the Principal</span>
          </p>
          <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-[hsl(var(--ink))] sm:text-5xl">
            {title ?? "An education that lights a fire."}
          </h2>
          <p className="lead mt-5 text-base sm:text-lg">
            {body ??
              "Education is not the filling of a pail but the lighting of a fire. At St. Joseph's, we strive every day to ignite curiosity, build character, and prepare students for the world ahead — academically, ethically, and personally."}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--primary))] font-display text-sm font-semibold text-[hsl(var(--ivory))]">
              MR
            </div>
            <div>
              <p className="font-display text-[15px] font-semibold text-[hsl(var(--ink))]">
                Mrs. Margaret Rosario
              </p>
              <p className="text-xs text-[hsl(var(--ink-soft))]">
                Principal · serving since 2014
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
