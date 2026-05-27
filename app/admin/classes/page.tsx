import Link from "next/link";
import { ArrowRight, Layers, Plus, Users } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGradeGroups, type GradeGroup } from "@/lib/classes";

export const dynamic = "force-dynamic";

function SectionRow({
  s,
}: {
  s: GradeGroup["sections"][number];
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/8 font-mono text-xs font-semibold text-primary">
          {s.section}
        </span>
        <div className="leading-tight">
          <p className="font-medium text-slate-900">Section {s.section}</p>
          <p className="text-xs text-slate-500">
            {s.classTeacherName ?? "No class teacher assigned"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[11px] text-slate-500">
          {s.studentCount} students
        </span>
      </div>
    </li>
  );
}

function GradeCard({ group }: { group: GradeGroup }) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Class
          </p>
          <h3 className="mt-0.5 font-display text-xl font-semibold text-slate-900">
            {group.grade}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {group.sectionCount} sections · {group.studentCount} students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/students/class/${encodeURIComponent(group.grade)}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Users className="h-3.5 w-3.5" />
              View students
            </Button>
          </Link>
        </div>
      </header>

      {group.sections.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {group.sections.map((s) => (
            <SectionRow key={s.id} s={s} />
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
          No sections in Class {group.grade} yet. Sections are created automatically when
          you admit the first student into a section.
        </p>
      )}
    </article>
  );
}

export default async function ClassesPage() {
  const groups = await getGradeGroups();
  const totalSections = groups.reduce((sum, g) => sum + g.sectionCount, 0);
  const totalStudents = groups.reduce((sum, g) => sum + g.studentCount, 0);

  return (
    <>
      <TopNav title="Classes" subtitle="Academic structure — classes and sections" />
      <div className="space-y-8 px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-slate-900 font-medium">Classes</span>
        </nav>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Classes
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {groups.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Sections
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {totalSections}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Active students
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {totalStudents}
            </p>
          </div>
        </div>

        {/* Help banner — class CRUD isn't its own UI yet because the
            current schema creates classes on the fly when students are
            admitted. Surfacing that explicitly avoids confusion. */}
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-blue-900">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">
                Classes are created automatically
              </p>
              <p className="mt-1 text-xs text-blue-900/80">
                When you admit a student into a class + section combination that doesn't yet
                exist, the academic record is created on the fly. To explicitly create a class
                or section ahead of time, use <em>Add student</em> with the desired
                placement — admitting the first student opens the new class.
              </p>
            </div>
          </div>
          <Link href="/admin/students">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
              <Plus className="h-3.5 w-3.5" /> Add student
            </Button>
          </Link>
        </div>

        {/* Grade cards */}
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Layers className="mx-auto h-9 w-9 text-slate-300" />
            <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
              No classes yet
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
              Admit your first student from <Link href="/admin/students" className="text-primary hover:underline">Students</Link> and a class will be created.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {groups.map((g) => (
              <GradeCard key={g.grade} group={g} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
