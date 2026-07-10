# Fix Report 3: Guides, Pre-Internship Classes, and Mentors

Successfully implemented Feature 2 (Guides), Feature 3 (Pre-Internship Classes), and Feature 4 (Mentors) on both the Laravel backend and Next.js frontend according to `SPEC_ALL_P1_FEATURES.md`.

---

## 1. Feature 2: Panduan (Guides)

### Backend:
* **Migration**: Created `create_guides_table.php` migration specifying UUID primary key, enum types (student, school, company), title, description, storage file path, and active published indicator.
* **Model**: Created `app/Models/Guide.php` supporting mass assignment, uploaded_by user relationship, and automatic UUID generation boot hook.
* **Validation**: Implemented `app/Http/Requests/StoreGuideRequest.php` enforcing PDF files up to 10MB.
* **Controller**: Developed `app/Http/Controllers/GuideController.php` supporting document storage, role-specific retrieval, admin lists, metadata updates, and physical PDF cleanup on deletion.
* **Routes**: Registered routes under prefix `/guides` in `routes/api.php` utilizing standard auth and admin middleware.

### Frontend:
* **Public Guides Page**: Developed dynamic client page `/src/app/panduan/[role]/page.tsx` displaying the document checklist and embed native PDF previewer frames with download actions.
* **Admin Guides Manager**: Created `/src/app/dashboard/guides/page.tsx` list and upload panel allowing search filter, file preview modal, details editor, and instant removal with alerts.

---

## 2. Feature 3: Kelas Pra Magang (Pre-Internship Classes)

### Backend:
* **Migrations**: Created `create_pre_internship_classes_table.php`, `create_pre_internship_enrollments_table.php`, and `create_class_attendance_table.php`.
* **Models**: Created `app/Models/PreInternshipClass.php`, `app/Models/PreInternshipEnrollment.php`, and `app/Models/ClassAttendance.php`.
* **Controller**: Developed `app/Http/Controllers/PreInternshipClassController.php` with capacity validations, duplicate check guards, student drop logic, and session attendance percentage math recalculations.
* **Routes**: Added pre-internship endpoints under prefix `/pre-internship-classes` and `/pre-internship-enrollments` in `routes/api.php`.

### Frontend:
* **Student Browse**: Created `/src/app/dashboard/student/pre-internship-classes/page.tsx` list containing class levels filter, duration metrics, capacity bar, and enrollment triggers.
* **Student Class List & Progress**: Created `/src/app/dashboard/student/my-pre-internship-classes/page.tsx` listing current enrollments, attendance rate counters, and drops.
* **Student Attendance Details**: Created `/src/app/dashboard/student/my-pre-internship-classes/[id]/attendance/page.tsx` listing session check-ins, dates, notes, and attendance status.
* **Admin/Teacher Manage Classes**: Created `/src/app/dashboard/pre-internship-classes/manage/page.tsx` to list all scheduled, ongoing, or completed classes, with modals for creation/editing.
* **Admin/Teacher Class Enrollments & Presensi**: Created `/src/app/dashboard/pre-internship-classes/[id]/enrollments/page.tsx` allowing attendance logging per session and viewing student history.

---

## 3. Feature 4: Guru Pembimbing (Mentors)

### Backend:
* **Migrations**: Created `create_mentors_table.php` and `create_mentor_assignments_table.php` supporting UUID primary keys and foreign key constraints.
* **Models**: Created `app/Models/Mentor.php` and `app/Models/MentorAssignment.php`.
* **Controller**: Developed `app/Http/Controllers/MentorController.php` supporting profile CRUD, active student pairings, candidate lists, and termination updates.
* **Routes**: Added endpoints under prefix `/mentors` and `/mentor-assignments` in `routes/api.php`.

### Frontend:
* **Student Assigned Mentor Profile**: Created `/src/app/dashboard/mentor/page.tsx` displaying the assigned mentor's bio, expertise, availability, and click-to-contact actions.
* **Admin Mentors Profiles Master Data**: Created `/src/app/dashboard/mentors/page.tsx` listing profiles, load capacity, and editing modals.
* **Admin Assignments Pairings**: Created `/src/app/dashboard/mentor-assignments/page.tsx` to manage active pairings and establish new assignments via searchable candidate dropdowns.
