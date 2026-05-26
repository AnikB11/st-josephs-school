import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { SCHOOL } from "@/lib/constants";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
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

import { Suspense } from "react";
import { TopLoader } from "@/components/site/top-loader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Arm scroll-reveal hiding before body content paints — if JS is
            blocked or hydration fails, .reveal elements stay visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.setAttribute('data-js','ready');",
          }}
        />
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
