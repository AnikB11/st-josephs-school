/**
 * Seed script — populates the Supabase database with realistic dummy data
 * for testing all admin features.
 *
 * Run with: node scripts/seed-dummy-data.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Read .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const eq = l.indexOf("=");
      return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Get current academic year
  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .eq("is_current", true)
    .limit(1);
  
  let academicYearId;
  if (years && years.length > 0) {
    academicYearId = years[0].id;
    console.log(`✅ Academic year: ${years[0].year_label} (${academicYearId})`);
  } else {
    const { data: newYear } = await supabase
      .from("academic_years")
      .insert({ year_label: "2026-27", start_date: "2026-04-01", end_date: "2027-03-31", is_current: true })
      .select()
      .single();
    academicYearId = newYear.id;
    console.log(`✅ Created academic year: 2026-27`);
  }

  // 2. Create classes
  const classesData = [
    { grade: "1", section: "A" },
    { grade: "2", section: "A" },
    { grade: "3", section: "A" },
    { grade: "4", section: "A" },
    { grade: "5", section: "A" },
    { grade: "5", section: "B" },
    { grade: "6", section: "A" },
    { grade: "7", section: "A" },
    { grade: "8", section: "A" },
    { grade: "9", section: "A" },
    { grade: "10", section: "A" },
    { grade: "10", section: "B" },
  ];

  const { data: existingClasses } = await supabase.from("classes").select("id,grade,section");
  let classes;
  if (existingClasses && existingClasses.length > 0) {
    classes = existingClasses;
    console.log(`✅ Classes already exist (${classes.length} found)`);
  } else {
    const { data: newClasses, error: classErr } = await supabase
      .from("classes")
      .insert(classesData.map((c) => ({ ...c, academic_year_id: academicYearId })))
      .select();
    if (classErr) { console.error("Class error:", classErr); return; }
    classes = newClasses;
    console.log(`✅ Created ${classes.length} classes`);
  }

  // 3. Create subjects
  const subjectsData = [
    { name: "English", code: "ENG", grade: "10", max_marks: 100 },
    { name: "Mathematics", code: "MATH", grade: "10", max_marks: 100 },
    { name: "Science", code: "SCI", grade: "10", max_marks: 100 },
    { name: "Social Studies", code: "SST", grade: "10", max_marks: 100 },
    { name: "Hindi", code: "HIN", grade: "10", max_marks: 100 },
    { name: "English", code: "ENG5", grade: "5", max_marks: 100 },
    { name: "Mathematics", code: "MATH5", grade: "5", max_marks: 100 },
    { name: "Science", code: "SCI5", grade: "5", max_marks: 100 },
    { name: "Hindi", code: "HIN5", grade: "5", max_marks: 100 },
  ];

  const { data: existingSubjects } = await supabase.from("subjects").select("id,name,code,grade");
  let subjects;
  if (existingSubjects && existingSubjects.length > 0) {
    subjects = existingSubjects;
    console.log(`✅ Subjects already exist (${subjects.length} found)`);
  } else {
    const { data: newSubjects, error: subErr } = await supabase
      .from("subjects")
      .insert(subjectsData)
      .select();
    if (subErr) { console.error("Subject error:", subErr); return; }
    subjects = newSubjects;
    console.log(`✅ Created ${subjects.length} subjects`);
  }

  // 4. Create parents
  const parentNames = [
    { full_name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh.kumar@example.com", occupation: "Engineer" },
    { full_name: "Sunita Sharma", phone: "+91 98765 43211", email: "sunita.sharma@example.com", occupation: "Teacher" },
    { full_name: "Amit Patel", phone: "+91 98765 43212", email: "amit.patel@example.com", occupation: "Doctor" },
    { full_name: "Priya Singh", phone: "+91 98765 43213", email: "priya.singh@example.com", occupation: "Lawyer" },
    { full_name: "Vikram Joshi", phone: "+91 98765 43214", email: "vikram.joshi@example.com", occupation: "Businessman" },
    { full_name: "Neha Gupta", phone: "+91 98765 43215", email: "neha.gupta@example.com", occupation: "Architect" },
    { full_name: "Sanjay Verma", phone: "+91 98765 43216", email: "sanjay.verma@example.com", occupation: "Professor" },
    { full_name: "Meera Das", phone: "+91 98765 43217", email: "meera.das@example.com", occupation: "Nurse" },
  ];

  const { data: existingParents } = await supabase.from("parents").select("id,full_name");
  let parents;
  if (existingParents && existingParents.length > 0) {
    parents = existingParents;
    console.log(`✅ Parents already exist (${parents.length} found)`);
  } else {
    const { data: newParents, error: parErr } = await supabase
      .from("parents")
      .insert(parentNames)
      .select();
    if (parErr) { console.error("Parent error:", parErr); return; }
    parents = newParents;
    console.log(`✅ Created ${parents.length} parents`);
  }

  // 5. Create students
  const { data: existingStudents } = await supabase.from("students").select("id,full_name,admission_number");
  let students;
  if (existingStudents && existingStudents.length > 0) {
    students = existingStudents;
    console.log(`✅ Students already exist (${students.length} found)`);
  } else {
    const class10A = classes.find((c) => c.grade === "10" && c.section === "A");
    const class10B = classes.find((c) => c.grade === "10" && c.section === "B");
    const class5A = classes.find((c) => c.grade === "5" && c.section === "A");

    const studentData = [
      { admission_number: "SJR-2026-0001", full_name: "Arjun Kumar", roll_number: "1", date_of_birth: "2010-03-15", gender: "male", class_id: class10A?.id, parent_id: parents[0]?.id, status: "active", blood_group: "B+", address: "12 MG Road, Hill Town" },
      { admission_number: "SJR-2026-0002", full_name: "Priya Sharma", roll_number: "2", date_of_birth: "2010-07-22", gender: "female", class_id: class10A?.id, parent_id: parents[1]?.id, status: "active", blood_group: "O+", address: "45 Gandhi Nagar" },
      { admission_number: "SJR-2026-0003", full_name: "Rohan Patel", roll_number: "3", date_of_birth: "2010-01-10", gender: "male", class_id: class10A?.id, parent_id: parents[2]?.id, status: "active", blood_group: "A+", address: "78 Nehru Colony" },
      { admission_number: "SJR-2026-0004", full_name: "Ananya Singh", roll_number: "4", date_of_birth: "2010-11-05", gender: "female", class_id: class10A?.id, parent_id: parents[3]?.id, status: "active", blood_group: "AB+", address: "23 Lal Bahadur Marg" },
      { admission_number: "SJR-2026-0005", full_name: "Karan Joshi", roll_number: "5", date_of_birth: "2010-06-18", gender: "male", class_id: class10B?.id, parent_id: parents[4]?.id, status: "active", blood_group: "O-", address: "56 Station Road" },
      { admission_number: "SJR-2026-0006", full_name: "Sneha Gupta", roll_number: "6", date_of_birth: "2010-09-30", gender: "female", class_id: class10B?.id, parent_id: parents[5]?.id, status: "active", blood_group: "B-", address: "89 Civil Lines" },
      { admission_number: "SJR-2026-0007", full_name: "Aditya Verma", roll_number: "1", date_of_birth: "2015-02-14", gender: "male", class_id: class5A?.id, parent_id: parents[6]?.id, status: "active", blood_group: "A-", address: "34 Mall Road" },
      { admission_number: "SJR-2026-0008", full_name: "Riya Das", roll_number: "2", date_of_birth: "2015-08-25", gender: "female", class_id: class5A?.id, parent_id: parents[7]?.id, status: "active", blood_group: "O+", address: "67 Park Avenue" },
    ];

    const { data: newStudents, error: stuErr } = await supabase
      .from("students")
      .insert(studentData)
      .select();
    if (stuErr) { console.error("Student error:", stuErr); return; }
    students = newStudents;
    console.log(`✅ Created ${students.length} students`);
  }

  // 6. Create exams
  const { data: existingExams } = await supabase.from("exams").select("id,name");
  let exams;
  if (existingExams && existingExams.length > 0) {
    exams = existingExams;
    console.log(`✅ Exams already exist (${exams.length} found)`);
  } else {
    const { data: newExams, error: examErr } = await supabase
      .from("exams")
      .insert([
        { name: "Mid-Term 2026", academic_year_id: academicYearId, start_date: "2026-08-15", end_date: "2026-08-25", is_published: true },
        { name: "Annual Exam 2027", academic_year_id: academicYearId, start_date: "2027-02-01", end_date: "2027-02-15", is_published: false },
      ])
      .select();
    if (examErr) { console.error("Exam error:", examErr); return; }
    exams = newExams;
    console.log(`✅ Created ${exams.length} exams`);
  }

  // 7. Create results for Mid-Term (class 10 students, 5 subjects)
  const { data: existingResults } = await supabase.from("results").select("id").limit(1);
  if (existingResults && existingResults.length > 0) {
    console.log(`✅ Results already exist`);
  } else {
    const midTerm = exams.find((e) => e.name.includes("Mid-Term"));
    const grade10Subjects = subjects.filter((s) => s.grade === "10");
    const grade10Students = students.filter((s) => 
      s.admission_number?.startsWith("SJR-2026-000") && 
      parseInt(s.admission_number?.split("-")[2] || "0") <= 6
    );

    if (midTerm && grade10Subjects.length > 0 && grade10Students.length > 0) {
      const resultsData = [];
      for (const student of grade10Students) {
        for (const subject of grade10Subjects) {
          const marks = Math.floor(Math.random() * 40) + 55; // 55-95
          const grade = marks >= 90 ? "A+" : marks >= 80 ? "A" : marks >= 70 ? "B+" : marks >= 60 ? "B" : "C";
          resultsData.push({
            student_id: student.id,
            exam_id: midTerm.id,
            subject_id: subject.id,
            marks_obtained: marks,
            max_marks: 100,
            grade,
            status: "published",
            published_at: new Date().toISOString(),
          });
        }
      }
      const { error: resErr } = await supabase.from("results").insert(resultsData);
      if (resErr) console.error("Results error:", resErr);
      else console.log(`✅ Created ${resultsData.length} result entries`);
    }
  }

  // 8. Create attendance for current month
  const { data: existingAtt } = await supabase.from("attendance").select("id").limit(1);
  if (existingAtt && existingAtt.length > 0) {
    console.log(`✅ Attendance already exists`);
  } else {
    const today = new Date();
    const attendanceData = [];
    for (const student of students) {
      for (let day = 1; day <= Math.min(today.getDate(), 18); day++) {
        // Skip weekends
        const d = new Date(today.getFullYear(), today.getMonth(), day);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        
        const rand = Math.random();
        const status = rand > 0.92 ? "absent" : rand > 0.88 ? "late" : rand > 0.85 ? "excused" : "present";
        attendanceData.push({
          student_id: student.id,
          class_id: student.class_id,
          date: d.toISOString().slice(0, 10),
          status,
        });
      }
    }
    const { error: attErr } = await supabase.from("attendance").insert(attendanceData);
    if (attErr) console.error("Attendance error:", attErr);
    else console.log(`✅ Created ${attendanceData.length} attendance records`);
  }

  // 9. Create notices
  const { data: existingNotices } = await supabase.from("notices").select("id").limit(1);
  if (existingNotices && existingNotices.length > 0) {
    console.log(`✅ Notices already exist`);
  } else {
    const noticesData = [
      { title: "Summer Break Schedule 2026", slug: "summer-break-2026", body: "The school will remain closed from June 1 to June 30 for summer break. All students are requested to complete their holiday homework.", category: "holiday", audience: "all", is_pinned: true },
      { title: "Annual Sports Day — Registration Open", slug: "sports-day-2026", body: "Register for the Annual Sports Day events by May 25. Contact your class teacher for event details and timings.", category: "event", audience: "students", is_pinned: false },
      { title: "Parent-Teacher Meeting on May 28", slug: "ptm-may-2026", body: "A parent-teacher meeting will be held on May 28, 2026 from 10:00 AM to 1:00 PM. Your presence is mandatory.", category: "academic", audience: "parents", is_pinned: true },
      { title: "Mid-Term Results Published", slug: "midterm-results-2026", body: "The Mid-Term 2026 results have been published. Students and parents can view results through their respective portals.", category: "academic", audience: "all", is_pinned: false },
      { title: "Library Book Return Reminder", slug: "library-return-2026", body: "All students must return borrowed library books by May 31. Overdue fines will apply from June 1.", category: "general", audience: "students", is_pinned: false },
      { title: "Annual Day Celebrations — Save the Date", slug: "annual-day-2026", body: "St. Joseph's Annual Day celebrations will be held on December 15, 2026. Preparation begins in October.", category: "event", audience: "all", is_pinned: false },
      { title: "Urgent: Water Supply Disruption", slug: "water-disruption-may", body: "Due to municipal maintenance, water supply will be disrupted on May 22. Students are advised to carry water bottles.", category: "urgent", audience: "all", is_pinned: true, expires_at: "2026-05-23T00:00:00Z" },
    ];
    const { error: notErr } = await supabase.from("notices").insert(noticesData);
    if (notErr) console.error("Notice error:", notErr);
    else console.log(`✅ Created ${noticesData.length} notices`);
  }

  // 10. Create gallery albums
  const { data: existingAlbums } = await supabase.from("gallery_albums").select("id").limit(1);
  if (existingAlbums && existingAlbums.length > 0) {
    console.log(`✅ Gallery albums already exist`);
  } else {
    const albumsData = [
      { title: "Republic Day 2026", slug: "republic-day-2026", description: "Flag hoisting ceremony and cultural performances on Republic Day.", event_date: "2026-01-26", is_published: true },
      { title: "Science Exhibition", slug: "science-exhibition-2026", description: "Students showcasing innovative science projects and experiments.", event_date: "2026-03-15", is_published: true },
      { title: "Sports Day 2026", slug: "sports-day-2026", description: "Annual sports day events and prize distribution ceremony.", event_date: "2026-02-20", is_published: true },
    ];
    const { error: albErr } = await supabase.from("gallery_albums").insert(albumsData);
    if (albErr) console.error("Album error:", albErr);
    else console.log(`✅ Created ${albumsData.length} gallery albums`);
  }

  // 11. Create events
  const { data: existingEvents } = await supabase.from("events").select("id").limit(1);
  if (existingEvents && existingEvents.length > 0) {
    console.log(`✅ Events already exist`);
  } else {
    const eventsData = [
      { title: "Annual Sports Day", description: "Track and field events, team sports, and prize distribution.", starts_at: "2026-06-15T09:00:00Z", ends_at: "2026-06-15T16:00:00Z", location: "School Playground", audience: "all", is_published: true },
      { title: "Parent-Teacher Meeting", description: "Discuss your child's academic progress with teachers.", starts_at: "2026-05-28T10:00:00Z", ends_at: "2026-05-28T13:00:00Z", location: "School Auditorium", audience: "parents", is_published: true },
      { title: "Alumni Reunion 2026", description: "Annual alumni get-together and networking event.", starts_at: "2026-07-20T17:00:00Z", ends_at: "2026-07-20T21:00:00Z", location: "School Hall", audience: "alumni", is_published: true },
      { title: "Independence Day Celebration", description: "Flag hoisting, cultural programme, and speech competition.", starts_at: "2026-08-15T08:00:00Z", ends_at: "2026-08-15T12:00:00Z", location: "School Ground", audience: "all", is_published: true },
    ];
    const { error: evtErr } = await supabase.from("events").insert(eventsData);
    if (evtErr) console.error("Event error:", evtErr);
    else console.log(`✅ Created ${eventsData.length} events`);
  }

  // 12. Create alumni
  const { data: existingAlumni } = await supabase.from("alumni").select("id").limit(1);
  if (existingAlumni && existingAlumni.length > 0) {
    console.log(`✅ Alumni already exist`);
  } else {
    const alumniData = [
      { full_name: "Dr. Sanjay Mehta", graduation_year: 2005, current_position: "Senior Software Engineer", current_company: "Google India", bio: "Passionate about AI and education technology.", email: "sanjay.mehta@alumni.com", is_public: true },
      { full_name: "Anjali Rao", graduation_year: 2008, current_position: "Cardiologist", current_company: "AIIMS Delhi", bio: "Dedicated to making healthcare accessible to all.", email: "anjali.rao@alumni.com", is_public: true },
      { full_name: "Vikrant Thapa", graduation_year: 2012, current_position: "Civil Engineer", current_company: "Tata Projects", bio: "Building infrastructure that connects communities.", email: "vikrant.thapa@alumni.com", is_public: true },
      { full_name: "Nisha Kapoor", graduation_year: 2015, current_position: "IAS Officer", current_company: "Government of India", bio: "Serving the nation through public administration.", email: "nisha.kapoor@alumni.com", is_public: true },
    ];
    const { error: almErr } = await supabase.from("alumni").insert(alumniData);
    if (almErr) console.error("Alumni error:", almErr);
    else console.log(`✅ Created ${alumniData.length} alumni records`);
  }

  console.log("\n🎉 Seed complete! Visit http://localhost:3000/admin to see the data.");
}

seed().catch(console.error);
