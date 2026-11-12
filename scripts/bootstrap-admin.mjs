// One-off: provision the first admin. Uses the service-role key to create
// a Supabase auth user and a matching public.users row with role='admin'.
// Prints the generated password ONCE — change it after first login.

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

function loadEnv(file) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* no file is fine if env is already set */
  }
}
loadEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const email =
  process.argv[2] ?? process.env.ADMIN_BOOTSTRAP_EMAIL ?? "";
if (!email.includes("@")) {
  console.error("Usage: node scripts/bootstrap-admin.mjs <email> [password]");
  console.error("Or set ADMIN_BOOTSTRAP_EMAIL in .env.local");
  process.exit(1);
}

const password =
  process.argv[3] ??
  // 24 url-safe chars from 18 random bytes — ~144 bits of entropy.
  randomBytes(18).toString("base64url");

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Create (or find) the auth user.
  let authUserId;
  const created = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Administrator", bootstrap: true },
  });

  if (created.error) {
    const msg = (created.error.message ?? "").toLowerCase();
    if (!msg.includes("already")) throw created.error;
    // User exists — reset password instead so the operator can get in.
    const listed = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listed.error) throw listed.error;
    const existing = listed.data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!existing) throw new Error("auth user exists but not visible on page 1");
    authUserId = existing.id;
    const upd = await sb.auth.admin.updateUserById(authUserId, { password });
    if (upd.error) throw upd.error;
    console.log("(auth user existed — password reset)");
  } else {
    authUserId = created.data.user.id;
  }

  // 2. Create or update the public.users row. We can't rely on a single
  // upsert onConflict target because the table has unique constraints on
  // both `auth_user_id` and `email` — a stale row from the pre-Supabase
  // era may already exist with email set but auth_user_id null.
  const existingByEmail = await sb
    .from("users")
    .select("id,email,role,auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (existingByEmail.error) throw existingByEmail.error;

  let upsert;
  if (existingByEmail.data) {
    upsert = await sb
      .from("users")
      .update({
        auth_user_id: authUserId,
        full_name: "Administrator",
        role: "admin",
      })
      .eq("id", existingByEmail.data.id)
      .select("id,email,role")
      .single();
  } else {
    upsert = await sb
      .from("users")
      .insert({
        auth_user_id: authUserId,
        email,
        full_name: "Administrator",
        role: "admin",
      })
      .select("id,email,role")
      .single();
  }

  if (upsert.error) throw upsert.error;

  console.log("");
  console.log("=== ADMIN READY ===");
  console.log("email:    ", email);
  console.log("password: ", password);
  console.log("public.users.id:", upsert.data.id);
  console.log("role:     ", upsert.data.role);
  console.log("");
  console.log("Sign in at https://st-josephs-school-z6su.vercel.app/login");
  console.log("Change the password immediately after first login.");
}

main().catch((err) => {
  console.error("bootstrap failed:", err.message ?? err);
  process.exit(1);
});
