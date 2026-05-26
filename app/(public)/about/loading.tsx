import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <>
      <section className="container-wide py-20 sm:py-28">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="mt-4 h-10 w-80 rounded-lg" />
        <Skeleton className="mt-3 h-5 w-96 rounded" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </section>
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
    </>
  );
}
