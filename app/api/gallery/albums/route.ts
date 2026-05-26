import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) { console.error("app/api/gallery/albums/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ albums: data });
}

const createSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
  is_published: z.boolean().default(true),
});

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = slugify(parsed.data.title) + "-" + Date.now().toString(36);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gallery_albums")
    .insert({ ...parsed.data, slug })
    .select()
    .single();

  if (error) { console.error("app/api/gallery/albums/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ album: data }, { status: 201 });
}
