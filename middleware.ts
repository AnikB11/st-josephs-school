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

function failsOriginCheck(req: NextRequest): boolean {
  if (!UNSAFE_METHODS.has(req.method)) return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost !== req.nextUrl.host;
  } catch {
    return true;
  }
}

const SUPABASE_AUTH_PREFIXES = [
  "/admin",
  "/teacher",
  "/alumni-portal",
  "/api/admin",
];

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
  const requestId = req.headers.get(REQUEST_ID_HEADER) ?? newRequestId();

  // All request-id injection + routing lives inside the try. Any thrown
  // exception (edge-runtime bug, missing env var, supabase network blip)
  // falls through to the catch and we respond with a safe fallback
  // instead of Vercel's generic MIDDLEWARE_INVOCATION_FAILED 500.
  try {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(REQUEST_ID_HEADER, requestId);
    const passthrough = () =>
      NextResponse.next({ request: { headers: requestHeaders } });

    if (pathname.startsWith("/api/admin") && failsOriginCheck(req)) {
      return NextResponse.json(
        { error: "Cross-origin request blocked" },
        { status: 403, headers: { [REQUEST_ID_HEADER]: requestId } },
      );
    }

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
      if (pathname.startsWith("/parent") && session.audience !== "parent") {
        return NextResponse.redirect(new URL("/student", req.url));
      }
      if (pathname.startsWith("/student") && session.audience !== "student") {
        return NextResponse.redirect(new URL("/parent", req.url));
      }
      return passthrough();
    }

    // ---------- Supabase Auth path (admin / teacher / alumni / api/admin) ----------
    // Fail loudly to the catch below if the project env is misconfigured
    // (a missing anon key would otherwise produce a silent fetch to
    // `undefined/auth/v1/user` and surface as a 500 to the user).
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) {
      throw new Error(
        `Missing supabase env in middleware (url=${!!supabaseUrl}, anon=${!!supabaseAnon}). Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on this Vercel project.`,
      );
    }

    // Standard @supabase/ssr middleware pattern: start with a response, let
    // setAll mutate req.cookies + re-create the response so the refreshed
    // auth cookies flow through to the downstream route handler.
    let res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set(REQUEST_ID_HEADER, requestId);
    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet: CookieSet[]) => {
          toSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: requestHeaders } });
          res.headers.set(REQUEST_ID_HEADER, requestId);
          toSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = loginPathFor(pathname);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  } catch (err) {
    // Log the full error to Vercel runtime logs so we can see what's
    // actually failing (visible under the project's "Logs" tab, filterable
    // by the request id echoed in the response header).
    console.error(
      JSON.stringify({
        level: "error",
        where: "middleware",
        requestId,
        pathname,
        err: err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : { message: String(err) },
      }),
    );

    // For API routes, return JSON with a request id so the client can
    // surface a useful error. For pages, send the user to a login page
    // (safer than a blank 500) with the request id as a query param.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Middleware error", requestId },
        { status: 500, headers: { [REQUEST_ID_HEADER]: requestId } },
      );
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = loginPathFor(pathname);
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set("err", "mw");
    loginUrl.searchParams.set("rid", requestId);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set(REQUEST_ID_HEADER, requestId);
    return redirect;
  }
}

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
