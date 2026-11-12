/**
 * Structured logger. Emits one JSON line per event so Vercel log search
 * works on route/event/requestId. Replaces ad-hoc console.error calls in
 * API routes. In development we pretty-print for readability.
 */

type Level = "debug" | "info" | "warn" | "error";

type Fields = Record<string, unknown> & {
  route: string;
  event: string;
  requestId?: string;
  err?: unknown;
};

const REQUEST_ID_HEADER = "x-request-id";

function serializeError(err: unknown) {
  if (!err) return undefined;
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  if (typeof err === "object") return err;
  return { message: String(err) };
}

function emit(level: Level, fields: Fields) {
  const { err, ...rest } = fields;
  const record = {
    level,
    ts: new Date().toISOString(),
    ...rest,
    ...(err !== undefined ? { err: serializeError(err) } : {}),
  };
  const line = JSON.stringify(record);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (fields: Fields) => emit("debug", fields),
  info: (fields: Fields) => emit("info", fields),
  warn: (fields: Fields) => emit("warn", fields),
  error: (fields: Fields) => emit("error", fields),
};

/** Pull the request id injected by middleware; falls back to a random id. */
export function requestIdFrom(req: Request | Headers): string {
  const headers = req instanceof Headers ? req : req.headers;
  const incoming = headers.get(REQUEST_ID_HEADER);
  if (incoming) return incoming;
  return (
    globalThis.crypto?.randomUUID?.() ??
    `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  );
}

export { REQUEST_ID_HEADER };
