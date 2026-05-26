import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import { PageHero } from "@/components/motion/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import { formatDate } from "@/lib/utils";
import type { GalleryAlbum } from "@/types/database";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from the school year — events, classrooms, sports, and arts.",
};

export const revalidate = 60;

async function fetchAlbums(): Promise<GalleryAlbum[]> {
  try {
    const supabase = createSupabaseStaticClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("id,title,slug,cover_url,event_date,created_at")
      .eq("is_published", true)
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(48);
    return (data as GalleryAlbum[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const albums = await fetchAlbums();
  const cms = await getCmsSections(["gallery_intro", "gallery_hero_image"]);
  const HERO_IMG = resolveImage("gallery_hero_image", cms.gallery_hero_image);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={cms.gallery_intro.title ?? "A year in pictures."}
        description={
          cms.gallery_intro.body ??
          "Albums from every term — events, milestones, and the small moments."
        }
        image={HERO_IMG}
      />

      <section className="container-wide py-24 sm:py-32">
        {albums.length === 0 ? (
          <Reveal>
            <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-16 text-center">
              <Images className="mx-auto h-10 w-10 text-[hsl(var(--ink-soft))]/40" />
              <p className="mt-5 text-sm text-[hsl(var(--ink-soft))]">
                No albums published yet. Check back soon.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a, i) => (
              <Reveal key={a.id} delay={(i % 6) * 0.05}>
                <Link href={`/gallery/${a.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[hsl(var(--sand))]">
                    {a.cover_url ? (
                      <Image
                        src={a.cover_url}
                        alt={a.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[hsl(var(--ink-soft))]/40">
                        <Images className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <h3 className="font-display text-xl font-semibold">{a.title}</h3>
                      {a.event_date && (
                        <p className="text-xs opacity-85">{formatDate(a.event_date)}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
