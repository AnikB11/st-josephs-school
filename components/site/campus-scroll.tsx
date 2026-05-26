import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// TODO: Replace with a hero campus photo (1600×900+) from the school's photography library.
const SHOWCASE_IMAGE =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2400&q=80";

export function CampusScroll({ image }: { image?: string | null } = {}) {
  const src = image || SHOWCASE_IMAGE;
  return (
    <section className="surface-ivory">
      <ContainerScroll
        titleComponent={
          <div className="px-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--primary))]">
              <span className="gold-rule">A campus that teaches</span>
            </p>
            <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[hsl(var(--ink))] sm:text-5xl md:text-7xl">
              Where students grow
              <br />
              <span className="italic text-[hsl(var(--primary))]">in body, mind, and heart.</span>
            </h2>
          </div>
        }
      >
        <Image
          src={src}
          alt="St. Joseph's campus"
          width={1400}
          height={720}
          className="mx-auto h-full rounded-2xl object-cover object-center"
          draggable={false}
        />
      </ContainerScroll>
    </section>
  );
}
