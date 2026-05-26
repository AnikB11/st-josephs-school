import { Skeleton } from "@/components/ui/skeleton";

export default function AlumniLoading() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="mt-4 h-10 w-72 rounded-lg" />
      <Skeleton className="mt-3 h-5 w-96 rounded" />
      <div className="mt-12 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
