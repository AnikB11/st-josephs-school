import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { AlumniLoginForm } from "@/components/auth/alumni-login-form";

export const metadata: Metadata = {
  title: "Alumni sign in",
  description: `Sign in or create your ${SCHOOL.shortName} alumni profile.`,
};

export const dynamic = "force-dynamic";

export default async function AlumniLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = next && next.startsWith("/alumni-portal") ? next : "/alumni-portal";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--ivory))] shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold text-slate-900">
            {SCHOOL.shortName}
          </span>
        </Link>

        <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            Alumni portal
          </p>
          <h1 className="font-display mt-1 text-xl font-semibold text-slate-900">
            Sign in to the alumni portal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Use the email and password from your approved alumni request.
          </p>

          <AlumniLoginForm next={target} initialError={error} />

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            New here?{" "}
            <Link
              href="/alumni-portal/request"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              Request alumni access
            </Link>
            .
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need help? <Link href="/contact" className="text-[hsl(var(--primary))] hover:underline">Contact the alumni office</Link>.
        </p>
      </div>
    </div>
  );
}
