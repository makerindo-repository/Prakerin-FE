# 🚀 COMPLETE TECHNICAL GUIDE: ALL P1 FEATURES

This document contains detailed technical specs for all 4 P1 (Priority 1) features. Give this to AI and let it build everything.

---

# FEATURE 1: HUBUNGI KAMI (Contact Form)

## Feature Overview
- Public visitors and logged-in users can submit contact messages
- Messages stored in database + email sent to admin
- Admin can reply to messages
- Users can view/track their message status

## Database Schema

```sql
Schema::create('contact_messages', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('email');
    $table->enum('category')->values(['general', 'bug', 'feedback']);
    $table->string('subject');
    $table->text('message');
    $table->enum('status')->values(['new', 'read', 'replied'])->default('new');
    $table->uuid('user_id')->nullable();
    $table->timestamps();
    
    $table->index('email');
    $table->index('status');
});

Schema::create('contact_replies', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('contact_message_id');
    $table->uuid('replied_by_id');
    $table->text('reply_message');
    $table->timestamps();
    
    $table->foreign('contact_message_id')->references('id')->on('contact_messages')->onDelete('cascade');
    $table->foreign('replied_by_id')->references('id')->on('users')->onDelete('cascade');
});
```

## Backend

### Models

**ContactMessage:**
- belongsTo: user (nullable)
- hasMany: replies (ContactReply)

**ContactReply:**
- belongsTo: contactMessage
- belongsTo: repliedBy (User)

### Controller: ContactController

**POST /api/v1/contacts** (PUBLIC)
- Input: name, email, category, subject, message (all required)
- Auto-attach user_id if logged-in
- Send email to admin
- Return: {success, message_id}

**GET /api/v1/contacts** (ADMIN)
- List all messages paginated (20/page)
- Show: name, email, subject, category, status, date, reply count
- Filter by: status, category, date range
- Sort by: newest first

**GET /api/v1/contacts/{id}** (ADMIN)
- Show full message + all replies
- Auto-mark as "read"
- Include replier info for each reply

**POST /api/v1/contacts/{id}/reply** (ADMIN)
- Input: reply_message (required)
- Auto-set replied_by to current user
- Auto-mark contact as "replied"
- Send email notification to original sender

**GET /api/v1/contacts/user/{email}** (PUBLIC)
- Check message status by email
- Return: message + replies

### Email Templates

**ContactFormSubmitted (to admin):**
- Subject: New Contact Message - [Category]
- Show: name, email, category, subject, message
- Action button: link to admin dashboard

**ContactReplyNotification (to user):**
- Subject: Re: [original_subject]
- Show: admin's reply message
- Action button: check full conversation

## Frontend

### Public: /hubungi-kami
- Form fields:
  - Name (text, required)
  - Email (email, required)
  - Category (dropdown: General/Bug/Feedback, required)
  - Subject (text, required)
  - Message (textarea, required, min 10 chars)
- Submit POST to /api/v1/contacts
- On success: show toast + clear form
- Show message if logged-in: "Check your replies here [link]"
- Pre-fill email if user is logged-in

### Admin: /dashboard/contact-messages
- List view:
  - Table: From, Subject, Category (badge), Status (badge), Date
  - Filter by status/category
  - Pagination
  - Click row → detail page

### Admin: /dashboard/contact-messages/[id]
- Full message display
- All replies in thread
- Reply form at bottom
- Back button to list

---

# FEATURE 2: PANDUAN (Guides)

## Feature Overview
- Admin can upload PDF guides
- Admin can edit/delete guides
- Users see guides based on role (Student/School/Company)
- Guides displayed in viewer (no download needed)
- Each guide type has its own section

## Database Schema

```sql
Schema::create('guides', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->enum('type')->values(['student', 'school', 'company']);
    $table->string('title');
    $table->text('description')->nullable();
    $table->string('file_path'); // Path to PDF
    $table->boolean('is_published')->default(true);
    $table->uuid('uploaded_by')->nullable();
    $table->timestamps();
    
    $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('setNull');
});
```

## Backend

### Model: Guide

**Relationships:**
- belongsTo: uploadedBy (User, nullable)

### Controller: GuideController

**POST /api/v1/guides** (ADMIN)
- Input: type (student/school/company), title, description, file (PDF)
- Validate: file must be PDF, max 10MB
- Store file in storage/guides/
- Create guide record
- Return: guide data

