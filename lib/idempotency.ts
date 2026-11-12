import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { log, requestIdFrom } from "@/lib/log";

const HEADER = "idempotency-key";
const DEFAULT_TTL_HOURS = 24;

type StoredResponse = {
  status_code: number;
  body: unknown;
  expires_at: string;
};

export class IdempotencyKeyMissing extends Error {
  constructor() {
    super("Idempotency-Key header required");
  }
}

/**
 * Wraps a POST handler with Supabase-backed replay protection.
 * The first request for a key stores (status, body); any later request
 * with the same key returns the stored response verbatim.
 *
 * The key is namespaced by route so the same client-generated UUID
 * can be reused across different endpoints without collision.
 */
export async function withIdempotency(
  req: Request,
  route: string,
  handler: () => Promise<{ status: number; body: unknown }>,
  opts: { required?: boolean; ttlHours?: number } = {},
): Promise<NextResponse> {
  const required = opts.required ?? false;
  const ttlHours = opts.ttlHours ?? DEFAULT_TTL_HOURS;
  const requestId = requestIdFrom(req);
  const rawKey = req.headers.get(HEADER)?.trim();

  if (!rawKey) {
    if (required) {
      return NextResponse.json(
        { error: "Idempotency-Key header required" },
        { status: 400 },
      );
    }
    const result = await handler();
    return NextResponse.json(result.body, { status: result.status });
  }

  const key = `${route}:${rawKey}`;
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("idempotency_keys")
    .select("status_code, body, expires_at")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    const row = existing as StoredResponse;
    if (new Date(row.expires_at) > new Date()) {
      log.info({ route, event: "idempotency.replay", requestId, key: rawKey });
      return NextResponse.json(row.body, {
        status: row.status_code,
        headers: { "idempotent-replayed": "true" },
      });
    }
    await supabase.from("idempotency_keys").delete().eq("key", key);
  }

  const result = await handler();

  if (result.status >= 200 && result.status < 500) {
    const expiresAt = new Date(Date.now() + ttlHours * 3_600_000).toISOString();
    const { error } = await supabase.from("idempotency_keys").insert({
      key,
      route,
      status_code: result.status,
      body: result.body as unknown as Record<string, unknown>,
      expires_at: expiresAt,
    });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      log.warn({ route, event: "idempotency.store_failed", requestId, err: error });
    }
  }

  return NextResponse.json(result.body, { status: result.status });
}

export { HEADER as IDEMPOTENCY_HEADER };
