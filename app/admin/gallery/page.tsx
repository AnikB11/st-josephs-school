import Link from "next/link";
import Image from "next/image";
import { Images } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Badge } from "@/components/ui/badge";
import { NewAlbumDialog } from "@/components/admin/new-album-dialog";
import { AlbumActions } from "@/components/admin/album-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Album = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  event_date: string | null;
  is_published: boolean;
};

async function getAlbums(): Promise<(Album & { photo_count: number })[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: albums } = await supabase
      .from("gallery_albums")
      .select("id,title,slug,description,cover_url,event_date,is_published")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    const list = (albums as Album[] | null) ?? [];
    if (list.length === 0) return [];

    const { data: counts } = await supabase
      .from("gallery_media")
      .select("album_id")
      .in(
        "album_id",
        list.map((a) => a.id),
      );

    const map: Record<string, number> = {};
    ((counts as { album_id: string }[] | null) ?? []).forEach((r) => {
      map[r.album_id] = (map[r.album_id] ?? 0) + 1;
    });
    return list.map((a) => ({ ...a, photo_count: map[a.id] ?? 0 }));
  } catch {
    return [];
  }
}

export default async function GalleryAdminPage() {
  const albums = await getAlbums();

  return (
    <>
      <TopNav title="Gallery" subtitle="Albums and media on the public site" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Uploads go to Cloudinary — auto-compressed, served as WebP, lazy-loaded on the public site.
          </p>
          <NewAlbumDialog />
        </div>

        {albums.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Images className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-4 text-sm text-slate-600">
              No albums yet. Click <span className="font-medium text-slate-900">New album</span> to create one.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => (
              <article
                key={a.id}
                className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition-shadow hover:shadow-md"
              >
                <Link href={`/admin/gallery/${a.id}`} className="block">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200">
                    {a.cover_url ? (
                      <Image
                        src={a.cover_url}
                        alt={a.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-slate-300">
                        <Images className="h-10 w-10" />
                      </div>
                    )}
                    {!a.is_published && (
                      <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                        Unpublished
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-start justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <Link href={`/admin/gallery/${a.id}`} className="hover:text-primary">
                      <h3 className="font-display truncate text-base font-semibold text-slate-900">
                        {a.title}
                      </h3>
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="secondary">
                        {a.photo_count} photo{a.photo_count === 1 ? "" : "s"}
                      </Badge>
                      {a.event_date && (
                        <span className="text-slate-500">{formatDate(a.event_date)}</span>
                      )}
                    </div>
                  </div>
                  <AlbumActions id={a.id} slug={a.slug} isPublished={a.is_published} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
