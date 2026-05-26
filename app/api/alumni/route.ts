import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const supabase = createSupabaseAdminClient();
  let query = supabase.from("alumni").select("*").order("graduation_year", { ascending: false });
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,current_company.ilike.%${q}%,current_position.ilike.%${q}%`);
  }
  const { data, error } = await query.limit(200);

  if (error) { console.error("app/api/alumni/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ alumni: data });
}

const createSchema = z.object({
  full_name: z.string().min(2).max(150),
  graduation_year: z.number().int().min(1900).max(3000),
  current_position: z.string().max(150).optional().nullable(),
  current_company: z.string().max(150).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  linkedin_url: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  is_public: z.boolean().default(true),
  user_id: z.string().uuid().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("alumni").insert(parsed.data).select().single();

  if (error) { console.error("app/api/alumni/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "alumni.create",
    entity_type: "alumni",
    entity_id: (data as { id: string }).id,
  });

  return NextResponse.json({ alumnus: data }, { status: 201 });
}
