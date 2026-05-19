import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const RETENTION_DAYS_AFTER_ARCHIVE = 60;

/**
 * Runs daily via Vercel Cron (see vercel.json).
 *  1. archives notices whose expires_at has passed
 *  2. deletes notices archived more than RETENTION_DAYS_AFTER_ARCHIVE days ago
 */
export async function GET(req: Request) {
  const header = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || header !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() - RETENTION_DAYS_AFTER_ARCHIVE * 86400000).toISOString();

  const { data: archived, error: archiveErr } = await supabase
    .from("notices")
    .update({ archived_at: now.toISOString() })
    .is("archived_at", null)
    .lt("expires_at", now.toISOString())
    .select("id");

  if (archiveErr) {
    return NextResponse.json({ error: archiveErr.message }, { status: 500 });
  }

  const { data: deleted, error: deleteErr } = await supabase
    .from("notices")
    .delete()
    .lt("archived_at", cutoff)
    .select("id");

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    archived: archived?.length ?? 0,
    deleted: deleted?.length ?? 0,
  });
}
