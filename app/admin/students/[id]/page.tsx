import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Droplet } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StudentActions } from "@/components/admin/student-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StudentDetail = {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string | null;
  roll_number: string | null;
  status: string;
  admission_date: string;
  photo_url: string | null;
  blood_group: string | null;
  address: string | null;
  classes: { grade: string; section: string } | null;
  parents: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    occupation: string | null;
    address: string | null;
  } | null;
};

async function getStudent(id: string): Promise<StudentDetail | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("students")
      .select(
        "id,admission_number,full_name,date_of_birth,gender,roll_number,status,admission_date,photo_url,blood_group,address,classes(grade,section),parents(id,full_name,email,phone,occupation,address)",
      )
      .eq("id", id)
      .maybeSingle();
    return (data as unknown as StudentDetail | null) ?? null;
  } catch {
    return null;
  }
}

type AttendanceSummary = { present: number; absent: number; late: number; excused: number };

async function getAttendanceSummary(studentId: string): Promise<AttendanceSummary> {
  try {
    const supabase = createSupabaseAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId)
      .gte("date", since.toISOString().slice(0, 10));
    const rows = (data as { status: string }[] | null) ?? [];
    return rows.reduce<AttendanceSummary>(
      (acc, r) => {
        if (r.status in acc) acc[r.status as keyof AttendanceSummary]++;
        return acc;
      },
      { present: 0, absent: 0, late: 0, excused: 0 },
    );
  } catch {
    return { present: 0, absent: 0, late: 0, excused: 0 };
  }
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, attendance] = await Promise.all([
    getStudent(id),
    getAttendanceSummary(id),
  ]);
  if (!student) notFound();

  return (
    <>
      <TopNav title={student.full_name} subtitle={student.admission_number} />
      <div className="space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> All students
          </Link>
          <StudentActions id={student.id} status={student.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {student.photo_url ? (
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl ring-2 ring-slate-100">
                    <Image
                      src={student.photo_url}
                      alt={student.full_name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Avatar className="h-28 w-28 rounded-2xl">
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl font-display">
                      {initials(student.full_name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <h2 className="font-display mt-4 text-xl font-semibold text-slate-900">
                  {student.full_name}
                </h2>
                <p className="font-mono text-xs text-slate-500">{student.admission_number}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge variant={student.status === "active" ? "success" : "secondary"}>
                    {student.status}
                  </Badge>
                  {student.classes && (
                    <Badge variant="outline">
                      Class {student.classes.grade} · {student.classes.section}
                    </Badge>
                  )}
                  {student.roll_number && (
                    <Badge variant="secondary">Roll {student.roll_number}</Badge>
                  )}
                </div>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Born {formatDate(student.date_of_birth)}
                </div>
                {student.gender && (
                  <div className="flex items-center gap-2 text-slate-600 capitalize">
                    <span className="grid h-4 w-4 place-items-center text-slate-400">⚧</span>
                    {student.gender}
                  </div>
                )}
                {student.blood_group && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Droplet className="h-4 w-4 text-slate-400" />
                    {student.blood_group}
                  </div>
                )}
                {student.address && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{student.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="grid h-4 w-4 place-items-center text-slate-400">✓</span>
                  Admitted {formatDate(student.admission_date)}
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Parent / Guardian</CardTitle>
              </CardHeader>
              <CardContent>
                {student.parents ? (
                  <div className="space-y-3 text-sm">
                    <p className="font-medium text-slate-900">{student.parents.full_name}</p>
                    {student.parents.occupation && (
                      <p className="text-slate-500">{student.parents.occupation}</p>
                    )}
                    <div className="space-y-2">
                      {student.parents.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a href={`mailto:${student.parents.email}`} className="hover:text-primary">
                            {student.parents.email}
                          </a>
                        </div>
                      )}
                      {student.parents.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a href={`tel:${student.parents.phone}`} className="hover:text-primary">
                            {student.parents.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No parent linked.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance · last 30 days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl bg-emerald/5 p-4">
                    <p className="text-xs text-slate-500">Present</p>
                    <p className="font-display text-2xl font-semibold text-emerald">
                      {attendance.present}
                    </p>
                  </div>
                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="text-xs text-slate-500">Absent</p>
                    <p className="font-display text-2xl font-semibold text-red-500">
                      {attendance.absent}
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs text-slate-500">Late</p>
                    <p className="font-display text-2xl font-semibold text-amber-600">
                      {attendance.late}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Excused</p>
                    <p className="font-display text-2xl font-semibold text-slate-700">
                      {attendance.excused}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result history</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No published results yet. Once results are published from{" "}
                  <Link href="/admin/results" className="text-primary hover:underline">
                    Results
                  </Link>
                  , they'll appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
