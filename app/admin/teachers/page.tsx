import Link from "next/link";
import { Search, Mail, Phone } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewTeacherDialog } from "@/components/admin/new-teacher-dialog";
import { TeacherActions } from "@/components/admin/teacher-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type TeacherRow = {
  id: string;
  full_name: string;
  invited_email: string | null;
  employee_code: string | null;
  phone: string | null;
  qualification: string | null;
  date_of_joining: string;
  is_active: boolean;
  user_id: string | null;
  photo_url: string | null;
};

async function getTeachers(): Promise<TeacherRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("teachers")
      .select(
        "id,full_name,invited_email,employee_code,phone,qualification,date_of_joining,is_active,user_id,photo_url",
      )
      .order("full_name", { ascending: true })
      .limit(200);
    return (data as TeacherRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <>
      <TopNav title="Teachers" subtitle="Manage faculty and class assignments" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, email, or employee code"
              className="h-10 w-96 pl-9"
            />
          </div>
          <NewTeacherDialog />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          {teachers.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No teachers yet.{" "}
              <span className="font-medium text-slate-700">Click "Invite teacher"</span>{" "}
              to add one. They'll get teacher access on first Google login.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-slate-900">
                      <Link href={`/admin/teachers/${t.id}`} className="hover:text-primary">
                        {t.full_name}
                      </Link>
                      {t.qualification && (
                        <p className="text-xs text-slate-500">{t.qualification}</p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {t.employee_code ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {t.invited_email ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {t.invited_email}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {t.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {t.phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(t.date_of_joining)}
                    </TableCell>
                    <TableCell>
                      {t.is_active ? (
                        t.user_id ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="warning">Invited</Badge>
                        )
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <TeacherActions id={t.id} isActive={t.is_active} />
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
