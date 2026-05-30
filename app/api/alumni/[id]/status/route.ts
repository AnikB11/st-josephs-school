import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), reason: z.string().max(500).optional().nullable() }),
]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireRole("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: alumnus } = await supabase
    .from("alumni")
    .select("id, email, full_name, photo_url, user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!alumnus) {
    return NextResponse.json({ error: "Alumni record not found." }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (parsed.data.action === "approve") {
    let userId = (alumnus as { user_id: string | null }).user_id;
    const email = ((alumnus as { email: string | null }).email ?? "").toLowerCase();
    const fullName = (alumnus as { full_name: string }).full_name;
    const photoUrl = (alumnus as { photo_url: string | null }).photo_url;

    // Bootstrap / link public.users row with role=alumni so first sign-in lands clean.
    if (!userId && email) {
      // Find the Supabase auth user that the request flow created (if any).
      let authUserId: string | null = null;
      const { data: list } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      authUserId =
        list?.users.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (existingUser) {
        userId = (existingUser as { id: string }).id;
        await supabase
          .from("users")
          .update({ role: "alumni", auth_user_id: authUserId ?? undefined })
          .eq("id", userId);
      } else {
        const { data: created, error: createErr } = await supabase
          .from("users")
          .insert({
            auth_user_id: authUserId,
            email,
            full_name: fullName,
            avatar_url: photoUrl,
            role: "alumni",
          })
          .select("id")
          .single();
        if (createErr) {
          console.error("approve: create users row", createErr);
          return NextResponse.json({ error: "Could not link user account." }, { status: 500 });
        }
        userId = (created as { id: string }).id;
      }
    }

    const { error: updateErr } = await supabase
      .from("alumni")
      .update({
        status: "approved",
        approved_at: now,
        rejected_at: null,
        rejection_reason: null,
        is_public: true,
        user_id: userId,
      })
      .eq("id", id);
    if (updateErr) {
      console.error("approve: update alumni", updateErr);
      return NextResponse.json({ error: "Could not approve request." }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      actor_id: user.dbUser?.id ?? null,
      action: "alumni.approve",
      entity_type: "alumni",
      entity_id: id,
    });

    return NextResponse.json({ ok: true });
  }

  // reject
  const { error: rejectErr } = await supabase
    .from("alumni")
    .update({
      status: "rejected",
      rejected_at: now,
      rejection_reason: parsed.data.reason ?? null,
      is_public: false,
    })
    .eq("id", id);
  if (rejectErr) {
    console.error("reject: update alumni", rejectErr);
    return NextResponse.json({ error: "Could not reject request." }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.dbUser?.id ?? null,
    action: "alumni.reject",
    entity_type: "alumni",
    entity_id: id,
    metadata: { reason: parsed.data.reason ?? null },
  });

  return NextResponse.json({ ok: true });
}
