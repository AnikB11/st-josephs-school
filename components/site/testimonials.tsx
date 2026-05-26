import { AnimatedTestimonials, type Testimonial } from "@/components/ui/animated-testimonials";

// TODO: Replace with real photos of the people who gave these quotes.
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Anita Bose",
    role: "Parent of Class V student",
    company: "St. Joseph's family since 2021",
    content:
      "What struck me from day one was how well the teachers knew my daughter — not just her marks, but her moods, her friends, what she's reading. That's rare.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 2,
    name: "Rohan Sen",
    role: "Alumnus · Class of 2011",
    company: "Founder, Helix Bio",
    content:
      "Everything I needed in college and beyond — the discipline of writing, the love of asking why, the comfort of working hard — I learned in those corridors first.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Mr. Sandeep Iyer",
    role: "Physics teacher",
    company: "Teaching at St. Joseph's since 2009",
    content:
      "Sixteen years in, I still get to teach in small classes with curious children and a leadership that lets us teach properly. It's why I haven't left.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: 4,
    name: "Dr. Priya Kapoor",
    role: "Alumna · Class of 2008",
    company: "Pediatric Surgeon, AIIMS Delhi",
    content:
      "The school taught me that excellence and kindness aren't competing values — they grow together. I've carried that into every operating room.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

export function Testimonials() {
  return (
    <AnimatedTestimonials
      badgeText="Voices from the community"
      title="What families and alumni say."
      subtitle="The school has been part of more than 800 families this year, and 12,000 graduates over six decades. These are a few of their voices."
      testimonials={TESTIMONIALS}
      autoRotateInterval={7000}
      trustedCompaniesTitle="Where our recent graduates have gone on to study"
      trustedCompanies={[
        "IIT Bombay",
        "Stanford",
        "Cambridge",
        "AIIMS",
        "NLSIU",
        "St. Stephen's",
      ]}
    />
  );
}
