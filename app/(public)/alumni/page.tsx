import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Linkedin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/motion/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { initials } from "@/lib/utils";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import type { Alumnus } from "@/types/database";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Our alumni network — careers, achievements, and ways to stay connected.",
};

export const revalidate = 300;

const PLACEHOLDER: Alumnus[] = [
  { id: "1", user_id: null, student_id: null, full_name: "Anika Sharma",      graduation_year: 2014, current_position: "Product Manager",   current_company: "Stripe",      bio: "Built payment products for emerging markets.",                photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "2", user_id: null, student_id: null, full_name: "Rohan Sen",         graduation_year: 2011, current_position: "Founder",           current_company: "Helix Bio",   bio: "Graduated IIT-B, MIT. Pioneering synthetic biology platforms.", photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "3", user_id: null, student_id: null, full_name: "Dr. Priya Kapoor",  graduation_year: 2008, current_position: "Pediatric Surgeon", current_company: "AIIMS Delhi", bio: "Specializes in neonatal cardiac care.",                       photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "4", user_id: null, student_id: null, full_name: "Karan Iyer",        graduation_year: 2017, current_position: "Software Engineer", current_company: "Google",      bio: "Search infrastructure team.",                                 photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "5", user_id: null, student_id: null, full_name: "Meera Joshi",       graduation_year: 2019, current_position: "PhD Candidate",     current_company: "Stanford",    bio: "Quantum information theory.",                                 photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
  { id: "6", user_id: null, student_id: null, full_name: "Aditya Roy",        graduation_year: 2005, current_position: "Author & Journalist", current_company: "The Hindu", bio: "Reports on climate and policy.",                              photo_url: null, linkedin_url: "#", email: null, is_public: true, created_at: new Date().toISOString() },
];


async function fetchAlumni() {
  try {
    const supabase = createSupabaseStaticClient();
    const { data } = await supabase
      .from("alumni")
      .select("id,full_name,graduation_year,current_position,current_company,bio,photo_url,linkedin_url")
      .eq("is_public", true)
      .order("graduation_year", { ascending: false })
      .limit(30);
    return (data as Alumnus[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AlumniPage() {
  const [fetched, cms] = await Promise.all([
    fetchAlumni(),
    getCmsSections(["alumni_hero_image", "alumni_network_image"]),
  ]);
  const alumni = fetched.length ? fetched : PLACEHOLDER;
  const HERO_IMG = resolveImage("alumni_hero_image", cms.alumni_hero_image);
  const GATHERING_IMG = resolveImage("alumni_network_image", cms.alumni_network_image);

  return (
    <>
      <PageHero
        eyebrow="Alumni"
        title="A network that lasts a lifetime."
        description="From researchers and founders to teachers and artists — our graduates are everywhere, doing remarkable things."
        image={HERO_IMG}
      />

      <section className="container-wide py-24 sm:py-32">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full">All batches</Badge>
            <Badge variant="secondary" className="rounded-full">2020s</Badge>
            <Badge variant="secondary" className="rounded-full">2010s</Badge>
            <Badge variant="secondary" className="rounded-full">2000s</Badge>
            <Badge variant="secondary" className="rounded-full">1990s</Badge>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((a, i) => (
            <Reveal key={a.id} delay={(i % 6) * 0.05}>
              <article className="group h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-6 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.25)]">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[hsl(var(--primary))]/10 font-display text-[hsl(var(--primary))]">
                      {initials(a.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-display truncate text-base font-semibold text-[hsl(var(--ink))]">
                      {a.full_name}
                    </p>
                    <p className="text-xs text-[hsl(var(--ink-soft))]">
                      Class of {a.graduation_year}
                    </p>
                  </div>
                </div>
                {a.current_position && (
                  <p className="mt-4 flex items-start gap-2 text-sm text-[hsl(var(--ink))]">
                    <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ink-soft))]" />
                    <span>
                      {a.current_position}
                      {a.current_company && (
                        <span className="text-[hsl(var(--ink-soft))]"> · {a.current_company}</span>
                      )}
                    </span>
                  </p>
                )}
                {a.bio && (
                  <p className="mt-2 text-sm text-[hsl(var(--ink-soft))]">{a.bio}</p>
                )}
                {a.linkedin_url && (
                  <a
                    href={a.linkedin_url}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--primary))]"
                  >
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gathering image break */}
      <section className="container-wide pb-24 sm:pb-32">
        <Reveal>
          <ParallaxImage
            src={GATHERING_IMG}
            alt="Alumni gathering"
            wrapperClassName="aspect-[16/7]"
          />
        </Reveal>
      </section>

      <section className="container-wide pb-24 sm:pb-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-[hsl(var(--primary))] px-8 py-14 text-center text-[hsl(var(--ivory))] sm:px-14">
            <div
              aria-hidden
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--gold))]/25 blur-3xl"
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
              <span className="gold-rule">Stay in touch</span>
            </p>
            <h3 className="font-display mt-4 text-balance text-3xl font-semibold sm:text-4xl">
              Are you an alumna or alumnus?
            </h3>
            <p className="mt-3 text-white/75">
              Sign in to update your profile and join alumni-only events.
            </p>
            <div className="mt-7">
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-[hsl(var(--ivory))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--primary))] hover:bg-[hsl(var(--ivory))]/90"
                >
                  Sign in to alumni portal
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
