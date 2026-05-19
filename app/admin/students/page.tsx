import Link from "next/link";
import { Search } from "lucide-react";
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
import { NewStudentDialog } from "@/components/admin/new-student-dialog";
import { StudentActions } from "@/components/admin/student-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StudentRow = {
  id: string;
  admission_number: string;
  roll_number: string | null;
  full_name: string;
  date_of_birth: string;
  status: string;
  admission_date: string;
  class_id: string | null;
  classes: { grade: string; section: string } | null;
};

async function getStudents(): Promise<StudentRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("students")
      .select(
        "id,admission_number,roll_number,full_name,date_of_birth,status,admission_date,class_id,classes(grade,section)",
      )
      .order("admission_number", { ascending: false })
      .limit(200);
    return (data as unknown as StudentRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <>
      <TopNav title="Students" subtitle="Manage your student roster" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by name or admission number" className="h-10 w-80 pl-9" />
          </div>
          <NewStudentDialog />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          {students.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No students yet.{" "}
              <span className="font-medium text-slate-700">Click "Add student"</span> to admit your first.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Admitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-slate-700">
                      <Link href={`/admin/students/${s.id}`} className="hover:text-primary">
                        {s.admission_number}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      <Link href={`/admin/students/${s.id}`} className="hover:text-primary">
                        {s.full_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {s.classes ? `${s.classes.grade} · ${s.classes.section}` : "—"}
                    </TableCell>
                    <TableCell className="text-slate-600">{s.roll_number ?? "—"}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(s.admission_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "success" : "secondary"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StudentActions id={s.id} status={s.status} />
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
