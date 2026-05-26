import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="relative flex min-h-[680px] w-full flex-col items-center justify-center bg-slate-50" style={{ height: "min(100svh, 900px)" }}>
        <div className="flex flex-col items-center gap-6 px-4">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-16 w-[min(90vw,700px)] rounded-xl" />
          <Skeleton className="h-6 w-[min(70vw,500px)] rounded-lg" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-12 w-44 rounded-full" />
            <Skeleton className="h-12 w-44 rounded-full" />
          </div>
          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="border-y border-slate-200/70 bg-slate-50/40">
        <div className="container-wide py-16">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-10 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="container-wide py-20">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="mt-4 h-10 w-80 rounded-lg" />
        <Skeleton className="mt-3 h-5 w-64 rounded" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    </>
  );
}
