import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { AlumniRequestForm } from "@/components/auth/alumni-request-form";

export const metadata: Metadata = {
  title: "Request alumni access",
  description: `Submit your details to request ${SCHOOL.shortName} alumni portal access.`,
};

export const dynamic = "force-dynamic";

export default function AlumniRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col items-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--ivory))] shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold text-slate-900">
            {SCHOOL.shortName}
          </span>
        </Link>

        <div className="w-full max-w-2xl rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            Alumni portal
          </p>
          <h1 className="font-display mt-1 text-xl font-semibold text-slate-900">
            Request access to the alumni portal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in your details below. The alumni office will review and approve
            your request, after which you can sign in with your email and password.
          </p>

          <div className="mt-6">
            <AlumniRequestForm />
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/alumni-portal/login"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              Sign in
            </Link>
            .
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need help?{" "}
          <Link href="/contact" className="text-[hsl(var(--primary))] hover:underline">
            Contact the alumni office
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
