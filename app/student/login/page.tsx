import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { AccessForm } from "@/components/auth/access-form";

export const metadata: Metadata = {
  title: "Student sign in",
  description: `Sign in to the ${SCHOOL.shortName} student portal.`,
};

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold text-slate-900">
            {SCHOOL.shortName}
          </span>
        </Link>

        <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
            Student portal
          </p>
          <h1 className="font-display mt-1 text-xl font-semibold text-slate-900">
            Sign in to see your results
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your admission number and date of birth — no password needed.
          </p>

          <AccessForm audience="student" next={next} />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Are you a parent?{" "}
          <Link href="/parent/login" className="text-primary hover:underline">
            Use the parent portal
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
