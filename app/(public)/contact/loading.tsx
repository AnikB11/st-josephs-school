import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
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
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      </div>
      <section className="container-wide py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-7">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-5 w-72 rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 pt-2">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="lg:col-span-3 h-[28rem] rounded-3xl" />
        </div>
      </section>
    </>
  );
}
