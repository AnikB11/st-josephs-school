import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherLoading() {
  return (
    <>
      {/* TopNav Skeleton Placeholder to prevent visual layout shifts */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/70 bg-white px-6">
        <div>
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="mt-1.5 h-3.5 w-48 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="hidden h-9 w-64 rounded-lg sm:block" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="space-y-6 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </>
  );
}
