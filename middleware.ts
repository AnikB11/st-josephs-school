import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/parent(.*)",
  "/alumni-portal(.*)",
  "/api/admin(.*)",
]);

const isPublicApi = createRouteMatcher([
  "/api/public-result(.*)",
  "/api/cron(.*)",
  "/api/contact(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApi(req)) return;
  
  // BYPASS CLERK FOR LOCAL DEV (Fixes SSO callback loop)
  if (process.env.NODE_ENV === "development") return;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
