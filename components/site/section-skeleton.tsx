import { Skeleton } from "@/components/ui/skeleton";

/** Lightweight placeholder used while below-the-fold sections lazy-load */
export function SectionSkeleton() {
  return (
    <div className="container-wide py-20">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="mt-4 h-10 w-72 rounded-lg" />
      <Skeleton className="mt-3 h-5 w-80 rounded" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
