import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { verifyStudentSessionToken, STUDENT_SESSION_COOKIE } from "@/lib/student-session";

type CookieSet = { name: string; value: string; options?: CookieOptions };

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

  // BYPASS AUTH FOR LOCAL DEV — matches the bypass in lib/auth.ts.
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  if (isPublicApi(pathname)) return NextResponse.next();
  if (PUBLIC_PORTAL_PAGES.has(pathname)) return NextResponse.next();

  const needsSupabase = startsWithPrefix(pathname, SUPABASE_AUTH_PREFIXES) ||
    startsWithPrefix(pathname, OTHER_PROTECTED_PREFIXES);
  const needsStudent = startsWithPrefix(pathname, STUDENT_SESSION_PREFIXES);

  if (!needsSupabase && !needsStudent) return NextResponse.next();

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
    return NextResponse.next();
  }

  // ---------- Supabase Auth path (admin / teacher) ----------
  const res = NextResponse.next();
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
