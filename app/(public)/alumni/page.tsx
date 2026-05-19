import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Linkedin } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Alumnus } from "@/types/database";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Our alumni network — careers, achievements, and ways to stay connected.",
};

const PLACEHOLDER: Alumnus[] = [
  {
    id: "1",
    user_id: null,
    student_id: null,
    full_name: "Anika Sharma",
    graduation_year: 2014,
    current_position: "Product Manager",
    current_company: "Stripe",
    bio: "Built payment products for emerging markets.",
    photo_url: null,
    linkedin_url: "#",
    email: null,
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: null,
    student_id: null,
    full_name: "Rohan Mehta",
    graduation_year: 2010,
    current_position: "Founder",
    current_company: "Atlas Robotics",
    bio: "Working on autonomous logistics.",
    photo_url: null,
    linkedin_url: "#",
    email: null,
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: null,
    student_id: null,
    full_name: "Dr. Priya Kapoor",
    graduation_year: 2008,
    current_position: "Pediatric Surgeon",
    current_company: "AIIMS Delhi",
    bio: "Specializes in neonatal cardiac care.",
    photo_url: null,
    linkedin_url: "#",
    email: null,
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    user_id: null,
    student_id: null,
    full_name: "Karan Iyer",
    graduation_year: 2017,
    current_position: "Software Engineer",
    current_company: "Google",
    bio: "Search infrastructure team.",
    photo_url: null,
    linkedin_url: "#",
    email: null,
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    user_id: null,
    student_id: null,
    full_name: "Meera Joshi",
    graduation_year: 2019,
    current_position: "PhD Candidate",
    current_company: "Stanford",
    bio: "Quantum information theory.",
    photo_url: null,
    linkedin_url: "#",
    email: null,
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    user_id: null,
    student_id: null,
    full_name: "Aditya Roy",
    graduation_year: 2005,
    current_position: "Author & Journalist",
    current_company: "The Hindu",
    bio: "Reports on climate and policy.",
    photo_url: null,
    linkedin_url: "#",
    email: null,
    is_public: true,
    created_at: new Date().toISOString(),
  },
];

async function fetchAlumni() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("alumni")
      .select("*")
      .eq("is_public", true)
      .order("graduation_year", { ascending: false });
    return (data as Alumnus[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AlumniPage() {
  const fetched = await fetchAlumni();
  const alumni = fetched.length ? fetched : PLACEHOLDER;

  return (
    <section className="container-wide py-20 sm:py-28">
      <SectionHeading
        eyebrow="Alumni"
        title="A network that lasts a lifetime."
        description="From researchers and founders to teachers and artists — our graduates are everywhere doing remarkable things."
      />

      <div className="mt-12 flex flex-wrap items-center gap-2">
        <Badge variant="outline">All batches</Badge>
        <Badge variant="secondary">2020s</Badge>
        <Badge variant="secondary">2010s</Badge>
        <Badge variant="secondary">2000s</Badge>
        <Badge variant="secondary">1990s</Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {alumni.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-slate-200/70 bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-display">
                  {initials(a.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-display truncate text-base font-semibold text-slate-900">
                  {a.full_name}
                </p>
                <p className="text-xs text-slate-500">Class of {a.graduation_year}</p>
              </div>
            </div>
            {a.current_position && (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span>
                  {a.current_position}
                  {a.current_company && (
                    <span className="text-slate-500"> · {a.current_company}</span>
                  )}
                </span>
              </p>
            )}
            {a.bio && <p className="mt-2 text-sm text-slate-600">{a.bio}</p>}
            {a.linkedin_url && (
              <a
                href={a.linkedin_url}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            )}
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-slate-900 px-8 py-12 text-center text-white">
        <h3 className="font-display text-2xl font-semibold">Are you an alumna or alumnus?</h3>
        <p className="mt-2 text-white/70">Sign in to update your profile and join alumni-only events.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button variant="default" className="bg-white text-slate-900 hover:bg-white/90">
              Sign in to alumni portal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
