import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type Album = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  event_date: string | null;
};

type Media = {
  id: string;
  cloudinary_url: string;
  caption: string | null;
  width: number | null;
  height: number | null;
};

async function getAlbum(slug: string): Promise<Album | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("id,title,slug,description,cover_url,event_date")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as Album | null) ?? null;
  } catch {
    return null;
  }
}

async function getMedia(albumId: string): Promise<Media[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("gallery_media")
      .select("id,cloudinary_url,caption,width,height")
      .eq("album_id", albumId)
      .order("display_order", { ascending: true });
    return (data as Media[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return { title: "Album" };
  return {
    title: album.title,
    description: album.description ?? `Photos from ${album.title}.`,
    openGraph: album.cover_url ? { images: [album.cover_url] } : undefined,
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  const media = await getMedia(album.id);

  return (
    <section className="container-wide py-16 sm:py-24">
      <Link
        href="/gallery"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> All albums
      </Link>

      <header className="mt-6">
        <h1 className="heading text-balance text-3xl font-semibold sm:text-4xl">{album.title}</h1>
        {(album.event_date || album.description) && (
          <p className="lead mt-3 max-w-2xl text-base">
            {album.event_date && (
              <span className="text-slate-500">{formatDate(album.event_date)}</span>
            )}
            {album.event_date && album.description && " · "}
            {album.description}
          </p>
        )}
      </header>

      {media.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          No photos in this album yet.
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {media.map((m) => {
            const ratio =
              m.width && m.height && m.width > 0 ? m.height / m.width : 0.75;
            return (
              <figure
                key={m.id}
                className="overflow-hidden rounded-2xl bg-slate-100"
                style={{ aspectRatio: `${1} / ${ratio || 0.75}` }}
              >
                <Image
                  src={m.cloudinary_url}
                  alt={m.caption ?? album.title}
                  width={m.width ?? 800}
                  height={m.height ?? 600}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
                {m.caption && (
                  <figcaption className="bg-white px-3 py-2 text-xs text-slate-600">
                    {m.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
