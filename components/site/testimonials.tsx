import { AnimatedTestimonials, type Testimonial } from "@/components/ui/animated-testimonials";

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "A parent",
    role: "Parent, Middle School",
    company: "Rhenock",
    content:
      "The teachers here know our children as people, not just as a roll number. That care is what keeps our family with St. Joseph's.",
    rating: 5,
    avatar: "",
  },
  {
    id: 2,
    name: "An alumnus",
    role: "Class of 2012",
    company: "Currently based in Gangtok",
    content:
      "The discipline of writing well, the habit of asking questions, and the quiet reminder to serve others — those are the things I carry from Kingston into every part of my life.",
    rating: 5,
    avatar: "",
  },
  {
    id: 3,
    name: "A teacher",
    role: "Senior Secondary Faculty",
    company: "At St. Joseph's for over a decade",
    content:
      "This school gives us the freedom to teach with care — small classes, patient leadership, and children who genuinely want to learn.",
    rating: 5,
    avatar: "",
  },
  {
    id: 4,
    name: "An alumna",
    role: "Class of 2015",
    company: "Higher studies, Bengaluru",
    content:
      "Love and Service isn't a slogan on the badge — it's the way the school actually treated us. That's why the values still hold, years after leaving.",
    rating: 5,
    avatar: "",
  },
];

export function Testimonials() {
  return (
    <AnimatedTestimonials
      badgeText="Voices from the community"
      title="What families, teachers, and alumni say."
      subtitle="Since 1996, the school has been part of countless families across Sikkim and beyond. These are a few of their voices."
      testimonials={TESTIMONIALS}
      autoRotateInterval={7000}
      trustedCompaniesTitle="Where our graduates have gone on to study and serve"
      trustedCompanies={[
        "Sikkim University",
        "St. Xavier's, Kolkata",
        "Delhi University",
        "NIT Sikkim",
        "St. Joseph's, Darjeeling",
        "Christ University",
      ]}
    />
  );
}
