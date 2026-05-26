import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notices")
    .select(
      "id,slug,title,category,audience,pdf_url,published_at,expires_at,is_pinned,archived_at",
    )
    .is("archived_at", null)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) { console.error("app/api/notices/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ notices: data });
}

const schema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().max(10000).optional().nullable(),
  category: z.enum(["general", "academic", "event", "urgent", "holiday"]).default("general"),
  audience: z.enum(["all", "parents", "students", "alumni", "staff"]).default("all"),
  pdf_url: z.string().url().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  is_pinned: z.boolean().default(false),
});

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = slugify(parsed.data.title) + "-" + Date.now().toString(36);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .insert({
      ...parsed.data,
      slug,
      created_by: user.dbUser?.id ?? null,
    })
    .select()
    .single();

  if (error) { console.error("app/api/notices/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ notice: data }, { status: 201 });
}
