import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { AccessForm } from "@/components/auth/access-form";

export const metadata: Metadata = {
  title: "Parent sign in",
  description: `Sign in to the ${SCHOOL.shortName} parent portal.`,
};

export default async function ParentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold text-slate-900">
            {SCHOOL.shortName}
          </span>
        </Link>

        <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Parent portal
          </p>
          <h1 className="font-display mt-1 text-xl font-semibold text-slate-900">
            Sign in to see your child's progress
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Use your child's admission number and date of birth. If you have multiple
            children, sign in again to switch.
          </p>

          <AccessForm audience="parent" next={next} accent="emerald" />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Are you the student?{" "}
          <Link href="/student/login" className="text-primary hover:underline">
            Use the student portal
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
