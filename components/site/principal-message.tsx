import { SectionHeading } from "@/components/site/section-heading";

export function PrincipalMessage({
  title,
  body,
}: {
  title?: string | null;
  body?: string | null;
}) {
  return (
    <section className="container-wide py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="From the Principal"
            title={title ?? "An education that lights a fire."}
            description={
              body ??
              "Education is not the filling of a pail but the lighting of a fire. At St. Joseph's, we strive every day to ignite curiosity, build character, and prepare students for the world ahead — academically, ethically, and personally."
            }
          />
          <div className="mt-8 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 font-display text-sm font-semibold text-slate-700">
              MR
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">
                Mrs. Margaret Rosario
              </p>
              <p className="text-xs text-slate-500">Principal · serving since 2014</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <figure className="relative rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-10">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-8 w-8 text-primary/30"
              fill="currentColor"
            >
              <path d="M9.17 6C7.4 6 6 7.4 6 9.17v8.83h6V12H8.5c0-1.93 1.57-3.5 3.5-3.5V6H9.17Zm9 0c-1.77 0-3.17 1.4-3.17 3.17v8.83h6V12h-3.5c0-1.93 1.57-3.5 3.5-3.5V6h-2.83Z" />
            </svg>
            <blockquote className="mt-4 font-display text-2xl leading-snug tracking-tight text-slate-800 sm:text-3xl">
              "Our purpose has never been to produce students who simply pass
              exams. It has been to send young people into the world who can
              think, who can lead, and who can care."
            </blockquote>
          </figure>
        </div>
      </div>
    </section>
  );
}
