import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlbumActions } from "@/components/admin/album-actions";
import { MediaUploader } from "@/components/admin/media-uploader";
import { MediaGrid, type MediaItem } from "@/components/admin/media-grid";
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

async function getAlbum(id: string): Promise<Album | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("id,title,slug,description,cover_url,event_date,is_published")
      .eq("id", id)
      .maybeSingle();
    return (data as Album | null) ?? null;
  } catch {
    return null;
  }
}

async function getMedia(albumId: string): Promise<MediaItem[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("gallery_media")
      .select("id,cloudinary_url,display_order,caption,width,height")
      .eq("album_id", albumId)
      .order("display_order", { ascending: true });
    return (data as MediaItem[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const media = await getMedia(id);

  return (
    <>
      <TopNav title={album.title} subtitle={`${media.length} photo${media.length === 1 ? "" : "s"}`} />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/gallery"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> All albums
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/gallery/${album.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View public
            </Link>
            <AlbumActions id={album.id} slug={album.slug} isPublished={album.is_published} />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-xl font-semibold text-slate-900">{album.title}</h1>
              <Badge variant={album.is_published ? "success" : "secondary"}>
                {album.is_published ? "Published" : "Hidden"}
              </Badge>
              {album.event_date && (
                <Badge variant="outline">{formatDate(album.event_date)}</Badge>
              )}
            </div>
            {album.description && (
              <p className="lead mt-3 max-w-3xl text-sm">{album.description}</p>
            )}
          </CardContent>
        </Card>

        <MediaUploader albumId={album.id} />

        <MediaGrid items={media} albumId={album.id} coverUrl={album.cover_url} />
      </div>
    </>
  );
}
