export const SCHOOL = {
  name: process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "St. Joseph's School, Kingston",
  shortName: "St. Joseph's",
  tagline: "Love & Service",
  founded: 1996,
  address:
    process.env.NEXT_PUBLIC_SCHOOL_ADDRESS ??
    "Kingston, P.O. Rhenock, Pakyong District, Sikkim",
  phone: process.env.NEXT_PUBLIC_SCHOOL_PHONE ?? "+91 3592 250 000",
  email: process.env.NEXT_PUBLIC_SCHOOL_EMAIL ?? "office@stjosephskingston.edu.in",
  admissionPrefix: process.env.NEXT_PUBLIC_ADMISSION_PREFIX ?? "SJK",
  social: {
    facebook: "https://facebook.com/stjosephskingston",
    instagram: "https://instagram.com/stjosephskingston",
    youtube: "https://youtube.com/@stjosephskingston",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/campus-life", label: "Campus Life" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/notices", label: "Notices" },
  { href: "/alumni", label: "Alumni" },
  { href: "/contact", label: "Contact" },
] as const;

export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  PARENT: "parent",
  ALUMNI: "alumni",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
