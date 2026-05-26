/**
 * Central registry of every CMS-managed image on the public website.
 *
 * Each slot has a stable `key` (used as `website_content.section_key`),
 * a human label shown in /admin/cms, and a `fallback` URL used when no
 * custom image is saved in the DB.
 *
 * Add a slot here → it shows up in the CMS UI and the corresponding
 * public-page render must read it via `getCmsSections([...keys])` and
 * fall back to the URL exported here.
 */

export type ImageSlot = {
  key: string;
  label: string;
  fallback: string;
};

export type ImagePageGroup = {
  pageId: string;
  pageLabel: string;
  slots: ImageSlot[];
};

export const IMAGE_PAGES: ImagePageGroup[] = [
  {
    pageId: "home",
    pageLabel: "Homepage",
    slots: [
      {
        key: "home_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811206/website/fallbacks/home_hero_image.jpg",
      },
      {
        key: "home_campus_image",
        label: "Campus scroll image",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811210/website/fallbacks/home_campus_image.jpg",
      },
      {
        key: "home_principal_image",
        label: "Principal portrait",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811213/website/fallbacks/home_principal_image.jpg",
      },
      {
        key: "home_gallery_1",
        label: "Gallery preview · 1",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811215/website/fallbacks/home_gallery_1.jpg",
      },
      {
        key: "home_gallery_2",
        label: "Gallery preview · 2",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811216/website/fallbacks/home_gallery_2.jpg",
      },
      {
        key: "home_gallery_3",
        label: "Gallery preview · 3",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811228/website/fallbacks/home_gallery_3.jpg",
      },
      {
        key: "home_gallery_4",
        label: "Gallery preview · 4",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811229/website/fallbacks/home_gallery_4.jpg",
      },
      {
        key: "home_gallery_5",
        label: "Gallery preview · 5",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811231/website/fallbacks/home_gallery_5.jpg",
      },
      {
        key: "home_admissions_cta_image",
        label: "Admissions CTA",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811232/website/fallbacks/home_admissions_cta_image.jpg",
      },
    ],
  },
  {
    pageId: "about",
    pageLabel: "About Page",
    slots: [
      {
        key: "about_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811234/website/fallbacks/about_hero_image.jpg",
      },
      {
        key: "about_story_image",
        label: "Our story",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811237/website/fallbacks/about_story_image.jpg",
      },
      {
        key: "about_principal_image",
        label: "Principal photo",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811239/website/fallbacks/about_principal_image.jpg",
      },
      {
        key: "about_library_image",
        label: "Library",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811241/website/fallbacks/about_library_image.jpg",
      },
      {
        key: "about_facilities_image",
        label: "Facilities",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811243/website/fallbacks/about_facilities_image.jpg",
      },
    ],
  },
  {
    pageId: "academics",
    pageLabel: "Academics Page",
    slots: [
      {
        key: "academics_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811245/website/fallbacks/academics_hero_image.jpg",
      },
      {
        key: "academics_preprimary_image",
        label: "Pre-Primary",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811247/website/fallbacks/academics_preprimary_image.jpg",
      },
      {
        key: "academics_primary_image",
        label: "Primary",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811249/website/fallbacks/academics_primary_image.jpg",
      },
      {
        key: "academics_middle_image",
        label: "Middle School",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811250/website/fallbacks/academics_middle_image.jpg",
      },
      {
        key: "academics_secondary_image",
        label: "Secondary",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811252/website/fallbacks/academics_secondary_image.jpg",
      },
      {
        key: "academics_senior_image",
        label: "Senior Secondary",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811253/website/fallbacks/academics_senior_image.jpg",
      },
    ],
  },
  {
    pageId: "campus-life",
    pageLabel: "Campus Life Page",
    slots: [
      {
        key: "campus_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811255/website/fallbacks/campus_hero_image.jpg",
      },
      {
        key: "campus_sports_image",
        label: "Sports",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811257/website/fallbacks/campus_sports_image.jpg",
      },
      {
        key: "campus_events_image",
        label: "Events",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811260/website/fallbacks/campus_events_image.jpg",
      },
      {
        key: "campus_clubs_image",
        label: "Clubs",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811267/website/fallbacks/campus_clubs_image.jpg",
      },
      {
        key: "campus_activities_image",
        label: "Activities",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811269/website/fallbacks/campus_activities_image.jpg",
      },
      {
        key: "campus_cultural_image",
        label: "Cultural",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811271/website/fallbacks/campus_cultural_image.jpg",
      },
      {
        key: "campus_student_image",
        label: "Student life",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811274/website/fallbacks/campus_student_image.jpg",
      },
    ],
  },
  {
    pageId: "admissions",
    pageLabel: "Admissions Page",
    slots: [
      {
        key: "admissions_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811284/website/fallbacks/admissions_hero_image.jpg",
      },
      {
        key: "admissions_cta_image",
        label: "CTA image",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811286/website/fallbacks/admissions_cta_image.jpg",
      },
    ],
  },
  {
    pageId: "gallery",
    pageLabel: "Gallery Page",
    slots: [
      {
        key: "gallery_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811288/website/fallbacks/gallery_hero_image.jpg",
      },
    ],
  },
  {
    pageId: "notices",
    pageLabel: "Notices Page",
    slots: [
      {
        key: "notices_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811290/website/fallbacks/notices_hero_image.jpg",
      },
    ],
  },
  {
    pageId: "alumni",
    pageLabel: "Alumni Page",
    slots: [
      {
        key: "alumni_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811292/website/fallbacks/alumni_hero_image.jpg",
      },
      {
        key: "alumni_network_image",
        label: "Network image",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811296/website/fallbacks/alumni_network_image.jpg",
      },
    ],
  },
  {
    pageId: "contact",
    pageLabel: "Contact Page",
    slots: [
      {
        key: "contact_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811298/website/fallbacks/contact_hero_image.jpg",
      },
      {
        key: "contact_visit_image",
        label: "Visit us",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811300/website/fallbacks/contact_visit_image.jpg",
      },
    ],
  },
  {
    pageId: "results",
    pageLabel: "Results Page",
    slots: [
      {
        key: "results_hero_image",
        label: "Hero background",
        fallback:
          "https://res.cloudinary.com/dwzn69084/image/upload/v1779811302/website/fallbacks/results_hero_image.jpg",
      },
    ],
  },
];

export const ALL_IMAGE_KEYS: string[] = IMAGE_PAGES.flatMap((p) =>
  p.slots.map((s) => s.key),
);

const FALLBACK_MAP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  IMAGE_PAGES.forEach((p) => p.slots.forEach((s) => (m[s.key] = s.fallback)));
  return m;
})();

/** Return the saved CMS image for `key`, or its hardcoded fallback URL. */
export function resolveImage(
  key: string,
  saved?: { image_url: string | null } | null,
): string {
  return saved?.image_url || FALLBACK_MAP[key] || "";
}

/** Look up the fallback URL for a key (no DB read). */
export function imageFallback(key: string): string {
  return FALLBACK_MAP[key] || "";
}
