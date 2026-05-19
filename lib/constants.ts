export const SCHOOL = {
  name: process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "St. Joseph's School",
  shortName: "St. Joseph's",
  tagline: "Where Tradition Meets Tomorrow",
  founded: 1965,
  address: "1 College Road, Hill Town, India",
  phone: "+91 11 0000 0000",
  email: "info@stjosephs.edu",
  admissionPrefix: process.env.NEXT_PUBLIC_ADMISSION_PREFIX ?? "SJR",
  social: {
    facebook: "https://facebook.com/stjosephs",
    instagram: "https://instagram.com/stjosephs",
    youtube: "https://youtube.com/@stjosephs",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/notices", label: "Notices" },
  { href: "/alumni", label: "Alumni" },
  { href: "/contact", label: "Contact" },
] as const;

export const ROLES = {
  ADMIN: "admin",
  PARENT: "parent",
  ALUMNI: "alumni",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
