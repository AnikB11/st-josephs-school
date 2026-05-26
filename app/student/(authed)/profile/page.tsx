import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getStudentSession } from "@/lib/student-session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StudentProfile = {
  id: string;
  admission_number: string;
  roll_number: string | null;
  full_name: string;
  date_of_birth: string;
  gender: string | null;
  status: string;
  admission_date: string;
  photo_url: string | null;
  blood_group: string | null;
  address: string | null;
  classes: { grade: string; section: string } | null;
  parents: { full_name: string; phone: string | null; email: string | null; occupation: string | null } | null;
};

async function getStudentProfile(studentId: string | null | undefined): Promise<StudentProfile | null> {
  if (!studentId) return null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("students")
      .select(
        "id,admission_number,roll_number,full_name,date_of_birth,gender,status,admission_date,photo_url,blood_group,address,classes(grade,section),parents(full_name,phone,email,occupation)"
      )
      .eq("id", studentId)
      .maybeSingle();
    return (data as unknown as StudentProfile | null) ?? null;
  } catch {
    return null;
  }
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-40 shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="text-sm text-slate-900">{value || "—"}</span>
    </div>
  );
}

export default async function StudentProfilePage() {
  const session = await getStudentSession();
  const student = await getStudentProfile(session?.studentId);

  if (!student) {
    return (
      <>
        <TopNav title="Profile" subtitle="Your student profile" />
        <div className="px-6 py-8">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No student record found for your account. Please contact the school office.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav title="Profile" subtitle="Your student information" />
      <div className="space-y-6 px-6 py-8 max-w-3xl">
        {/* Header card */}
        <Card>
          <CardContent className="flex flex-col items-center gap-5 py-8 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary font-display text-2xl">
                {initials(student.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="font-display text-xl font-semibold text-slate-900">
                {student.full_name}
              </h2>
              <p className="mt-1 font-mono text-sm text-slate-500">
                {student.admission_number}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {student.classes && (
                  <Badge variant="secondary">
                    Class {student.classes.grade}-{student.classes.section}
                  </Badge>
                )}
                {student.roll_number && (
                  <Badge variant="outline">Roll {student.roll_number}</Badge>
                )}
                <Badge variant={student.status === "active" ? "success" : "outline"}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Full name" value={student.full_name} />
            <Separator />
            <InfoRow label="Date of birth" value={formatDate(student.date_of_birth)} />
            <Separator />
            <InfoRow label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null} />
            <Separator />
            <InfoRow label="Blood group" value={student.blood_group} />
            <Separator />
            <InfoRow label="Address" value={student.address} />
            <Separator />
            <InfoRow label="Admission date" value={formatDate(student.admission_date)} />
          </CardContent>
        </Card>

        {/* Parent / guardian info */}
        {student.parents && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent / Guardian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Name" value={student.parents.full_name} />
              <Separator />
              <InfoRow label="Phone" value={student.parents.phone} />
              <Separator />
              <InfoRow label="Email" value={student.parents.email} />
              <Separator />
              <InfoRow label="Occupation" value={student.parents.occupation} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
