import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health        → liveness (process is up)
 * GET /api/health?deep=1 → readiness (also pings Supabase)
 *
 * Uptime monitors should hit the shallow variant to avoid DB load; deploy
 * smoke tests and status pages can use ?deep=1.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deep = searchParams.get("deep") === "1";
  const started = Date.now();

  const payload: {
    status: "ok" | "degraded";
    ts: string;
    uptime_s: number;
    deps?: { db: { ok: boolean; latency_ms?: number; error?: string } };
  } = {
    status: "ok",
    ts: new Date().toISOString(),
    uptime_s: Math.round(process.uptime()),
  };

  if (!deep) return NextResponse.json(payload);

  const t0 = Date.now();
  try {
    const supabase = createSupabaseAdminClient();
    // Cheapest possible round-trip: count a table limited to 1.
    const { error } = await supabase
      .from("academic_years")
      .select("id", { count: "exact", head: true })
      .limit(1);
    if (error) throw error;
    payload.deps = { db: { ok: true, latency_ms: Date.now() - t0 } };
  } catch (err) {
    payload.status = "degraded";
    payload.deps = {
      db: {
        ok: false,
        latency_ms: Date.now() - t0,
        error: err instanceof Error ? err.message : "unknown",
      },
    };
    return NextResponse.json(payload, { status: 503 });
  }

  // Keep response time visible on the wire for monitoring.
  return NextResponse.json({ ...payload, elapsed_ms: Date.now() - started });
}
