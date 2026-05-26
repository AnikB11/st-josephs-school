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
          "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "home_campus_image",
        label: "Campus scroll image",
        fallback:
          "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "home_principal_image",
        label: "Principal portrait",
        fallback:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
      },
      {
        key: "home_gallery_1",
        label: "Gallery preview · 1",
        fallback:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=70",
      },
      {
        key: "home_gallery_2",
        label: "Gallery preview · 2",
        fallback:
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=600&q=70",
      },
      {
        key: "home_gallery_3",
        label: "Gallery preview · 3",
        fallback:
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=70",
      },
      {
        key: "home_gallery_4",
        label: "Gallery preview · 4",
        fallback:
          "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=70",
      },
      {
        key: "home_gallery_5",
        label: "Gallery preview · 5",
        fallback:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=70",
      },
      {
        key: "home_admissions_cta_image",
        label: "Admissions CTA",
        fallback:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
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
          "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "about_story_image",
        label: "Our story",
        fallback:
          "https://images.unsplash.com/photo-1438565434616-3ef039228b15?auto=format&fit=crop&w=1600&q=80",
      },
      {
        key: "about_principal_image",
        label: "Principal photo",
        fallback:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=80",
      },
      {
        key: "about_library_image",
        label: "Library",
        fallback:
          "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1600&q=80",
      },
      {
        key: "about_facilities_image",
        label: "Facilities",
        fallback:
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1600&q=80",
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
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "academics_preprimary_image",
        label: "Pre-Primary",
        fallback:
          "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80",
      },
      {
        key: "academics_primary_image",
        label: "Primary",
        fallback:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80",
      },
      {
        key: "academics_middle_image",
        label: "Middle School",
        fallback:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80",
      },
      {
        key: "academics_secondary_image",
        label: "Secondary",
        fallback:
          "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1400&q=80",
      },
      {
        key: "academics_senior_image",
        label: "Senior Secondary",
        fallback:
          "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=80",
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
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "campus_sports_image",
        label: "Sports",
        fallback:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1800&q=80",
      },
      {
        key: "campus_events_image",
        label: "Events",
        fallback:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=80",
      },
      {
        key: "campus_clubs_image",
        label: "Clubs",
        fallback:
          "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1800&q=80",
      },
      {
        key: "campus_activities_image",
        label: "Activities",
        fallback:
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1800&q=80",
      },
      {
        key: "campus_cultural_image",
        label: "Cultural",
        fallback:
          "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1800&q=80",
      },
      {
        key: "campus_student_image",
        label: "Student life",
        fallback:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1800&q=80",
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
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "admissions_cta_image",
        label: "CTA image",
        fallback:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80",
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
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=2400&q=80",
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
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=2400&q=80",
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
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "alumni_network_image",
        label: "Network image",
        fallback:
          "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1800&q=80",
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
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=2400&q=80",
      },
      {
        key: "contact_visit_image",
        label: "Visit us",
        fallback:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80",
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
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=2400&q=80",
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
