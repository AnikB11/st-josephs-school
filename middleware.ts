import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { verifyStudentSessionToken, STUDENT_SESSION_COOKIE } from "@/lib/student-session";

type CookieSet = { name: string; value: string; options?: CookieOptions };

const REQUEST_ID_HEADER = "x-request-id";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function newRequestId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  );
}

/**
 * Cheap same-origin check for unsafe methods. Browsers always send an
 * Origin header on cross-site POSTs, so a mismatch (or missing value on
 * a cross-site request) is a strong CSRF signal. This runs before auth
 * so an attacker can't burn session cookies via forged forms.
 */
function failsOriginCheck(req: NextRequest): boolean {
  if (!UNSAFE_METHODS.has(req.method)) return false;
  const origin = req.headers.get("origin");
  // Same-origin fetches from our own app pages always include Origin.
  // No Origin on an unsafe method = suspicious cross-site form POST.
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost !== req.nextUrl.host;
  } catch {
    return true;
  }
}

// Routes that require a Supabase Auth session (admin / teacher / alumni).
const SUPABASE_AUTH_PREFIXES = [
  "/admin",
  "/teacher",
  "/alumni-portal",
  "/api/admin",
];

// Routes that require a student-session JWT cookie (student / parent).
const STUDENT_SESSION_PREFIXES = [
  "/student",
  "/parent",
];

const OTHER_PROTECTED_PREFIXES: string[] = [];

const PUBLIC_API_PREFIXES = [
  "/api/public-result",
  "/api/cron",
  "/api/contact",
  "/api/access",
];

// Portal-specific login pages that live under a protected prefix but
// must be reachable without a session.
const PUBLIC_PORTAL_PAGES = new Set<string>([
  "/teacher/login",
  "/student/login",
  "/parent/login",
  "/alumni-portal/login",
  "/alumni-portal/request",
]);

function startsWithPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function loginPathFor(pathname: string): string {
  if (pathname === "/teacher" || pathname.startsWith("/teacher/")) return "/teacher/login";
  if (pathname === "/student" || pathname.startsWith("/student/")) return "/student/login";
  if (pathname === "/parent" || pathname.startsWith("/parent/")) return "/parent/login";
  if (pathname === "/alumni-portal" || pathname.startsWith("/alumni-portal/")) return "/alumni-portal/login";
  return "/login";
}

function isPublicApi(pathname: string) {
  return startsWithPrefix(pathname, PUBLIC_API_PREFIXES);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Inject a request id so downstream handlers + lib/log.ts can correlate.
  const requestId = req.headers.get(REQUEST_ID_HEADER) ?? newRequestId();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  const passthrough = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  // CSRF: reject unsafe cross-origin requests to protected admin APIs.
  // Public APIs (public-result, access/verify, alumni/request) are not
  // matched by this middleware, so we only guard admin writes.
  if (pathname.startsWith("/api/admin") && failsOriginCheck(req)) {
    return NextResponse.json(
      { error: "Cross-origin request blocked" },
      { status: 403, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  }

  // BYPASS AUTH FOR LOCAL DEV — matches the bypass in lib/auth.ts.
  if (process.env.NODE_ENV === "development") return passthrough();

  if (isPublicApi(pathname)) return passthrough();
  if (PUBLIC_PORTAL_PAGES.has(pathname)) return passthrough();

  const needsSupabase = startsWithPrefix(pathname, SUPABASE_AUTH_PREFIXES) ||
    startsWithPrefix(pathname, OTHER_PROTECTED_PREFIXES);
  const needsStudent = startsWithPrefix(pathname, STUDENT_SESSION_PREFIXES);

  if (!needsSupabase && !needsStudent) return passthrough();

  // ---------- Student / parent JWT path ----------
  if (needsStudent) {
    const token = req.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const session = token ? await verifyStudentSessionToken(token) : null;
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = loginPathFor(pathname);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Enforce audience: student session can't access /parent and vice versa.
    if (pathname.startsWith("/parent") && session.audience !== "parent") {
      return NextResponse.redirect(new URL("/student", req.url));
    }
    if (pathname.startsWith("/student") && session.audience !== "student") {
      return NextResponse.redirect(new URL("/parent", req.url));
    }
    return passthrough();
  }

  // ---------- Supabase Auth path (admin / teacher) ----------
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set(REQUEST_ID_HEADER, requestId);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet: CookieSet[]) => {
          toSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = loginPathFor(pathname);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Only run middleware on routes that may need auth. Public pages skip it entirely,
// which avoids loading the jose/Supabase edge bundle on every public navigation.
export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/alumni-portal/:path*",
    "/api/admin/:path*",
  ],
};
