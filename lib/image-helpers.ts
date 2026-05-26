/**
 * Cloudinary URL helpers for optimized image delivery.
 * All generated URLs include f_auto (format negotiation) and q_auto (quality).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Build an optimized Cloudinary delivery URL with automatic format and quality.
 * Falls back to the raw URL when Cloudinary isn't configured.
 */
export function cldOptimizedUrl(
  urlOrPublicId: string,
  opts?: { w?: number; h?: number; q?: string },
): string {
  if (!CLOUD_NAME) return urlOrPublicId;

  // If it's already a full Cloudinary URL, inject transforms
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    // Insert f_auto,q_auto right after /upload/
    const transforms = buildTransforms(opts);
    return urlOrPublicId.replace(
      /\/upload\//,
      `/upload/${transforms}/`,
    );
  }

  // Treat as a public ID
  const transforms = buildTransforms(opts);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${urlOrPublicId}`;
}

function buildTransforms(opts?: { w?: number; h?: number; q?: string }): string {
  const parts: string[] = ["f_auto", `q_${opts?.q ?? "auto:good"}`];
  if (opts?.w) parts.push(`w_${opts.w}`);
  if (opts?.h) parts.push(`h_${opts.h}`);
  return parts.join(",");
}
