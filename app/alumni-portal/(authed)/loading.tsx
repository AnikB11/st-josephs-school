import { Skeleton } from "@/components/ui/skeleton";

export default function AlumniPortalLoading() {
  return (
    <div className="space-y-6 px-6 py-8">
      <div>
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-56 rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
