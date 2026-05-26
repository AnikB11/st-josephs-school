import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { TeacherLoginForm } from "@/components/auth/teacher-login-form";

export const metadata: Metadata = {
  title: "Teacher sign in",
  description: `Sign in to the ${SCHOOL.shortName} teacher portal.`,
};

export default async function TeacherLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold text-slate-900">
            {SCHOOL.shortName}
          </span>
        </Link>

        <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Teacher portal
          </p>
          <h1 className="font-display mt-1 text-xl font-semibold text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Use your school email and your employee code as the password. You can
            change your password after signing in.
          </p>

          <TeacherLoginForm next={next ?? "/teacher"} initialError={error} />

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <Link href="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </Link>
            <Link href="/contact" className="hover:text-slate-700">
              Need help?
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Not a teacher?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Use the main sign-in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
