import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { GalleryAlbum } from "@/types/database";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from the school year — events, classrooms, sports, and arts.",
};

async function fetchAlbums(): Promise<GalleryAlbum[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("*")
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

  return (
    <section className="container-wide py-20 sm:py-28">
      <SectionHeading
        eyebrow="Gallery"
        title="A year in pictures."
        description="Albums from every term — events, milestones, and the small moments."
      />

      {albums.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Images className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-4 text-sm text-slate-600">No albums published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link key={a.id} href={`/gallery/${a.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100">
                {a.cover_url ? (
                  <Image
                    src={a.cover_url}
                    alt={a.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-slate-300">
                    <Images className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                  {a.event_date && <p className="text-xs opacity-80">{formatDate(a.event_date)}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
