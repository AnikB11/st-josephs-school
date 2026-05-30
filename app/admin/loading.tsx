import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared loading skeleton for every route under /admin. Because it lives at
 * the segment root it must NOT mimic any one page's grid — doing so reflows
 * violently when the real page (with a different grid) streams in. Instead
 * it mirrors the layout shell only: the TopNav (using the real TopNav's exact
 * classes so the swap is invisible) and a soft full-bleed body placeholder.
 */
export default function AdminLoading() {
  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="hidden h-9 w-64 rounded-md sm:block" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="space-y-6 px-6 py-8">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </div>
    </>
  );
}
