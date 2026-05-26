import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  auth_user_id: string | null;
};

export default async function AdminUsersPage() {
  const user = await requireRole("admin");
  if (!user) redirect("/login?role=admin");

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id,email,full_name,role,created_at,auth_user_id")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data as Row[] | null) ?? [];

  return (
    <>
      <TopNav title="Users" subtitle="Invite staff, teachers, and parents" />
      <div className="space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite a new user</CardTitle>
            <CardDescription>
              They'll get an email with a link to set their password and sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteUserForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Existing users ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No users yet — invite the first one above.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {r.full_name || r.email}
                      </p>
                      <p className="truncate text-xs text-slate-500">{r.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{r.role}</Badge>
                      <Badge variant={r.auth_user_id ? "success" : "outline"}>
                        {r.auth_user_id ? "active" : "invited"}
                      </Badge>
                      <span className="hidden text-xs text-slate-400 sm:inline">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
