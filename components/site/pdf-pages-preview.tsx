"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

/**
 * Build a Cloudinary URL that renders page <page> of a PDF as PNG.
 * Returns null for non-Cloudinary URLs (cannot rasterize).
 *
 * Cloudinary delivery URL grammar: transforms slot in right after `/upload/`,
 * `pg_<N>` extracts page N, `w_<N>` resizes, `q_auto` picks quality, and
 * swapping the `.pdf` extension for `.png` tells the CDN what to return.
 */
function pdfPagePngUrl(pdfUrl: string, page = 1, width = 1400): string | null {
  if (!/^https?:\/\/res\.cloudinary\.com\//.test(pdfUrl)) return null;
  const transforms = `pg_${page},w_${width},q_auto`;
  return pdfUrl
    .replace(/(\/upload\/)/, `$1${transforms}/`)
    .replace(/\.pdf(\?.*)?$/i, ".png$1");
}

/**
 * Render every page of a PDF as a stack of PNG images. The page count isn't
 * stored anywhere, so we optimistically try 1..maxPages and hide whichever
 * pages fail to load (Cloudinary returns 4xx for `pg_<N>` past the last
 * page). The result is a clean vertical strip of just the real pages.
 */
export function PdfPagesPreview({
  pdfUrl,
  maxPages = 6,
  width = 1400,
}: {
  pdfUrl: string;
  maxPages?: number;
  width?: number;
}) {
  const [missing, setMissing] = useState<Set<number>>(() => new Set());
  const [loadedAny, setLoadedAny] = useState(false);

  const pages = Array.from({ length: maxPages }, (_, i) => i + 1).filter(
    (p) => !missing.has(p),
  );

  function markMissing(page: number) {
    setMissing((prev) => {
      const next = new Set(prev);
      next.add(page);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {!loadedAny && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-sm text-slate-400">
          <FileText className="h-6 w-6 text-slate-300" />
          Rendering report card preview…
        </div>
      )}
      {pages.map((page) => {
        const src = pdfPagePngUrl(pdfUrl, page, width);
        if (!src) return null;
        return (
          // Using <img> rather than next/image so the per-page onError can
          // gracefully drop pages that don't exist past the PDF's last page.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={page}
            src={src}
            alt={`Page ${page}`}
            loading="lazy"
            onLoad={() => setLoadedAny(true)}
            onError={() => markMissing(page)}
            className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm"
          />
        );
      })}
    </div>
  );
}
