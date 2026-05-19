import { ClipboardCheck, FileBarChart, Megaphone } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ChildRow = {
  id: string;
  admission_number: string;
  full_name: string;
  roll_number: string | null;
  status: string;
};

async function getChildren(userId: string | undefined): Promise<ChildRow[]> {
  if (!userId) return [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!parent) return [];
    const { data } = await supabase
      .from("students")
      .select("id,admission_number,full_name,roll_number,status")
      .eq("parent_id", (parent as { id: string }).id);
    return (data as ChildRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function ParentDashboardPage() {
  const user = await getAuthUser();
  const children = await getChildren(user?.dbUser?.id);

  return (
    <>
      <TopNav
        title={`Hello, ${user?.dbUser?.full_name?.split(" ")[0] ?? "Parent"}`}
        subtitle="A snapshot of your children's school activity"
      />
      <div className="space-y-8 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Attendance · this month" value="96%" icon={ClipboardCheck} delta={{ value: "On track", positive: true }} />
          <StatCard label="Latest result" value="Published" icon={FileBarChart} hint="Mid-Term 2026" />
          <StatCard label="New notices" value="3" icon={Megaphone} hint="In the past 7 days" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your children</CardTitle>
            <CardDescription>Tap a child to see attendance, results, and notices.</CardDescription>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                We couldn't find any children linked to your account yet. Please contact the office to link your student.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {children.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-display">
                          {initials(c.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.full_name}</p>
                        <p className="font-mono text-xs text-slate-500">{c.admission_number}</p>
                      </div>
                    </div>
                    <Badge variant={c.status === "active" ? "success" : "secondary"}>{c.status}</Badge>
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
