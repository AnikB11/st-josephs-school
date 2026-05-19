import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";

const PLACEHOLDER = [
  { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=70", alt: "Classroom", span: "lg:col-span-2 lg:row-span-2" },
  { src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=600&q=70", alt: "Science fair" },
  { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=70", alt: "Sports day" },
  { src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=70", alt: "Library" },
  { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=70", alt: "Art class" },
];

export function GalleryPreview() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Campus life"
          title="Moments from this year"
          description="A peek into classrooms, fields, festivals, and the quiet corners between."
        />
        <Link href="/gallery">
          <Button variant="outline" size="sm">
            Open gallery <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] lg:grid-cols-4 lg:auto-rows-[220px]">
        {PLACEHOLDER.map((img, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl bg-slate-100 ${img.span ?? ""}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
