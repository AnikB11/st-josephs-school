import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Calendar, ArrowLeft, BookOpen } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TeacherAssignmentManager } from "@/components/admin/teacher-assignment-manager";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Teacher = {
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

type AssignmentRow = {
  id: string;
  is_class_teacher: boolean;
  classes: { id: string; grade: string; section: string } | null;
  subjects: { id: string; name: string; code: string | null } | null;
};

type ClassRow = { id: string; grade: string; section: string };
type SubjectRow = { id: string; name: string; code: string | null; grade: string | null };

async function getTeacher(id: string): Promise<{
  teacher: Teacher | null;
  assignments: AssignmentRow[];
  classes: ClassRow[];
  subjects: SubjectRow[];
}> {
  const supabase = createSupabaseAdminClient();
  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!teacher) return { teacher: null, assignments: [], classes: [], subjects: [] };

  const [{ data: assignments }, { data: classes }, { data: subjects }] = await Promise.all([
    supabase
      .from("teacher_assignments")
      .select("id,is_class_teacher,classes(id,grade,section),subjects(id,name,code)")
      .eq("teacher_id", id),
    supabase
      .from("classes")
      .select("id,grade,section")
      .order("grade", { ascending: true }),
    supabase
      .from("subjects")
      .select("id,name,code,grade")
      .order("name", { ascending: true }),
  ]);

  return {
    teacher: teacher as Teacher,
    assignments: (assignments as unknown as AssignmentRow[] | null) ?? [],
    classes: (classes as ClassRow[] | null) ?? [],
    subjects: (subjects as SubjectRow[] | null) ?? [],
  };
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { teacher, assignments, classes, subjects } = await getTeacher(id);
  if (!teacher) notFound();

  return (
    <>
      <TopNav title={teacher.full_name} subtitle="Teacher profile & class assignments" />
      <div className="space-y-6 px-6 py-8">
        <Link
          href="/admin/teachers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to teachers
        </Link>

        {/* Profile header */}
        <Card>
          <CardContent className="flex flex-col items-center gap-5 py-6 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              {teacher.photo_url && <AvatarImage src={teacher.photo_url} alt={teacher.full_name} />}
              <AvatarFallback className="bg-primary/10 text-primary font-display text-2xl">
                {initials(teacher.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-xl font-semibold text-slate-900">
                {teacher.full_name}
              </h2>
              {teacher.qualification && (
                <p className="mt-1 text-sm text-slate-500">{teacher.qualification}</p>
              )}
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {teacher.employee_code && (
                  <Badge variant="secondary" className="font-mono">
                    {teacher.employee_code}
                  </Badge>
                )}
                {teacher.is_active ? (
                  teacher.user_id ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="warning">Awaiting sign-in</Badge>
                  )
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-slate-600 sm:justify-start">
                {teacher.invited_email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" /> {teacher.invited_email}
                  </span>
                )}
                {teacher.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" /> {teacher.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" /> Joined{" "}
                  {formatDate(teacher.date_of_joining)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Class & subject assignments
            </CardTitle>
            <CardDescription>
              Assign subjects in classes this teacher will teach. Mark one as class teacher per
              class for administrative responsibilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherAssignmentManager
              teacherId={teacher.id}
              assignments={assignments}
              classes={classes}
              subjects={subjects}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
