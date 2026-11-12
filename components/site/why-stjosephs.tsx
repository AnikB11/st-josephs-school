import { Reveal } from "@/components/motion/reveal";

const CARDS = [
  {
    title: "A Legacy of Education",
    body: "Established in 1996 under the Roman Catholic Diocese of Darjeeling–Sikkim, the school continues its commitment to education, formation, and service.",
  },
  {
    title: "Holistic Development",
    body: "We encourage intellectual, moral, spiritual, psychological, physical, and social development through meaningful learning experiences.",
  },
  {
    title: "Values-Based Education",
    body: "Respect, compassion, integrity, responsibility, and concern for others form an important part of the school's educational philosophy.",
  },
  {
    title: "CISCE Curriculum",
    body: "Affiliated with the Council for the Indian School Certificate Examinations, New Delhi, the school provides an English-medium educational framework.",
  },
  {
    title: "Beyond the Classroom",
    body: "Through sports, music, dance, and specialised academies, students are encouraged to explore their interests and develop their individual abilities.",
  },
  {
    title: "Inclusive Education",
    body: "We promote equality, mutual respect, and human dignity, irrespective of sex, religion, caste, creed, or economic background.",
  },
  {
    title: "Residential Facilities",
    body: "Separate boarding facilities for boys and girls provide a supportive environment for students from different communities and locations.",
  },
  {
    title: "Learning Through Service",
    body: "Students are encouraged to develop compassion, social responsibility, and concern for those who are underprivileged and marginalised.",
  },
];

export function WhyStJosephs() {
  return (
    <section className="surface-cream py-20 sm:py-24 lg:py-28">
      <div className="container-wide">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            <span className="gold-rule">Why St. Joseph&apos;s</span>
          </p>
          <h2 className="heading mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            An education that shapes the whole person.
          </h2>
          <p className="mt-5 text-base text-[hsl(var(--ink-soft))] sm:text-lg">
            Meaningful education goes beyond academic achievement. It involves
            developing the mind, strengthening character, nurturing values, and
            preparing young people to live responsibly within society.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.04}>
              <article className="h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6">
                <h3 className="font-display text-lg font-semibold text-[hsl(var(--ink))]">
                  {c.title}
                </h3>
                <span className="mt-3 block h-px w-8 bg-[hsl(var(--gold))]" />
                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                  {c.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
