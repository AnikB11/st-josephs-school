/**
 * Academic year & promotion utilities.
 *
 * In India most schools run April → March. Adjust if your school differs.
 */
export const ACADEMIC_YEAR_START_MONTH = 4; // April

export function currentAcademicYearLabel(today: Date = new Date()): string {
  const m = today.getMonth() + 1;
  const y = today.getFullYear();
  const startYear = m >= ACADEMIC_YEAR_START_MONTH ? y : y - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

/**
 * Standard grade progression (Indian K-12 system).
 * Adjust the ladder here if your school uses a different curriculum.
 */
const GRADE_LADDER = [
  "Nursery",
  "KG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;

/**
 * Suggest the next grade for a student. Admin must still confirm.
 *  - returns nextGrade=null and status='graduated' when at the top of the ladder
 *  - returns nextGrade=null and status='promoted' for unrecognized grades
 *    (admin can override the target class manually)
 */
export function suggestNextGrade(currentGrade: string): {
  nextGrade: string | null;
  status: "promoted" | "graduated";
} {
  const idx = GRADE_LADDER.indexOf(currentGrade as (typeof GRADE_LADDER)[number]);
  if (idx === -1) return { nextGrade: null, status: "promoted" };
  if (idx >= GRADE_LADDER.length - 1) return { nextGrade: null, status: "graduated" };
  return { nextGrade: GRADE_LADDER[idx + 1], status: "promoted" };
}

/**
 * Next academic year label, e.g. "2026-27" → "2027-28".
 */
export function nextAcademicYearLabel(currentLabel: string): string {
  const startYear = parseInt(currentLabel.slice(0, 4), 10);
  if (Number.isNaN(startYear)) return currentLabel;
  return `${startYear + 1}-${String(startYear + 2).slice(-2)}`;
}

export function formatAdmissionNumber(prefix: string, year: number, seq: number): string {
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}
