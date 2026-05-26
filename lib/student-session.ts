import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "sjs_student_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h
const ISSUER = "sjs-school";

export type StudentAudience = "student" | "parent";

export type StudentSession = {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  audience: StudentAudience;
  // standard JWT claims
  exp: number;
  iat: number;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "STUDENT_SESSION_SECRET env var is required (>=32 chars) for student/parent sessions",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signStudentSession(payload: {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  audience: StudentAudience;
}): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({
    sub: payload.studentId,
    admissionNumber: payload.admissionNumber,
    fullName: payload.fullName,
    audience: payload.audience,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function verifyStudentSessionToken(token: string): Promise<StudentSession | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, { issuer: ISSUER });
    if (typeof payload.sub !== "string") return null;
    return {
      studentId: payload.sub,
      admissionNumber: String(payload.admissionNumber ?? ""),
      fullName: String(payload.fullName ?? ""),
      audience: (payload.audience as StudentAudience) === "parent" ? "parent" : "student",
      exp: Number(payload.exp ?? 0),
      iat: Number(payload.iat ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Read + verify the session cookie from the current request.
 * Cached for the lifetime of the React render so multiple page
 * sections can call it without re-verifying.
 */
export const getStudentSession = cache(
  async function getStudentSession(): Promise<StudentSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyStudentSessionToken(token);
  },
);

export const STUDENT_SESSION_COOKIE = COOKIE_NAME;
export const STUDENT_SESSION_TTL = SESSION_TTL_SECONDS;
