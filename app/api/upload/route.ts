import { NextResponse } from "next/server";
import { uploadToCloudinary, validateUpload } from "@/lib/cloudinary";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireRole("admin");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
