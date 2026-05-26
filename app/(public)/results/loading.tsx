import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsLoading() {
  return (
    <section className="container-wide py-20 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-5 w-80 rounded" />
        </div>
        <Skeleton className="mt-10 h-64 rounded-3xl" />
      </div>
    </section>
  );
}
