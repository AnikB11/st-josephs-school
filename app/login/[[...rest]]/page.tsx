import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to your ${SCHOOL.shortName} portal.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold text-slate-900">
            {SCHOOL.shortName}
          </span>
        </Link>

        <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl">
          <h1 className="font-display text-xl font-semibold text-slate-900">
            Sign in to your portal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Use the credentials emailed to you by the school office.
          </p>

          <LoginForm next={next ?? "/admin"} initialError={error} />

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <Link href="/contact" className="hover:text-slate-700">
              Need help?
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          New accounts are created by the school office. If you don't have one,{" "}
          <Link href="/contact" className="text-primary hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
