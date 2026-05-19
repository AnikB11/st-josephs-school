import Image from "next/image";
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

export const dynamic = "force-dynamic";

async function getAlumni(): Promise<AlumniInput[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("alumni")
      .select(
        "id,full_name,graduation_year,current_position,current_company,bio,photo_url,linkedin_url,email,is_public",
      )
      .order("graduation_year", { ascending: false })
      .limit(200);
    return ((data as AlumniInput[] | null) ?? []);
  } catch {
    return [];
  }
}

export default async function AlumniAdminPage() {
  const alumni = await getAlumni();

  return (
    <>
      <TopNav title="Alumni" subtitle="Manage alumni profiles and visibility" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search alumni" className="h-10 w-80 pl-9" />
          </div>
          <AlumniDialog mode="create" />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          {alumni.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No alumni records yet. Click <span className="font-medium text-slate-700">Add alumnus</span> to create the first profile, or run the promotion engine on Class 12 with "Create alumni records" enabled.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Visibility</TableHead>
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
                    <TableCell className="text-slate-600">{a.current_position ?? "—"}</TableCell>
                    <TableCell className="text-slate-600">{a.current_company ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={a.is_public ? "success" : "secondary"}>
                        {a.is_public ? "Public" : "Hidden"}
                      </Badge>
                    </TableCell>
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
