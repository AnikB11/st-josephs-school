import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  FileBarChart,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getTeacherContext } from "@/lib/teacher";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function countStudentsForClasses(classIds: string[]): Promise<number> {
  if (classIds.length === 0) return 0;
  try {
    const supabase = createSupabaseAdminClient();
    const { count } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .in("class_id", classIds)
      .eq("status", "active");
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function TeacherDashboardPage() {
  const ctx = await getTeacherContext();

  if (!ctx) {
    return (
      <>
        <TopNav title="Teacher" subtitle="Welcome" />
        <div className="px-6 py-8">
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              We couldn't find a teacher profile linked to your account. Please ask the
              admin to invite you with this email.
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const { teacher, assignments } = ctx;
  const uniqueClassIds = Array.from(new Set(assignments.map((a) => a.class_id)));
  const classTeacherOf = assignments.filter((a) => a.is_class_teacher);
  const studentsCount = await countStudentsForClasses(uniqueClassIds);
  const subjectsTaught = Array.from(
    new Set(assignments.map((a) => a.subjects?.id).filter(Boolean)),
  ).length;

  const firstName = teacher.full_name.split(" ")[0];

  return (
    <>
      <TopNav title={`Hello, ${firstName}`} subtitle="Your teaching dashboard" />
      <div className="space-y-8 px-6 py-8">
        {/* Profile card */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-start">
            <Avatar className="h-16 w-16">
              {teacher.photo_url && <AvatarImage src={teacher.photo_url} alt={teacher.full_name} />}
              <AvatarFallback className="bg-primary/10 text-primary font-display text-xl">
                {initials(teacher.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                {teacher.full_name}
              </h2>
              {teacher.qualification && (
                <p className="text-sm text-slate-500">{teacher.qualification}</p>
              )}
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                {teacher.employee_code && (
                  <Badge variant="secondary" className="font-mono">
                    {teacher.employee_code}
                  </Badge>
                )}
                {classTeacherOf.length > 0 && (
                  <Badge variant="success">Class teacher of {classTeacherOf.length}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Assigned classes"
            value={uniqueClassIds.length}
            icon={Users}
            hint={uniqueClassIds.length === 1 ? "class" : "classes"}
          />
          <StatCard
            label="Subjects taught"
            value={subjectsTaught}
            icon={BookOpen}
            hint={subjectsTaught === 1 ? "subject" : "subjects"}
          />
          <StatCard
            label="Students reach"
            value={studentsCount}
            icon={Users}
            hint="across assigned classes"
          />
        </div>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick links</CardTitle>
            <CardDescription>Jump straight to today's tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/teacher/classes", label: "My classes", icon: Users },
                { href: "/teacher/attendance", label: "Mark attendance", icon: ClipboardCheck },
                { href: "/teacher/results", label: "Enter marks", icon: FileBarChart },
                { href: "/teacher/assignments", label: "Assignments", icon: BookOpen },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex items-center gap-3">
                    <l.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-slate-700">{l.label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignments list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My assignments</CardTitle>
            <CardDescription>
              Classes and subjects assigned to you for the current year
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No assignments yet. Once the admin assigns classes and subjects to you,
                they'll appear here.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {a.classes && (
                        <Badge variant="secondary">
                          Class {a.classes.grade}-{a.classes.section}
                        </Badge>
                      )}
                      {a.subjects && (
                        <span className="text-sm font-medium text-slate-900">
                          {a.subjects.name}
                          {a.subjects.code && (
                            <span className="ml-1.5 font-mono text-xs text-slate-400">
                              {a.subjects.code}
                            </span>
                          )}
                        </span>
                      )}
                      {a.is_class_teacher && (
                        <Badge variant="success">Class teacher</Badge>
                      )}
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
