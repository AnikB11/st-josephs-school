import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { GallerySlider } from "@/components/site/gallery-slider";

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

      <GallerySlider slides={slides} />
    </section>
  );
}
