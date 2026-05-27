import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { TopNav } from "@/components/dashboard/topnav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewStudentDialog } from "@/components/admin/new-student-dialog";
import { NewSectionDialog } from "@/components/admin/new-section-dialog";
import { StudentActions } from "@/components/admin/student-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { getGradeGroup } from "@/lib/classes";
import { cn } from "@/lib/utils";

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

async function getStudentsForClass(
  classIds: string[],
  query: string | undefined,
): Promise<StudentRow[]> {
  if (classIds.length === 0) return [];
  try {
    const supabase = createSupabaseAdminClient();
    let q = supabase
      .from("students")
      .select(
        "id,admission_number,roll_number,full_name,date_of_birth,status,admission_date,class_id,classes(grade,section)",
      )
      .in("class_id", classIds);
    if (query && query.trim()) {
      const term = query.trim();
      q = q.or(`full_name.ilike.%${term}%,admission_number.ilike.%${term}%`);
    }
    const { data } = await q
      .order("admission_number", { ascending: false })
      .limit(300);
    return (data as unknown as StudentRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string }>;
  searchParams: Promise<{ section?: string; q?: string }>;
}) {
  const { grade } = await params;
  const { section: sectionParam, q } = await searchParams;
  const decodedGrade = decodeURIComponent(grade);

  const group = await getGradeGroup(decodedGrade);
  if (!group) notFound();

  // Resolve which section IDs to query. "all" or unset → every section in this class.
  const activeSectionKey = sectionParam ?? "all";
  const activeSection =
    activeSectionKey === "all"
      ? null
      : group.sections.find((s) => s.section === activeSectionKey) ?? null;
  const classIds =
    activeSection === null ? group.sections.map((s) => s.id) : [activeSection.id];

  const students = await getStudentsForClass(classIds, q);

  return (
    <>
      <TopNav
        title={`Class ${decodedGrade}`}
        subtitle={
          activeSection
            ? `Section ${activeSection.section} · ${activeSection.studentCount} students`
            : `${group.sectionCount} sections · ${group.studentCount} students`
        }
      />
      <div className="space-y-6 px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <Link href="/admin/students" className="hover:text-slate-900">
            Students
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className={cn(activeSection ? "text-slate-700" : "text-slate-900 font-medium")}>
            Class {decodedGrade}
          </span>
          {activeSection && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="text-slate-900 font-medium">Section {activeSection.section}</span>
            </>
          )}
        </nav>

        {/* Section pills */}
        {group.sections.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SectionPill
              grade={decodedGrade}
              sectionKey="all"
              label="All sections"
              count={group.studentCount}
              active={activeSectionKey === "all"}
              q={q}
            />
            {group.sections.map((s) => (
              <SectionPill
                key={s.id}
                grade={decodedGrade}
                sectionKey={s.section}
                label={`Section ${s.section}`}
                count={s.studentCount}
                active={activeSectionKey === s.section}
                q={q}
                teacher={s.classTeacherName}
              />
            ))}
          </div>
        )}

        {/* Search + add — search is scoped to the current class/section. */}
        <form
          method="GET"
          action={`/admin/students/class/${encodeURIComponent(decodedGrade)}`}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          {/* Preserve current section selection across search. */}
          {activeSectionKey !== "all" && (
            <input type="hidden" name="section" value={activeSectionKey} />
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder={
                activeSection
                  ? `Search in Section ${activeSection.section}`
                  : `Search in Class ${decodedGrade}`
              }
              className="h-10 w-80 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {q && (
              <Link href={`/admin/students/class/${encodeURIComponent(decodedGrade)}${activeSectionKey !== "all" ? `?section=${activeSectionKey}` : ""}`}>
                <Button type="button" variant="ghost" size="sm" className="h-9">
                  Clear
                </Button>
              </Link>
            )}
            <Button type="submit" variant="outline" size="sm" className="h-9">
              Search
            </Button>
            <NewSectionDialog
              grade={decodedGrade}
              existing={group.sections.map((s) => s.section)}
            />
            <NewStudentDialog defaultGrade={decodedGrade} defaultSection={activeSection?.section} />
          </div>
        </form>

        {/* Existing student table — unchanged UI */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          {students.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              {q ? (
                <>No students match <span className="font-medium text-slate-700">"{q}"</span> in this class.</>
              ) : (
                <>
                  No students {activeSection ? `in Section ${activeSection.section}` : `in Class ${decodedGrade}`} yet.{" "}
                  <span className="font-medium text-slate-700">Click "Add student"</span> to admit one.
                </>
              )}
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

function SectionPill({
  grade,
  sectionKey,
  label,
  count,
  active,
  q,
  teacher,
}: {
  grade: string;
  sectionKey: string;
  label: string;
  count: number;
  active: boolean;
  q?: string;
  teacher?: string | null;
}) {
  const params = new URLSearchParams();
  if (sectionKey !== "all") params.set("section", sectionKey);
  if (q) params.set("q", q);
  const href = `/admin/students/class/${encodeURIComponent(grade)}${params.toString() ? `?${params.toString()}` : ""}`;
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
      )}
      title={teacher ? `Class teacher: ${teacher}` : undefined}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
          active ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-500",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
