type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory rate limiter. Fine for a single-school single-node
 * deployment (~800 students). Swap for Upstash/Redis if we ever scale
 * horizontally — the interface stays the same.
 */
export function hitRateLimit(
  key: string,
  opts: { max: number; windowMs: number },
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1, resetMs: opts.windowMs };
  }
  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetMs: existing.resetAt - now };
  }
  existing.count += 1;
  return { allowed: true, remaining: opts.max - existing.count, resetMs: existing.resetAt - now };
}

/**
 * Pull a stable client identifier from request headers. Falls back to a
 * shared bucket when no IP is available (still rate-limits, just globally).
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const real = req.headers.get("x-real-ip") ?? "";
  return (fwd.split(",")[0] || real || "unknown").trim();
}
