import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="mt-4 h-10 w-64 rounded-lg" />
      <Skeleton className="mt-3 h-5 w-96 rounded" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
