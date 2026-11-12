import { SCHOOL } from "@/lib/constants";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function json(data: unknown): string {
  // Escape </script> so a payload can't break out of the <script> tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type Props = { data: unknown };
function LdScript({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json(data) }}
    />
  );
}

/**
 * EducationalOrganization — the one durable identity document for the
 * school. Mounted once in the root layout so every page serves it.
 * Google treats this as the primary signal for Knowledge Panel + sitelinks.
 */
export function EducationalOrganizationLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${APP_URL}/#school`,
    name: SCHOOL.name,
    alternateName: SCHOOL.shortName,
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    image: `${APP_URL}/opengraph-image`,
    slogan: SCHOOL.tagline,
    foundingDate: String(SCHOOL.founded),
    description: `${SCHOOL.name} — a co-educational ICSE school in Kingston, Rhenock, Pakyong District, Sikkim. Founded in ${SCHOOL.founded} under the Roman Catholic Diocese of Darjeeling–Sikkim. Nursery through Class XII (Science), English medium.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kingston",
      addressLocality: "Rhenock",
      addressRegion: "Sikkim",
      addressCountry: "IN",
      postalCode: "737133",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "admissions",
        email: SCHOOL.email,
        telephone: SCHOOL.phone,
        availableLanguage: ["en", "ne", "hi"],
        areaServed: "IN",
      },
    ],
    sameAs: [
      SCHOOL.social.facebook,
      SCHOOL.social.instagram,
      SCHOOL.social.youtube,
    ].filter(Boolean),
    parentOrganization: {
      "@type": "Organization",
      name: "Roman Catholic Diocese of Darjeeling–Sikkim",
    },
  };
  return <LdScript data={data} />;
}

/**
 * WebSite entity — enables Google's sitelinks search box in some locales
 * and clarifies the canonical name for the site.
 */
export function WebSiteLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${APP_URL}/#website`,
    name: SCHOOL.name,
    alternateName: SCHOOL.shortName,
    url: APP_URL,
    publisher: { "@id": `${APP_URL}/#school` },
    inLanguage: "en-IN",
  };
  return <LdScript data={data} />;
}

type Crumb = { name: string; url: string };

/**
 * BreadcrumbList — tells Google the page's position in the site hierarchy.
 * Used on every inner page (home auto-breadcrumbs to itself; skip it there).
 * Pass absolute paths (/about, /academics) — we'll prefix APP_URL.
 */
export function BreadcrumbLd({ items }: { items: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http") ? c.url : `${APP_URL}${c.url}`,
    })),
  };
  return <LdScript data={data} />;
}
