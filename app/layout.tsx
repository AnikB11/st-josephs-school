import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SCHOOL } from "@/lib/constants";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${SCHOOL.name} — ${SCHOOL.tagline}`,
    template: `%s · ${SCHOOL.shortName}`,
  },
  description: `${SCHOOL.name} has nurtured generations of curious, compassionate, and capable young people since ${SCHOOL.founded}.`,
  applicationName: SCHOOL.name,
  keywords: [
    "St Joseph's School",
    "school admission",
    "best school",
    "K-12 education",
    "boarding school",
  ],
  authors: [{ name: SCHOOL.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: SCHOOL.name,
    title: `${SCHOOL.name} — ${SCHOOL.tagline}`,
    description: `Where tradition meets tomorrow. Admissions 2026–27 now open.`,
  },
  twitter: {
    card: "summary_large_image",
    title: SCHOOL.name,
    description: SCHOOL.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Syntactically valid public Clerk dev key. Used ONLY when the real env var
// is missing, so that builds / first-run dev sessions don't crash before
// the developer has wired up Clerk. Actual auth calls will fail until the
// real key is configured in .env.local — that is the intended behavior.
const FALLBACK_PUBLISHABLE_KEY =
  "pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA";

import { TopLoader } from "@/components/site/top-loader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || FALLBACK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
        <body>
          <TopLoader />
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

