import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
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
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your email and we'll send you a link to set a new password.
          </p>
          <ForgotPasswordForm />
          <div className="mt-4 text-center">
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-700">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
