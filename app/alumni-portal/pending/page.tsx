import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, GraduationCap, XCircle } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SCHOOL } from "@/lib/constants";
import type { AlumniStatus } from "@/types/database";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AlumniPendingPage() {
  const user = await getAuthUser();
  if (!user) redirect("/alumni-portal/login");

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("alumni")
    .select("status, rejection_reason")
    .ilike("email", user.email)
    .maybeSingle();

  const row = data as { status: AlumniStatus; rejection_reason: string | null } | null;

  // If they're already approved, send them into the portal.
  if (row?.status === "approved") redirect("/alumni-portal");

  const rejected = row?.status === "rejected";

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

        <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl text-center">
          {rejected ? (
            <XCircle className="mx-auto h-10 w-10 text-red-500" />
          ) : (
            <Clock className="mx-auto h-10 w-10 text-amber-500" />
          )}
          <h1 className="font-display mt-3 text-xl font-semibold text-slate-900">
            {rejected ? "Request not approved" : "Waiting on approval"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {rejected
              ? "Your alumni access request was not approved by the office."
              : "Your alumni access request is being reviewed by the alumni office. You'll be able to sign in once it's approved."}
          </p>
          {rejected && row?.rejection_reason && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-left text-xs text-red-700">
              Reason: {row.rejection_reason}
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <SignOutButton redirectTo="/alumni-portal/login" />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Questions?{" "}
          <Link href="/contact" className="text-[hsl(var(--primary))] hover:underline">
            Contact the alumni office
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
