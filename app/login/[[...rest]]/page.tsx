import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to your ${SCHOOL.shortName} portal.`,
};

export default function LoginPage() {
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

        <SignIn
          routing="path"
          path="/login"
          fallbackRedirectUrl="/admin"
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "shadow-xl border border-slate-200/70 rounded-2xl",
              headerTitle: "font-display",
              socialButtonsBlockButton: "border-slate-200",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
            },
          }}
        />

        <p className="mt-6 text-xs text-slate-500">
          Trouble signing in?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact the office
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
