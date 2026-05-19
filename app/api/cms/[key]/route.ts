import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  body: z.string().max(20000).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
});

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ key: string }> },
) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await ctx.params;
  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("website_content")
    .upsert(
      {
        section_key: key,
        ...parsed.data,
        updated_by: user.dbUser?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "section_key" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "cms.update",
    entity_type: "website_content",
    metadata: { section_key: key },
  });

  return NextResponse.json({ content: data });
}
