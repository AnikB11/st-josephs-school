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
  let query = supabase
    .from("parents")
    .select("id,full_name,email,phone")
    .order("full_name", { ascending: true })
    .limit(50);
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  const { data, error } = await query;

  if (error) { console.error("app/api/parents/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ parents: data });
}

const createSchema = z.object({
  full_name: z.string().min(2).max(150),
  email: z.string().email().optional().or(z.literal("")).transform((v) => v || undefined),
  phone: z.string().max(30).optional(),
  occupation: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
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
  const { data, error } = await supabase.from("parents").insert(parsed.data).select().single();

  if (error) { console.error("app/api/parents/route.ts", error); return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
  return NextResponse.json({ parent: data }, { status: 201 });
}
