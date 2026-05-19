import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm"];

export function validateUpload(file: { type: string; size: number }) {
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File exceeds 10MB limit" };
  }
  const allowed = [...ALLOWED_IMAGE, ...ALLOWED_VIDEO];
  if (!allowed.includes(file.type)) {
    return { ok: false, error: `Unsupported type: ${file.type}` };
  }
  return { ok: true as const };
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resource_type?: "image" | "video" | "auto" } = {},
) {
  const cld = getCloudinary();
  return await new Promise<{ secure_url: string; public_id: string; width?: number; height?: number }>(
    (resolve, reject) => {
      const upload = cld.uploader.upload_stream(
        {
          folder: options.folder ?? "school",
          resource_type: options.resource_type ?? "auto",
          quality: "auto:good",
          fetch_format: "auto",
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          });
        },
      );
      upload.end(buffer);
    },
  );
}

export function cldUrl(publicId: string, opts?: { w?: number; h?: number; q?: string }) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return publicId;
  const transforms: string[] = ["f_auto", `q_${opts?.q ?? "auto:good"}`];
  if (opts?.w) transforms.push(`w_${opts.w}`);
  if (opts?.h) transforms.push(`h_${opts.h}`);
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms.join(",")}/${publicId}`;
}
