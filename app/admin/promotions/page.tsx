import Link from "next/link";
import { TopNav } from "@/components/dashboard/topnav";
import { PromotionWorkspace } from "@/components/admin/promotion-workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ClassRow = {
  id: string;
  grade: string;
  section: string;
  academic_years: { year_label: string } | null;
};

async function listClasses() {
  try {
    const supabase = createSupabaseAdminClient();
    // Only classes that still have active students (otherwise there's nothing to promote)
    const { data: classes } = await supabase
      .from("classes")
      .select("id,grade,section,academic_years(year_label)")
      .order("grade")
      .order("section");
    const list = (classes as unknown as ClassRow[] | null) ?? [];

    if (list.length === 0) return [];
    const { data: counts } = await supabase
      .from("students")
      .select("class_id")
      .eq("status", "active")
      .in(
        "class_id",
        list.map((c) => c.id),
      );
    const active = new Set(
      ((counts as { class_id: string }[] | null) ?? []).map((r) => r.class_id),
    );

    return list
      .filter((c) => active.has(c.id))
      .map((c) => ({
        id: c.id,
        grade: c.grade,
        section: c.section,
        academic_year: c.academic_years?.year_label ?? null,
      }));
  } catch {
    return [];
  }
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string }>;
}) {
  const { class_id } = await searchParams;
  const classes = await listClasses();

  return (
    <>
      <TopNav
        title="Promotions"
        subtitle="Run end-of-year promotions, class by class"
      />
      <div className="space-y-6 px-6 py-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Heads up</p>
          <p className="mt-1 text-amber-800">
            The engine never auto-promotes — every student needs an explicit decision before the run.
            It will automatically (1) create the next academic year if missing and (2) create target
            classes in that year for each grade · section being promoted into.
          </p>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No classes with active students yet. Admit students from{" "}
            <Link href="/admin/students" className="text-primary hover:underline">
              Students
            </Link>{" "}
            first.
          </div>
        ) : (
          <PromotionWorkspace classes={classes} selectedClassId={class_id} />
        )}
      </div>
    </>
  );
}
