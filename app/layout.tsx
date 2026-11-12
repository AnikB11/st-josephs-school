import type { Metadata, Viewport } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import { SCHOOL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
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
  description: `${SCHOOL.name}, Rhenock — a co-educational ICSE school in Kingston, Pakyong District, Sikkim. Founded in ${SCHOOL.founded} under the Roman Catholic Diocese of Darjeeling–Sikkim, offering Nursery through Class XII (Science) in English medium.`,
  applicationName: SCHOOL.name,
  keywords: [
    "St. Joseph's School Kingston",
    "St. Joseph's School Rhenock",
    "ICSE school in Sikkim",
    "CISCE school Sikkim",
    "Best school in Pakyong",
    "English medium school Sikkim",
    "Nursery to XII Sikkim",
    "Rhenock school",
    "Diocese of Darjeeling–Sikkim",
  ],
  authors: [{ name: SCHOOL.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: SCHOOL.name,
    title: `${SCHOOL.name} — ${SCHOOL.tagline}`,
    description: `An ICSE co-educational school in Rhenock, Sikkim — founded in ${SCHOOL.founded} under the Diocese of Darjeeling–Sikkim. Admissions open.`,
  },
  twitter: {
    card: "summary_large_image",
    title: SCHOOL.name,
    description: `An ICSE school in Kingston, Rhenock, Sikkim — since ${SCHOOL.founded}.`,
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
      className={`${inter.variable} ${garamond.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Eager TLS/handshake to the image CDNs we use everywhere — saves
            one round-trip per host on the first paint. Browsers ignore
            duplicates so it's safe even when next/image / next/font emit
            their own. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Arm scroll-reveal hiding before <body> content paints — without
            this, .reveal elements render visible for one frame, then snap
            to hidden, then animate back in (visible jitter on first load).
            Running it in <head> means the attribute is set before paint.
            If JS is blocked, .reveal elements stay visible by design. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.setAttribute('data-js','ready');",
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
