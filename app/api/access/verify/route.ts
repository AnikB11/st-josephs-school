import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_TTL,
  signStudentSession,
  type StudentAudience,
} from "@/lib/student-session";
import { clientKey, hitRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  admissionNumber: z.string().min(1).max(40),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD"),
  audience: z.enum(["student", "parent"]),
});

const RATE_LIMIT = { max: 5, windowMs: 60_000 }; // 5 attempts / minute / IP

export async function POST(req: Request) {
  const ipKey = clientKey(req);
  const rl = hitRateLimit(`access:${ipKey}`, RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429, headers: { "retry-after": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admissionNumber = parsed.data.admissionNumber.trim();
  const dob = parsed.data.dob;
  const audience: StudentAudience = parsed.data.audience;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("id,admission_number,full_name,date_of_birth,status")
    .eq("admission_number", admissionNumber)
    .eq("date_of_birth", dob)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    // Same vague error for both "not found" and "wrong DOB" — don't leak
    // which admission numbers exist.
    return NextResponse.json(
      { error: "Admission number and date of birth don't match an active student." },
      { status: 401 },
    );
  }

  const row = data as {
    id: string;
    admission_number: string;
    full_name: string;
    date_of_birth: string;
    status: string;
  };

  const token = await signStudentSession({
    studentId: row.id,
    admissionNumber: row.admission_number,
    fullName: row.full_name,
    audience,
  });

  const jar = await cookies();
  jar.set(STUDENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STUDENT_SESSION_TTL,
  });

  return NextResponse.json({
    ok: true,
    studentId: row.id,
    fullName: row.full_name,
    audience,
    redirectTo: audience === "parent" ? "/parent" : "/student",
  });
}
