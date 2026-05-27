import Link from "next/link";
import { ArrowRight, ChevronRight, Layers, Plus, Users } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewStudentDialog } from "@/components/admin/new-student-dialog";
import { getGradeGroups, getTotalActiveStudents, type GradeGroup } from "@/lib/classes";

export const dynamic = "force-dynamic";

function ClassCard({ group }: { group: GradeGroup }) {
  const teacherLine =
    group.classTeacherNames.length === 0
      ? "Class teacher not assigned"
      : group.classTeacherNames.length === 1
        ? group.classTeacherNames[0]
        : `${group.classTeacherNames[0]} + ${group.classTeacherNames.length - 1} more`;

  return (
    <Link
      href={`/admin/students/class/${encodeURIComponent(group.grade)}`}
      className="group block rounded-2xl border border-slate-200/70 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_40px_-26px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Class
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-slate-900">
            {group.grade}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary/15">
          <Users className="h-4 w-4" />
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Students
          </dt>
          <dd className="mt-1 font-display text-lg font-semibold text-slate-900 tabular-nums">
            {group.studentCount}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Sections
          </dt>
          <dd className="mt-1 font-display text-lg font-semibold text-slate-900 tabular-nums">
            {group.sectionCount}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {group.sections.map((s) => (
          <Badge key={s.id} variant="secondary" className="rounded-full font-mono text-[11px]">
            {s.section}
          </Badge>
        ))}
        {group.sections.length === 0 && (
          <span className="text-[11px] text-slate-400">No sections yet</span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="truncate">{teacherLine}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}

export default async function StudentsPage() {
  const [groups, total] = await Promise.all([getGradeGroups(), getTotalActiveStudents()]);

  return (
    <>
      <TopNav title="Students" subtitle="Manage your student roster" />
      <div className="space-y-8 px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-slate-900 font-medium">Students</span>
        </nav>

        {/* Summary + add */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              {groups.length} classes
              <span className="text-slate-400"> · </span>
              <span className="text-slate-700">{total} active students</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a class to view sections and manage students.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/classes">
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Manage classes
              </Button>
            </Link>
            <NewStudentDialog />
          </div>
        </div>

        {/* Class grid */}
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Users className="mx-auto h-9 w-9 text-slate-300" />
            <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
              No classes yet
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
              Add your first student and a class will be created automatically — or set up
              the academic structure in advance from <em>Manage classes</em>.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Link href="/admin/classes">
                <Button variant="outline" size="sm">
                  Set up classes
                </Button>
              </Link>
              <NewStudentDialog />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((g) => (
              <ClassCard key={g.grade} group={g} />
            ))}
          </div>
        )}

        {/* Quick-jump strip */}
        {groups.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Jump to
            </span>
            {groups.map((g) => (
              <Link
                key={g.grade}
                href={`/admin/students/class/${encodeURIComponent(g.grade)}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Class {g.grade}
                <ChevronRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
