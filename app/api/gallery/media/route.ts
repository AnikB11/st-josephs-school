import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  album_id: z.string().uuid(),
  items: z
    .array(
      z.object({
        cloudinary_url: z.string().url(),
        cloudinary_public_id: z.string().optional().nullable(),
        width: z.number().int().optional().nullable(),
        height: z.number().int().optional().nullable(),
        caption: z.string().max(500).optional().nullable(),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { album_id, items } = parsed.data;
  const supabase = createSupabaseAdminClient();

  // Determine next display_order
  const { data: existing } = await supabase
    .from("gallery_media")
    .select("display_order")
    .eq("album_id", album_id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const startOrder = ((existing as { display_order: number } | null)?.display_order ?? -1) + 1;

  const rows = items.map((it, i) => ({
    album_id,
    cloudinary_url: it.cloudinary_url,
    cloudinary_public_id: it.cloudinary_public_id ?? null,
    width: it.width ?? null,
    height: it.height ?? null,
    caption: it.caption ?? null,
    display_order: startOrder + i,
  }));

  const { data, error } = await supabase.from("gallery_media").insert(rows).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If this album doesn't have a cover yet, use the first uploaded image
  const { data: album } = await supabase
    .from("gallery_albums")
    .select("cover_url")
    .eq("id", album_id)
    .maybeSingle();
  if (!(album as { cover_url: string | null } | null)?.cover_url && rows[0]) {
    await supabase
      .from("gallery_albums")
      .update({ cover_url: rows[0].cloudinary_url })
      .eq("id", album_id);
  }

  return NextResponse.json({ media: data, added: rows.length }, { status: 201 });
}
