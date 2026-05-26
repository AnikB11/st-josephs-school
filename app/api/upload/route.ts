import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteFromCloudinary,
  publicIdFromUrl,
  uploadToCloudinary,
  validateUpload,
} from "@/lib/cloudinary";
import { getAuthUser, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  // Any signed-in user can upload (admin/teacher/parent/student/alumni).
  // The dev bypass in lib/auth handles local development.
  if (process.env.NODE_ENV !== "development") {
    const user = await getAuthUser();
    if (!user?.dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const folder = (form.get("folder") as string) ?? "school";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const check = validateUpload({ type: file.type, size: file.size });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadToCloudinary(buf, { folder });

  return NextResponse.json({ ok: true, ...uploaded });
}

const deleteSchema = z.object({
  public_id: z.string().min(1).optional(),
  url: z.string().url().optional(),
});

export async function DELETE(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    const user = await requireRole("admin");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = deleteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success || (!parsed.data.public_id && !parsed.data.url)) {
    return NextResponse.json({ error: "public_id or url is required" }, { status: 400 });
  }

  const publicId = parsed.data.public_id ?? publicIdFromUrl(parsed.data.url ?? null);
  if (!publicId) {
    // Non-Cloudinary URL — no-op success so CMS clears can proceed.
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Guard: never delete shared fallback assets — they're used by every
  // CMS slot that hasn't been customised.
  if (publicId.startsWith("website/fallbacks/")) {
    return NextResponse.json(
      { error: "Refusing to delete shared fallback asset" },
      { status: 400 },
    );
  }

  try {
    const result = await deleteFromCloudinary(publicId);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("upload DELETE", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