**GET /api/v1/guides** (PUBLIC)
- Get guides for current user's role
- If not logged-in: return all public guides (optional - admin decides)
- If student: return type='student'
- If school: return type='school'
- If company: return type='company'
- Return: title, description, id (for viewer)

**GET /api/v1/guides/{id}** (PUBLIC)
- Get single guide
- Return: guide data + file_path (for viewer)

**PATCH /api/v1/guides/{id}** (ADMIN)
- Update: title, description, is_published
- Can't re-upload file (separate delete + upload if needed)

**DELETE /api/v1/guides/{id}** (ADMIN)
- Delete guide + remove file from storage

**GET /api/v1/guides/admin/all** (ADMIN)
- List all guides (all types)
- Show: title, type, uploaded_date, uploaded_by
- For admin management page

## Frontend

### Public: /panduan/student, /panduan/school, /panduan/company
- Show guides for that role
- Display:
  - Guide title
  - Description
  - PDF viewer (embed using pdf.js or similar)
  - Download button (optional)

### Admin: /dashboard/guides
- List all guides
- Table: Title, Type, Uploaded Date, Actions
- Actions: View, Edit, Delete (with confirmation)
- "Upload New Guide" button

### Admin: /dashboard/guides/upload
- Form:
  - Type (dropdown: student/school/company, required)
  - Title (text, required)
  - Description (textarea, optional)
  - File upload (PDF only, required)
- Submit POST to /api/v1/guides
- On success: redirect to guides list

