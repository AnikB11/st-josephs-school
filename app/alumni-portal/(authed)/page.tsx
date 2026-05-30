import { TopNav } from "@/components/dashboard/topnav";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AlumniProfileForm } from "@/components/alumni/profile-form";

export default async function AlumniPortalPage() {
  const user = await getAuthUser();

  /* Try to load an existing alumni record for this user */
  let existing = null;
  if (user?.dbUser?.id) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase
        .from("alumni")
        .select("*")
        .eq("user_id", user.dbUser.id)
        .maybeSingle();
      existing = data;
    } catch {
      /* ignore — first-time user */
    }
  }

  return (
    <>
      <TopNav
        title={`Welcome back, ${user?.dbUser?.full_name?.split(" ")[0] ?? "Alumnus"}`}
        subtitle="Update your profile, find batchmates, and stay connected"
      />
      <div className="space-y-6 px-6 py-8 max-w-3xl">
        <AlumniProfileForm
          userId={user?.dbUser?.id ?? null}
          defaultName={user?.dbUser?.full_name ?? ""}
          existing={existing}
        />
      </div>
    </>
  );
}
