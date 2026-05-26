import { Skeleton } from "@/components/ui/skeleton";

export default function AdmissionsLoading() {
  return (
    <>
      <section className="container-wide py-20 sm:py-28">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="mt-4 h-10 w-72 rounded-lg" />
        <Skeleton className="mt-3 h-5 w-80 rounded" />
        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </section>
      <section className="bg-slate-50/50 py-20 sm:py-28">
        <div className="container-wide grid gap-10 lg:grid-cols-2">
          <div>
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="mt-4 h-10 w-56 rounded-lg" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-72 rounded" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="mt-4 h-10 w-48 rounded-lg" />
            <Skeleton className="mt-6 h-52 rounded-2xl" />
          </div>
        </div>
      </section>
    </>
  );
}
