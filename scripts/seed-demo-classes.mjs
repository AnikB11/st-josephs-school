#!/usr/bin/env node
/**
 * Demo seed — creates the full academic structure (Nursery → Class 12)
 * with two sections each and a handful of students per section.
 *
 * Idempotent: existing classes / students with the same admission number
 * are skipped on re-runs.
 *
 *   node scripts/seed-demo-classes.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const eq = l.indexOf("=");
      let v = l.slice(eq + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      return [l.slice(0, eq).trim(), v];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const GRADES = ["Nursery", "KG", ...Array.from({ length: 12 }, (_, i) => String(i + 1))];
const SECTIONS = ["A", "B"];

// Birth year per grade: rough Indian academic mapping.
const BIRTH_YEAR_FOR_GRADE = {
  "Nursery": 2022, "KG": 2021,
  "1": 2020, "2": 2019, "3": 2018, "4": 2017, "5": 2016, "6": 2015,
  "7": 2014, "8": 2013, "9": 2012, "10": 2011, "11": 2010, "12": 2009,
};

const FIRST_M = ["Aarav", "Vihaan", "Aditya", "Vivaan", "Arjun", "Reyansh", "Kabir", "Anshul", "Ishaan", "Krishna", "Rohan", "Karan", "Rudra", "Yash", "Devansh", "Aryan", "Shaurya", "Atharv", "Dhruv", "Hriday", "Kartik", "Manav", "Nikhil", "Pranav", "Rahul", "Sahil", "Tanish", "Vedant", "Aarush", "Jay"];
const FIRST_F = ["Aanya", "Diya", "Ira", "Myra", "Anika", "Saanvi", "Aadhya", "Riya", "Ananya", "Kavya", "Meera", "Tara", "Priya", "Neha", "Pooja", "Avni", "Bhavya", "Charvi", "Eesha", "Gauri", "Hiya", "Inaaya", "Jiya", "Kiara", "Lavanya", "Mishka", "Nitya", "Pari", "Rhea", "Sanvi"];
const LAST = ["Sharma", "Verma", "Kumar", "Patel", "Singh", "Iyer", "Reddy", "Nair", "Das", "Joshi", "Khanna", "Mehra", "Bose", "Mukherjee", "Chatterjee", "Rao", "Naidu", "Gupta", "Agarwal", "Bansal", "Kapoor", "Malhotra", "Roy", "Sen", "Ghosh"];

const PARENT_OCCUPATIONS = ["Engineer", "Doctor", "Teacher", "Architect", "Lawyer", "Banker", "Designer", "Accountant", "Pharmacist", "Manager", "Business owner", "Civil servant", "Journalist", "Pilot", "Professor"];

// Deterministic pseudo-random so re-runs pick the same names per slot.
function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260527);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

function randomDob(year) {
  const m = 1 + Math.floor(rng() * 12);
  const d = 1 + Math.floor(rng() * 28);
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function randomPhone() {
  return `+91 ${90 + Math.floor(rng() * 9)}${Math.floor(10000 + rng() * 89999)} ${Math.floor(10000 + rng() * 89999)}`;
}

async function ensureAcademicYear() {
  const { data } = await supabase
    .from("academic_years")
    .select("id,year_label,is_current")
    .eq("is_current", true)
    .limit(1);
  if (data && data.length) return data[0].id;
  const { data: created, error } = await supabase
    .from("academic_years")
    .insert({ year_label: "2026-27", start_date: "2026-04-01", end_date: "2027-03-31", is_current: true })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function ensureClass(academicYearId, grade, section) {
  const { data: existing } = await supabase
    .from("classes")
    .select("id")
    .eq("grade", grade)
    .eq("section", section)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabase
    .from("classes")
    .insert({ grade, section, academic_year_id: academicYearId })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function findStudentByAdmission(num) {
  const { data } = await supabase
    .from("students")
    .select("id")
    .eq("admission_number", num)
    .maybeSingle();
  return data?.id ?? null;
}

async function createParent(name) {
  const { data, error } = await supabase
    .from("parents")
    .insert({
      full_name: name,
      phone: randomPhone(),
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      occupation: pick(PARENT_OCCUPATIONS),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function seed() {
  console.log("🌱 Demo seed — full academic structure\n");

  const yearId = await ensureAcademicYear();
  console.log(`✓ Academic year ready`);

  // Reserve admission numbers in the SJR-2026-2### range to avoid colliding
  // with the existing 8-student seed (SJR-2026-0001..0008).
  let admissionCounter = 2000;
  let createdClasses = 0;
  let createdStudents = 0;

  for (const grade of GRADES) {
    const studentsPerSection = grade === "Nursery" || grade === "KG" ? 4 : 6;
    for (const section of SECTIONS) {
      const classId = await ensureClass(yearId, grade, section);
      createdClasses++;

      for (let i = 1; i <= studentsPerSection; i++) {
        admissionCounter++;
        const admissionNumber = `SJR-2026-${String(admissionCounter).padStart(4, "0")}`;
        if (await findStudentByAdmission(admissionNumber)) continue;

        const gender = rng() < 0.5 ? "male" : "female";
        const first = gender === "male" ? pick(FIRST_M) : pick(FIRST_F);
        const last = pick(LAST);
        const fullName = `${first} ${last}`;
        const parentFirst = pick(["Rajesh", "Sunita", "Anil", "Priya", "Vikram", "Neha", "Sanjay", "Meera", "Arvind", "Lata", "Manoj", "Rekha", "Suresh", "Kavita", "Deepak", "Asha"]);
        const parentId = await createParent(`${parentFirst} ${last}`);

        const dob = randomDob(BIRTH_YEAR_FOR_GRADE[grade]);

        const { error } = await supabase.from("students").insert({
          admission_number: admissionNumber,
          full_name: fullName,
          roll_number: String(i),
          date_of_birth: dob,
          gender,
          class_id: classId,
          parent_id: parentId,
          status: "active",
          admission_date: "2026-04-01",
          blood_group: pick(["A+", "B+", "O+", "AB+", "A-", "O-"]),
        });
        if (error) {
          console.error(`  ✗ ${admissionNumber} ${fullName}:`, error.message);
          continue;
        }
        createdStudents++;
      }
      process.stdout.write(`  ✓ Class ${grade} · Section ${section}\n`);
    }
  }

  console.log(`\nDone. Classes touched: ${createdClasses}. New students: ${createdStudents}.`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
