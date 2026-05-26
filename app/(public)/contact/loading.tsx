import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="mt-4 h-10 w-72 rounded-lg" />
      <Skeleton className="mt-3 h-5 w-80 rounded" />
      <div className="mt-14 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="lg:col-span-3 h-96 rounded-2xl" />
      </div>
    </section>
  );
}
