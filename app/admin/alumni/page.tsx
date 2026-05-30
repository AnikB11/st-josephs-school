import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlumniDialog, type AlumniInput } from "@/components/admin/alumni-dialog";
import { AlumniActions } from "@/components/admin/alumni-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { initials } from "@/lib/utils";
import type { AlumniStatus } from "@/types/database";

export const dynamic = "force-dynamic";

type AdminAlumnus = AlumniInput & {
  status: AlumniStatus;
  requested_at: string | null;
  rejection_reason: string | null;
};

const TABS: { key: AlumniStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

async function getAlumni(status: AlumniStatus | "all"): Promise<AdminAlumnus[]> {
  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("alumni")
      .select(
        "id,full_name,graduation_year,current_position,current_company,bio,photo_url,linkedin_url,email,is_public,status,requested_at,rejection_reason",
      )
      .order("requested_at", { ascending: false, nullsFirst: false })
      .order("graduation_year", { ascending: false })
      .limit(200);
    if (status !== "all") query = query.eq("status", status);
    const { data } = await query;
    return ((data as AdminAlumnus[] | null) ?? []);
  } catch {
    return [];
  }
}

async function getCounts(): Promise<Record<AlumniStatus | "all", number>> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("alumni").select("status");
  const rows = (data as { status: AlumniStatus }[] | null) ?? [];
  return {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    all: rows.length,
  };
}

function statusBadge(status: AlumniStatus) {
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "approved") return <Badge variant="success">Approved</Badge>;
  return <Badge variant="destructive">Rejected</Badge>;
}

export default async function AlumniAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status: AlumniStatus | "all" =
    statusParam === "approved" || statusParam === "rejected" || statusParam === "all"
      ? statusParam
      : "pending";

  const [alumni, counts] = await Promise.all([getAlumni(status), getCounts()]);

  return (
    <>
      <TopNav title="Alumni" subtitle="Review access requests and manage alumni profiles" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => {
              const active = tab.key === status;
              const count = counts[tab.key] ?? 0;
              return (
                <Link
                  key={tab.key}
                  href={`/admin/alumni?status=${tab.key}`}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition " +
                    (active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                  }
                >
                  {tab.label}
                  <span className={"ml-1.5 " + (active ? "text-slate-300" : "text-slate-400")}>
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search alumni" className="h-10 w-72 pl-9" />
            </div>
            <AlumniDialog mode="create" />
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          {alumni.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              {status === "pending"
                ? "No pending alumni requests."
                : status === "rejected"
                  ? "No rejected requests."
                  : "No alumni records yet. Click Add alumnus to create one, or wait for self-service requests."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role / Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumni.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {a.photo_url ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                            <Image
                              src={a.photo_url}
                              alt={a.full_name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-display">
                              {initials(a.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="font-medium text-slate-900">{a.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{a.graduation_year}</TableCell>
                    <TableCell className="text-slate-600">{a.email ?? "—"}</TableCell>
                    <TableCell className="text-slate-600">
                      {[a.current_position, a.current_company].filter(Boolean).join(" · ") || "—"}
                    </TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell>
                      <AlumniActions alumnus={a} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </>
  );
}
