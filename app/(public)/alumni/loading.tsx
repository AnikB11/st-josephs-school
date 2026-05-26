import { Skeleton } from "@/components/ui/skeleton";

export default function AlumniLoading() {
  return (
    <>
      <section className="relative isolate min-h-[68svh] w-full overflow-hidden bg-[hsl(var(--ink))] lg:min-h-[78svh]">
        <div className="container-wide relative flex h-full flex-col justify-end pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24">
          <Skeleton className="h-4 w-24 rounded-full bg-white/15" />
          <Skeleton className="mt-4 h-16 w-72 rounded-lg bg-white/15 sm:w-[28rem]" />
          <Skeleton className="mt-5 h-5 w-80 rounded bg-white/10 sm:w-[32rem]" />
        </div>
      </section>
      <div className="sticky top-[68px] z-30 border-y border-[hsl(var(--border))]/80 bg-[hsl(var(--ivory))]/85 backdrop-blur-xl">
        <div className="container-wide flex gap-2 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <section className="container-wide py-20 sm:py-24">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="mt-4 h-10 w-72 rounded-lg" />
        <Skeleton className="mt-3 h-5 w-96 rounded" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-3xl" />
          ))}
        </div>
      </section>
    </>
  );
}
