import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/site/hero";
import { SCHOOL } from "@/lib/constants";

// Edge-cached for 60s; CMS publishes invalidate via revalidateTag from the
// admin write paths. First request rebuilds in the background; everyone else
// serves the cached HTML in ~50ms instead of paying a full SSR + Supabase
// round-trip per visit.
export const revalidate = 60;

export const metadata: Metadata = {
  // Keep the default title (set in root layout's `title.default`) rather
  // than overriding here — the homepage benefits from the full school
  // name + tagline as its tab/search title.
  title: {
    absolute: `${SCHOOL.name} — ${SCHOOL.tagline} | ICSE School in Rhenock, Sikkim`,
  },
  description: `${SCHOOL.name} — a co-educational ICSE school in Kingston, Rhenock, Sikkim. Nursery through Class XII (Science), English medium, under the Roman Catholic Diocese of Darjeeling–Sikkim. Admissions open.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SCHOOL.name} — ${SCHOOL.tagline}`,
    description: `A co-educational ICSE school in the hills of Rhenock, Sikkim — Nursery to Class XII (Science), English medium, since ${SCHOOL.founded}.`,
    url: "/",
    type: "website",
  },
};
import { Stats } from "@/components/site/stats";
import { WhyStJosephs } from "@/components/site/why-stjosephs";
import { PrincipalMessage } from "@/components/site/principal-message";
import { SectionSkeleton } from "@/components/site/section-skeleton";
import { getCmsSections } from "@/lib/cms";
import { resolveImage } from "@/lib/cms-images";

// Below-the-fold: dynamically imported so they don't block initial paint.
const CampusScroll = dynamic(
  () => import("@/components/site/campus-scroll").then((m) => m.CampusScroll),
  { loading: () => <SectionSkeleton /> },
);
const NoticesPreview = dynamic(
  () => import("@/components/site/notices-preview").then((m) => m.NoticesPreview),
  { loading: () => <SectionSkeleton /> },
);
const EventsPreview = dynamic(
  () => import("@/components/site/events-preview").then((m) => m.EventsPreview),
  { loading: () => <SectionSkeleton /> },
);
const GalleryPreview = dynamic(
  () => import("@/components/site/gallery-preview").then((m) => m.GalleryPreview),
  { loading: () => <SectionSkeleton /> },
);
const Testimonials = dynamic(
  () => import("@/components/site/testimonials").then((m) => m.Testimonials),
  { loading: () => <SectionSkeleton /> },
);
const AdmissionsCta = dynamic(
  () => import("@/components/site/admissions-cta").then((m) => m.AdmissionsCta),
  { loading: () => <SectionSkeleton /> },
);

const HOME_IMAGE_KEYS = [
  "home_hero_image",
  "home_campus_image",
  "home_principal_image",
  "home_gallery_1",
  "home_gallery_2",
  "home_gallery_3",
  "home_gallery_4",
  "home_gallery_5",
  "home_admissions_cta_image",
];

export default async function HomePage() {
  const cms = await getCmsSections([
    "hero_headline",
    "principal_message",
    ...HOME_IMAGE_KEYS,
  ]);

  const galleryImages = [
    resolveImage("home_gallery_1", cms.home_gallery_1),
    resolveImage("home_gallery_2", cms.home_gallery_2),
    resolveImage("home_gallery_3", cms.home_gallery_3),
    resolveImage("home_gallery_4", cms.home_gallery_4),
    resolveImage("home_gallery_5", cms.home_gallery_5),
  ];

  return (
    <>
      <Hero
        headline={cms.hero_headline.title}
        subhead={cms.hero_headline.body}
        image={resolveImage("home_hero_image", cms.home_hero_image)}
      />
      <Stats />
      <WhyStJosephs />
      <CampusScroll image={resolveImage("home_campus_image", cms.home_campus_image)} />
      <PrincipalMessage
        title={cms.principal_message.title}
        body={cms.principal_message.body}
        image={resolveImage("home_principal_image", cms.home_principal_image)}
      />
      <NoticesPreview />
      <EventsPreview />
      <GalleryPreview images={galleryImages} />
      <Testimonials />
      <AdmissionsCta
        image={resolveImage("home_admissions_cta_image", cms.home_admissions_cta_image)}
      />
    </>
  );
}
