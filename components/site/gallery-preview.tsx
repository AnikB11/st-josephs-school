import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

// TODO: Swap with real campus photography as it becomes available.
const PLACEHOLDER = [
  { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=70",  alt: "Classroom" },
  { src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=600&q=70",  alt: "Science fair" },
  { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=70",  alt: "Sports day" },
  { src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=70",  alt: "Library" },
  { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=70",  alt: "Art class" },
];

export function GalleryPreview({ images }: { images?: (string | null)[] } = {}) {
  const slides = PLACEHOLDER.map((p, i) => ({
    src: images?.[i] || p.src,
    alt: p.alt,
  }));
  return (
    <section className="container-wide py-24 sm:py-32">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Campus life"
          title="Moments from this year"
          description="A peek into classrooms, fields, festivals, and the quiet corners between."
        />
        <Link href="/gallery">
          <Button
            variant="outline"
            className="h-10 rounded-full border-[hsl(var(--primary))]/20 px-6 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
          >
            Open gallery <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-14 columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
        {slides.map((img, i) => (
          <Reveal key={i} delay={i * 0.06} className="block break-inside-avoid">
            <div
              className="group relative w-full overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--sand))] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.3)]"
              style={{ aspectRatio: i === 0 ? "4/3" : i % 2 === 0 ? "3/4" : "1/1" }}
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[hsl(var(--ink))]/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute bottom-5 left-5 z-20 translate-y-2 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="rounded-full bg-white/20 border border-white/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  {img.alt}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
