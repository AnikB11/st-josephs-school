import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone, Facebook, Instagram, Youtube } from "lucide-react";
import { SCHOOL, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="container-wide py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-display text-base font-semibold text-slate-900">
                {SCHOOL.shortName}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              {SCHOOL.tagline}. Nurturing minds since {SCHOOL.founded}.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a aria-label="Facebook" href={SCHOOL.social.facebook} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary">
                <Facebook className="h-4 w-4" />
              </a>
              <a aria-label="Instagram" href={SCHOOL.social.instagram} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
              <a aria-label="YouTube" href={SCHOOL.social.youtube} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Quick links</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-600 hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Portals</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/login" className="text-slate-600 hover:text-primary">Parent Login</Link></li>
              <li><Link href="/login" className="text-slate-600 hover:text-primary">Alumni Login</Link></li>
              <li><Link href="/results" className="text-slate-600 hover:text-primary">Check Result</Link></li>
              <li><Link href="/admissions" className="text-slate-600 hover:text-primary">Apply Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Reach us</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                <span>{SCHOOL.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400" />
                <a href={`tel:${SCHOOL.phone}`} className="hover:text-primary">{SCHOOL.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${SCHOOL.email}`} className="hover:text-primary">{SCHOOL.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
