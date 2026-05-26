/**
 * Supabase generated types — hand-authored to match
 * supabase/migrations/001_initial_schema.sql.
 *
 * Regenerate later with:
 *   supabase gen types typescript --project-id <id> > types/database.ts
 */

export type UserRole = "admin" | "teacher" | "parent" | "alumni" | "student";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type StudentStatus = "active" | "promoted" | "retained" | "graduated" | "transferred";
export type NoticeAudience = "all" | "parents" | "students" | "alumni" | "staff";
export type NoticeCategory = "general" | "academic" | "event" | "urgent" | "holiday";
export type ResultStatus = "draft" | "published" | "archived";

export interface User {
  id: string;
  auth_user_id: string | null;
  clerk_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  admission_number: string;
  roll_number: string | null;
  full_name: string;
  date_of_birth: string;
  gender: "male" | "female" | "other" | null;
  class_id: string | null;
  parent_id: string | null;
  status: StudentStatus;
  admission_date: string;
  photo_url: string | null;
  blood_group: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  category: NoticeCategory;
  audience: NoticeAudience;
  pdf_url: string | null;
  published_at: string;
  expires_at: string | null;
  archived_at: string | null;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  event_date: string | null;
  is_published: boolean;
  created_at: string;
}

export interface GalleryMedia {
  id: string;
  album_id: string;
  cloudinary_url: string;
  cloudinary_public_id: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface Alumnus {
  id: string;
  user_id: string | null;
  student_id: string | null;
  full_name: string;
  graduation_year: number;
  current_position: string | null;
  current_company: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  cover_url: string | null;
  audience: NoticeAudience;
  is_published: boolean;
  created_at: string;
}

export interface WebsiteContent {
  id: string;
  section_key: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  meta: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}

export interface AttendanceRow {
  id: string;
  student_id: string;
  class_id: string | null;
  date: string;
  status: AttendanceStatus;
  marked_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface ResultRow {
  id: string;
  student_id: string;
  exam_id: string;
  subject_id: string;
  marks_obtained: number;
  max_marks: number;
  grade: string | null;
  remarks: string | null;
  status: ResultStatus;
  pdf_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassRow {
  id: string;
  grade: string;
  section: string;
  academic_year_id: string | null;
  class_teacher_id: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string | null;
  grade: string | null;
  max_marks: number;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  year_label: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Parent {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  address: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  name: string;
  academic_year_id: string | null;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Teacher {
  id: string;
  user_id: string | null;
  invited_email: string | null;
  full_name: string;
  employee_code: string | null;
  phone: string | null;
  qualification: string | null;
  date_of_joining: string;
  is_active: boolean;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string | null;
  is_class_teacher: boolean;
  created_at: string;
}

export type AssignmentSubmissionStatus = "submitted" | "graded";

export interface Assignment {
  id: string;
  class_id: string;
  subject_id: string | null;
  teacher_id: string | null;
  title: string;
  description: string | null;
  pdf_url: string | null;
  due_date: string | null;
  max_marks: number | null;
  is_published: boolean;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  pdf_url: string | null;
  remarks: string | null;
  marks_obtained: number | null;
  status: AssignmentSubmissionStatus;
  submitted_at: string;
  graded_at: string | null;
}

type Tbl<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: Tbl<User>;
      students: Tbl<Student>;
      parents: Tbl<Parent>;
      classes: Tbl<ClassRow>;
      subjects: Tbl<Subject>;
      academic_years: Tbl<AcademicYear>;
      attendance: Tbl<AttendanceRow>;
      exams: Tbl<Exam>;
      results: Tbl<ResultRow>;
      notices: Tbl<Notice>;
      gallery_albums: Tbl<GalleryAlbum>;
      gallery_media: Tbl<GalleryMedia>;
      alumni: Tbl<Alumnus>;
      events: Tbl<Event>;
      website_content: Tbl<WebsiteContent>;
      audit_logs: Tbl<AuditLog>;
      teachers: Tbl<Teacher>;
      teacher_assignments: Tbl<TeacherAssignment>;
      assignments: Tbl<Assignment>;
      assignment_submissions: Tbl<AssignmentSubmission>;
    };
    Views: Record<string, never>;
    Functions: {
      generate_admission_number: {
        Args: { prefix?: string };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      attendance_status: AttendanceStatus;
      student_status: StudentStatus;
      notice_audience: NoticeAudience;
      notice_category: NoticeCategory;
      result_status: ResultStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
