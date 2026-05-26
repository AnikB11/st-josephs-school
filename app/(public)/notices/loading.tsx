import { Skeleton } from "@/components/ui/skeleton";

export default function NoticesLoading() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="mt-4 h-10 w-56 rounded-lg" />
      <Skeleton className="mt-3 h-5 w-80 rounded" />
      <div className="mt-12 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