### Admin: /dashboard/guides/[id]/edit
- Form (pre-filled):
  - Title (editable)
  - Description (editable)
  - Type (read-only, can't change)
  - Current file info + "Replace file" option
- Submit PATCH to /api/v1/guides/{id}
- Delete button: DELETE to /api/v1/guides/{id}

---

# FEATURE 3: KELAS PRA MAGANG (Pre-Internship Classes)

## Feature Overview
- Schools and Companies create training classes
- Admin can edit/delete any class
- Students can:
  - View available classes
  - Enroll in classes
  - Drop classes
  - View their progress
- Admin/Teachers can:
  - See enrollments
  - Track attendance
  - Track progress

## Database Schema

```sql
Schema::create('pre_internship_classes', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->text('description')->nullable();
    $table->dateTime('start_date');
    $table->dateTime('end_date');
    $table->integer('capacity');
    $table->enum('level')->values(['beginner', 'intermediate', 'advanced']);
    $table->enum('status')->values(['scheduled', 'ongoing', 'completed'])->default('scheduled');
    $table->uuid('created_by_id'); // School or Company ID
    $table->enum('created_by_type')->values(['school', 'company']);
    $table->timestamps();
    
    $table->foreign('created_by_id')->references('id')->on('users')->onDelete('cascade');
});

Schema::create('pre_internship_enrollments', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('student_id');
    $table->uuid('class_id');
    $table->enum('status')->values(['enrolled', 'completed', 'dropped'])->default('enrolled');
    $table->integer('attendance_count')->default(0);
    $table->integer('total_sessions')->default(0);
    $table->dateTime('enrolled_at');
    $table->dateTime('completed_at')->nullable();
    $table->timestamps();
    
    $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('class_id')->references('id')->on('pre_internship_classes')->onDelete('cascade');
    $table->unique(['student_id', 'class_id']);
});

Schema::create('class_attendance', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('enrollment_id');
    $table->dateTime('session_date');
    $table->boolean('present')->default(false);
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->foreign('enrollment_id')->references('id')->on('pre_internship_enrollments')->onDelete('cascade');
});
```

## Backend

### Models

**PreInternshipClass:**
- hasMany: enrollments (PreInternshipEnrollment)
- belongsTo: createdBy (User)

**PreInternshipEnrollment:**
- belongsTo: class (PreInternshipClass)
- belongsTo: student (User)
- hasMany: attendance (ClassAttendance)

**ClassAttendance:**
- belongsTo: enrollment (PreInternshipEnrollment)

### Controller: PreInternshipClassController

**GET /api/v1/pre-internship-classes** (PUBLIC)
- List available classes (status != completed)
- Show capacity progress (enrolled/capacity)
- Filter by level
- Return: title, description, dates, capacity, level, enrolled_count

**POST /api/v1/pre-internship-classes** (SCHOOL/COMPANY)
- Create new class
- Input: title, description, start_date, end_date, capacity, level
- Auto-set created_by to current user
- Auto-set created_by_type to school or company
- Return: class data

**PATCH /api/v1/pre-internship-classes/{id}** (ADMIN or CREATOR)
- Update class info
- Input: title, description, capacity, level, start_date, end_date
- Can only be done before class starts

**DELETE /api/v1/pre-internship-classes/{id}** (ADMIN or CREATOR)
- Delete class (only if no enrollments or before start date)

**POST /api/v1/pre-internship-classes/{id}/enroll** (STUDENT - auth required)
- Enroll current user in class
- Check if class is full (enrolled >= capacity)
- Check if already enrolled
- Create enrollment record
- Return: success message

**DELETE /api/v1/pre-internship-enrollments/{id}** (STUDENT)
- Drop class
- Only if status is 'enrolled'
- Update status to 'dropped'

**GET /api/v1/my-pre-internship-classes** (STUDENT - auth required)
- Get student's enrolled classes
- Show: class info + enrollment status + attendance % + progress

**GET /api/v1/pre-internship-classes/{id}/enrollments** (ADMIN/CREATOR)
- List all enrollments for a class
- Show: student name, enrollment date, status, attendance count
- For teacher/admin to manage

**POST /api/v1/class-attendance** (ADMIN/CREATOR)
- Mark attendance for a student in a session
- Input: enrollment_id, session_date, present, notes
- Update attendance_count in enrollment

**GET /api/v1/pre-internship-enrollments/{id}/attendance** (STUDENT/ADMIN)
- View attendance record for enrollment
- Show all sessions + present/absent

## Frontend

### Student: /dashboard/pre-internship-classes
- List available classes
- Card per class showing:
  - Title, description, dates
  - Level (badge)
  - Capacity progress bar (enrolled/total)
  - "Enroll" button (disabled if full)
- Filter by level

### Student: /dashboard/my-pre-internship-classes
- List student's enrolled classes
- Card per class showing:
  - Title, dates, level
  - Status badge (enrolled/completed/dropped)
  - Attendance: X/Y sessions
  - Progress bar: attendance %
  - "Drop Class" button (if enrolled)
  - "View Attendance" button

### Student: /dashboard/my-pre-internship-classes/[id]/attendance
- Show class details
- List all sessions:
  - Date, Present/Absent, Notes
- Summary: X attended / Y total = Z%

### Admin/Teacher: /dashboard/pre-internship-classes/[id]/enrollments
- List all enrollments for class
- Table: Student Name, Enrolled Date, Status, Attendance %
- Actions: View student attendance, Mark attendance
- Bulk attendance marking (optional)

### Admin/Teacher: /dashboard/pre-internship-classes/manage
- List all classes (all creators)
- Table: Title, Creator, Start Date, Status, Enrolled/Capacity
- Actions: View, Edit, Delete, View Enrollments
- "Create New Class" button

---

# FEATURE 4: GURU PEMBIMBING (Mentors)

## Feature Overview
- Schools assign mentors to their students
- Admin can override/edit assignments
- Students can view their assigned mentor info
- Display mentor name, expertise, bio, availability, contact info
- Students can email/call mentor directly (show contact info)

## Database Schema

```sql
Schema::create('mentors', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id');
    $table->string('expertise');
    $table->text('bio')->nullable();
    $table->string('phone')->nullable();
    $table->enum('availability')->values(['available', 'limited', 'unavailable'])->default('available');
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
});

Schema::create('mentor_assignments', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('student_id');
    $table->uuid('mentor_id');
    $table->uuid('assigned_by_id'); // School or Admin
    $table->dateTime('assigned_at');
    $table->dateTime('ended_at')->nullable();
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('mentor_id')->references('id')->on('mentors')->onDelete('cascade');
    $table->foreign('assigned_by_id')->references('id')->on('users')->onDelete('cascade');
});
```

## Backend

### Models

**Mentor:**
- belongsTo: user (User)
- hasMany: assignments (MentorAssignment)

**MentorAssignment:**
- belongsTo: student (User)
- belongsTo: mentor (Mentor)
- belongsTo: assignedBy (User)

### Controller: MentorController

**GET /api/v1/mentors** (PUBLIC)
- List all available mentors
- Show: name, expertise, bio, availability
- Return: id, name, expertise, availability (for browsing)

**GET /api/v1/mentors/{id}** (PUBLIC)
- Get single mentor full profile
- Show: name, expertise, bio, availability, phone (if public)

**POST /api/v1/mentors** (ADMIN)
- Create mentor profile
- Input: user_id, expertise, bio, phone, availability

**PATCH /api/v1/mentors/{id}** (ADMIN)
- Update mentor info
- Input: expertise, bio, phone, availability

**DELETE /api/v1/mentors/{id}** (ADMIN)
- Delete mentor profile

**GET /api/v1/my-mentor** (STUDENT - auth required)
- Get current assigned mentor
- Show: all mentor info + assignment details
- Return: mentor full profile + assignment notes

**POST /api/v1/mentor-assignments** (SCHOOL/ADMIN)
- Assign mentor to student
- Input: student_id, mentor_id, notes (optional)
- Only one active assignment per student (end previous if exists)
- Auto-set assigned_by to current user

**GET /api/v1/mentor-assignments** (ADMIN)
- List all mentor assignments
- Filter by: student, mentor, school, status (active/ended)
- Show: student, mentor, assigned date, assigned by

**PATCH /api/v1/mentor-assignments/{id}/end** (ADMIN/SCHOOL)
- End a mentor assignment
- Set ended_at to current time

## Frontend

### Student: /dashboard/mentor
- Show assigned mentor:
  - Name (large)
  - Expertise (bold)
  - Bio (paragraph)
  - Availability status (badge: Available/Limited/Unavailable)
  - Phone number (clickable: tel: link)
  - Email (clickable: mailto: link)
  - Assigned date
  - Assignment notes (if any)
- Action buttons:
  - "Email Mentor" (opens email client with to: filled)
  - "Call Mentor" (tel: link, opens phone app)
  - "View Mentor Profile" (optional, full page view)

### Admin: /dashboard/mentors
- List all mentors
- Table: Name, Expertise, Availability, Active Assignments Count
- Actions: Edit, Delete, View Profile, View Assignments
- "Create New Mentor" button

### Admin: /dashboard/mentors/[id]
- Mentor profile:
  - Name, User ID, Expertise, Bio, Phone, Availability
  - Edit form (PATCH request)
  - Delete button

### Admin: /dashboard/mentor-assignments
- List all assignments
- Table: Student Name, Mentor Name, Assigned Date, Assigned By, Status
- Filter by: status (active/ended), student, mentor
- Actions: View details, End assignment
- "Create Assignment" button (modal form)

### Admin: /dashboard/mentor-assignments/create
- Modal/form:
  - Student dropdown (searchable)
  - Mentor dropdown (searchable)
  - Notes textarea (optional)
  - Submit button
- On success: show in list, reload

---

# IMPLEMENTATION CHECKLIST

## HUBUNGI KAMI (Contact Form)
- [ ] Migrations: contact_messages, contact_replies
- [ ] Models: ContactMessage, ContactReply
- [ ] Controller: ContactController with 5 endpoints
- [ ] Requests: StoreContactMessageRequest, StoreContactReplyRequest
- [ ] Mails: ContactFormSubmitted, ContactReplyNotification
- [ ] Routes: Add to api.php
- [ ] Frontend: Contact form page + Admin list + Admin detail + reply form

## PANDUAN (Guides)
- [ ] Migration: guides table
- [ ] Model: Guide
- [ ] Controller: GuideController with CRUD endpoints
- [ ] Request: StoreGuideRequest
- [ ] Routes: Add to api.php
- [ ] Frontend: Public guide pages (student/school/company) + Admin management

## KELAS PRA MAGANG (Classes)
- [ ] Migrations: pre_internship_classes, pre_internship_enrollments, class_attendance
- [ ] Models: PreInternshipClass, PreInternshipEnrollment, ClassAttendance
- [ ] Controller: PreInternshipClassController (full CRUD + enrollment)
- [ ] Requests: StoreClassRequest, StoreEnrollmentRequest
- [ ] Routes: Add to api.php
- [ ] Frontend: Student browse/enroll/drop + Admin manage + Attendance tracking

## GURU PEMBIMBING (Mentors)
- [ ] Migrations: mentors, mentor_assignments
- [ ] Models: Mentor, MentorAssignment
- [ ] Controller: MentorController with CRUD + assignments
- [ ] Requests: StoreMentorRequest, StoreMentorAssignmentRequest
- [ ] Routes: Add to api.php
- [ ] Frontend: Student view mentor + Admin CRUD mentors + Admin manage assignments

---

**Ready to build. Let the AI run with this.** 🚀
