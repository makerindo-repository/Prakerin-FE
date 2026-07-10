# 🚀 COMPLETE TECHNICAL GUIDE: ALL P2 FEATURES

This document contains detailed technical specs for all 3 P2 (Priority 2) features: Reports, Activity Logs, and Awards. Give this to AI when P1 is complete.

---

# FEATURE 1: LAPORAN (Reports)

## Feature Overview
- Admin can view comprehensive internship statistics
- Reports include: internship stats, student progress, company performance
- Admin can export reports to CSV/PDF
- Admin can schedule automated reports (daily/weekly/monthly)
- Reports show data visualizations (charts/graphs)

## Database Schema

```sql
Schema::create('reports', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->enum('type')->values(['internship_stats', 'student_progress', 'company_performance']);
    $table->json('data'); // Store report data as JSON
    $table->dateTime('generated_at');
    $table->uuid('generated_by_id');
    $table->timestamps();
    
    $table->foreign('generated_by_id')->references('id')->on('users')->onDelete('cascade');
});

Schema::create('scheduled_reports', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('created_by_id');
    $table->enum('type')->values(['internship_stats', 'student_progress', 'company_performance']);
    $table->enum('frequency')->values(['daily', 'weekly', 'monthly']);
    $table->string('email_recipients'); // JSON array of emails
    $table->dateTime('last_sent_at')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->foreign('created_by_id')->references('id')->on('users')->onDelete('cascade');
});
```

## Backend

### Models

**Report:**
- belongsTo: generatedBy (User)
- Attributes: id, type, data (JSON), generated_at

**ScheduledReport:**
- belongsTo: createdBy (User)
- Attributes: id, type, frequency, email_recipients (JSON), last_sent_at, is_active

### Controller: ReportController

**GET /api/v1/reports/internship-stats** (ADMIN)
- Query internships data
- Return:
  - Total internships (count)
  - By status: pending, ongoing, completed
  - By company: breakdown per company
  - By field: breakdown per field
  - Average duration
  - Success rate (completed / total)
- Add filters: date range, company, field, status

**GET /api/v1/reports/student-progress** (ADMIN)
- Query student data
- Return:
  - Total students
  - By status: not_started, ongoing, completed
  - Enrolled in classes (count)
  - Completed pre-internship (count)
  - Dropout rate
  - Average rating received
- Add filters: date range, school, status

**GET /api/v1/reports/company-performance** (ADMIN)
- Query company/internship data
- Return:
  - Total companies
  - Placements per company
  - Average student rating per company
  - Retention rate (students who return)
  - Job offer rate (if tracked)
- Add filters: date range, location, industry

**POST /api/v1/reports/export** (ADMIN)
- Input: type (internship_stats/student_progress/company_performance), format (csv/pdf), filters
- Query data based on type + filters
- Generate file (CSV or PDF)
- Return: download link or file stream

**POST /api/v1/scheduled-reports** (ADMIN)
- Create scheduled report
- Input: type, frequency (daily/weekly/monthly), email_recipients (array)
- Validate email addresses
- Return: scheduled report data

**GET /api/v1/scheduled-reports** (ADMIN)
- List all scheduled reports
- Show: type, frequency, recipients, last_sent_at, is_active
- Actions: Edit, Delete, Run Now

**PATCH /api/v1/scheduled-reports/{id}** (ADMIN)
- Update scheduled report
- Input: type, frequency, email_recipients, is_active

**DELETE /api/v1/scheduled-reports/{id}** (ADMIN)
- Delete scheduled report

**POST /api/v1/scheduled-reports/{id}/run-now** (ADMIN)
- Trigger scheduled report immediately
- Generate report + send email

### Scheduled Job (Laravel Scheduler)

**ReportScheduleJob:**
- Runs daily to check for scheduled reports
- For each scheduled report:
  - If frequency matches current day/time:
    - Generate report data
    - Export to CSV/PDF
    - Send email to recipients
    - Update last_sent_at

### Export Services

**ReportExporter:**
- Method: `toCSV(data, type)` → CSV file
- Method: `toPDF(data, type)` → PDF file
- Use: Laravel Excel (Maatwebsite/Excel) for CSV
- Use: TCPDF or DomPDF for PDF generation

## Frontend

### Admin: /dashboard/laporan
- Tabs for report types:
  1. Internship Stats
  2. Student Progress
  3. Company Performance

**Each tab shows:**
- Summary cards with key metrics
- Charts/graphs:
  - Bar chart: by company/school/field
  - Pie chart: by status
  - Line chart: over time (monthly trend)
- Filters: date range, company, field, etc
- Export button (CSV/PDF)
- View full data table (if needed)

### Admin: /dashboard/laporan/scheduled
- List all scheduled reports
- Table: Type, Frequency, Recipients, Last Sent, Status
- Actions: Edit, Delete, Run Now
- "Create Scheduled Report" button

### Admin: /dashboard/laporan/scheduled/[id]/edit
- Form:
  - Type (dropdown, read-only after create)
  - Frequency (dropdown: daily, weekly, monthly)
  - Email recipients (tag input or textarea)
  - Is Active (toggle)
- Submit PATCH to /api/v1/scheduled-reports/{id}
- Delete button

### Components Needed
- ReportChart (for displaying charts using Chart.js or Recharts)
- ReportFilters (date range, company, field pickers)
- ExportButtons (CSV, PDF download)
- ScheduledReportForm

---

# FEATURE 2: LOG AKTIVITAS (Activity Logs)

## Feature Overview
- Automatic logging of user actions (logins, CRUD operations)
- Admin can view activity logs with filters
- Filter by: user, action type, date range
- Display: who did what, when, resource affected

## Database Schema

```sql
Schema::create('activity_logs', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id');
    $table->enum('action')->values(['login', 'logout', 'create', 'update', 'delete', 'download', 'upload']);
    $table->string('resource_type'); // e.g., 'Student', 'Company', 'Internship'
    $table->uuid('resource_id')->nullable();
    $table->string('resource_name')->nullable(); // e.g., 'John Doe' or 'Class A'
    $table->string('ip_address')->nullable();
    $table->string('user_agent')->nullable(); // Browser/device info
    $table->text('description')->nullable(); // More details if needed
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->index('user_id');
    $table->index('action');
    $table->index('resource_type');
    $table->index('created_at');
});
```

## Backend

### Model: ActivityLog

**Attributes:**
- id, user_id, action, resource_type, resource_id, resource_name, ip_address, user_agent, description, created_at

**Relationships:**
- belongsTo: user (User)

**Methods:**
- scope byUser($userId)
- scope byAction($action)
- scope byResourceType($type)
- scope dateRange($start, $end)
- scope recent() → order by created_at DESC

### Middleware: LogActivity

**Location:** app/Http/Middleware/LogActivity.php

**Logic:**
- Capture all requests
- Log login: when user authenticates
- Log logout: when user logs out
- Log CRUD:
  - Listen to model events (creating, created, updating, updated, deleting, deleted)
  - Capture: action, resource type, resource ID, resource name
  - Get: authenticated user, IP, user agent
  - Store to activity_logs table
- Skip logging for:
  - GET requests (except logins)
  - Health check endpoints
  - File serving

**Model Events (in Model boot()):**
```php
protected static function booted()
{
    static::created(function ($model) {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'create',
            'resource_type' => class_basename($model),
            'resource_id' => $model->id,
            'resource_name' => $model->name ?? $model->title ?? 'Record',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    });
    
    static::updated(function ($model) {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'update',
            'resource_type' => class_basename($model),
            'resource_id' => $model->id,
            'resource_name' => $model->name ?? $model->title ?? 'Record',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    });
    
    static::deleted(function ($model) {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'delete',
            'resource_type' => class_basename($model),
            'resource_id' => $model->id,
            'resource_name' => $model->name ?? $model->title ?? 'Record',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    });
}
```

### Controller: ActivityLogController

**GET /api/v1/activity-logs** (ADMIN)
- List all activity logs
- Paginate (50 per page)
- Show: user name, action (badge), resource type, resource name, date, IP
- Support filters:
  - byUser (dropdown of users)
  - byAction (dropdown: login, logout, create, update, delete)
  - byResourceType (dropdown: Student, Company, Internship, etc)
  - dateRange (date picker)
- Search by: resource name, username
- Sort by: newest first

**GET /api/v1/activity-logs/stats** (ADMIN)
- Summary statistics:
  - Total logs (today, this week, this month)
  - Most active user
  - Most logged action type
  - Most frequently modified resource
  - Login count (today)

## Frontend

### Admin: /dashboard/log-aktivitas
- Table showing:
  - User name (clickable → user profile)
  - Action (colored badge: login=blue, create=green, update=yellow, delete=red)
  - Resource Type
  - Resource Name
  - Date & Time
  - IP Address (hover shows location if available)
  - Actions: View details

- Filters (sidebar or top bar):
  - User dropdown (searchable)
  - Action dropdown (multi-select)
  - Resource Type dropdown
  - Date Range picker
  - Search box (for resource name)

- Additional:
  - Pagination
  - Export button (CSV)
  - Summary stats cards at top:
    - Total actions today
    - Most active user
    - Total logins today
    - Resource types modified

### Components Needed
- ActivityLogTable
- ActivityLogFilters
- ActionBadge (for coloring actions)
- StatsCards

---

# FEATURE 3: PENGHARGAAN (Awards)

## Feature Overview
- Admin creates awards with name, description, icon, category, point value
- Admin assigns awards to students
- Students see their awards on profile
- Awards display with certificate (can be printed)
- Public leaderboard showing top award earners

## Database Schema

```sql
Schema::create('awards', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('icon'); // Icon name (Lucide) or image path
    $table->enum('category')->values(['achievement', 'excellence', 'participation', 'special']);
    $table->integer('point_value')->default(0);
    $table->boolean('is_active')->default(true);
    $table->uuid('created_by_id');
    $table->timestamps();
    
    $table->foreign('created_by_id')->references('id')->on('users')->onDelete('cascade');
});

Schema::create('student_awards', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('student_id');
    $table->uuid('award_id');
    $table->text('reason')->nullable(); // Why awarded
    $table->dateTime('awarded_at');
    $table->uuid('awarded_by_id');
    $table->boolean('is_public')->default(true); // Show on profile
    $table->timestamps();
    
    $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('award_id')->references('id')->on('awards')->onDelete('cascade');
    $table->foreign('awarded_by_id')->references('id')->on('users')->onDelete('cascade');
    $table->unique(['student_id', 'award_id']); // One award per student max
});
```

## Backend

### Models

**Award:**
- hasMany: studentAwards (StudentAward)
- belongsTo: createdBy (User)
- Attributes: id, name, description, icon, category, point_value, is_active

**StudentAward:**
- belongsTo: student (User)
- belongsTo: award (Award)
- belongsTo: awardedBy (User)
- Attributes: id, student_id, award_id, reason, awarded_at, awarded_by_id, is_public

### Controller: AwardController

**POST /api/v1/awards** (ADMIN)
- Create award
- Input: name, description, icon, category, point_value
- Validate: all required except description, icon must be valid Lucide icon name
- Return: award data

**GET /api/v1/awards** (ADMIN)
- List all awards
- Show: name, category, point_value, active status, created date
- Filter by: category, is_active
- Paginate

**GET /api/v1/awards/{id}** (PUBLIC)
- Get single award details
- Show: full info + count of students who have it

**PATCH /api/v1/awards/{id}** (ADMIN)
- Update award
- Input: name, description, icon, category, point_value, is_active

**DELETE /api/v1/awards/{id}** (ADMIN)
- Delete award
- Only if no students have it (or soft delete)

**POST /api/v1/student-awards** (ADMIN)
- Assign award to student
- Input: student_id, award_id, reason (optional), is_public (optional)
- Validate: student exists, award exists, award not already assigned to this student
- Auto-set: awarded_at (now), awarded_by_id (current user)
- Return: student award data

**DELETE /api/v1/student-awards/{id}** (ADMIN)
- Remove award from student

**GET /api/v1/students/{studentId}/awards** (PUBLIC)
- Get all awards for a student
- Show only if is_public = true
- Return: awards list + total points

**GET /api/v1/awards/leaderboard** (PUBLIC)
- Get top students by total points
- Return: top 10/20 students with name, avatar, total points, award count
- Filter by: category (optional)

### Certificate Service

**CertificateGenerator:**
- Method: `generate(studentAward)` → PDF
- Content:
  - Award name
  - Student name
  - Award date
  - Reason (if provided)
  - Certificate template design
- Use: DomPDF or TCPDF to generate PDF

## Frontend

### Admin: /dashboard/awards
- List all awards
- Table: Name, Category (badge), Points, Active Status, Created Date, Actions
- Actions: Edit, Delete, View Recipients
- "Create Award" button

### Admin: /dashboard/awards/create
- Form:
  - Name (text, required)
  - Description (textarea, optional)
  - Icon (Lucide icon picker or dropdown, required)
  - Category (dropdown: achievement, excellence, participation, special)
  - Point Value (number, default 0)
  - Is Active (toggle)
- Submit POST to /api/v1/awards
- On success: redirect to awards list

### Admin: /dashboard/awards/[id]/edit
- Form (pre-filled):
  - Same as create form
  - Submit PATCH to /api/v1/awards/{id}
  - Delete button

### Admin: /dashboard/awards/[id]/recipients
- List all students who have this award
- Table: Student Name, Awarded Date, Reason, Actions
- Remove button (DELETE /api/v1/student-awards/{id})
- "Assign to Student" button

### Admin: /dashboard/awards/assign
- Form:
  - Student dropdown (searchable)
  - Award dropdown (searchable, only active awards)
  - Reason textarea (optional)
  - Is Public toggle (default true)
- Submit POST to /api/v1/student-awards
- On success: show toast, redirect or reload

### Student: /dashboard/my-awards
- Show student's awards
- Card per award:
  - Icon (large)
  - Award name
  - Category badge
  - Points earned
  - Awarded date
  - Reason (if provided)
  - "Print Certificate" button → downloads PDF
  - "Share" button (optional social share)

### Public: /awards/leaderboard
- Top 10/20 students by total points
- Cards showing:
  - Rank (1, 2, 3, etc)
  - Student avatar/name (clickable → profile)
  - Total points
  - Award count
  - Top 3 awards
- Filter by category (optional)
- Show profile link: "View Profile" → /profile/{studentId}

### Public: /profile/{studentId}/awards
- Show student's public awards
- Same as /dashboard/my-awards but view-only for others
- Awards display cards with icons
- Total points summary
- If viewing own profile: add edit permissions

### Components Needed
- AwardCard (display award with icon + details)
- AwardForm (create/edit form)
- AwardAssignForm
- CertificatePreview
- LeaderboardRanking (with badges for top 3)
- IconPicker (Lucide icon selector)

---

# IMPLEMENTATION CHECKLIST

## LAPORAN (Reports)
- [ ] Migrations: reports, scheduled_reports
- [ ] Models: Report, ScheduledReport
- [ ] Controller: ReportController (5+ endpoints)
- [ ] Services: ReportExporter (CSV, PDF)
- [ ] Scheduled Job: ReportScheduleJob (Laravel Scheduler)
- [ ] Routes: Add to api.php
- [ ] Frontend: Dashboard with charts + scheduled reports management

## LOG AKTIVITAS (Activity Logs)
- [ ] Migration: activity_logs
- [ ] Model: ActivityLog with scopes
- [ ] Middleware: LogActivity
- [ ] Controller: ActivityLogController (2 endpoints)
- [ ] Routes: Add to api.php
- [ ] Frontend: Activity logs dashboard with filters + stats

## PENGHARGAAN (Awards)
- [ ] Migrations: awards, student_awards
- [ ] Models: Award, StudentAward
- [ ] Controller: AwardController (8+ endpoints)
- [ ] Service: CertificateGenerator (PDF)
- [ ] Routes: Add to api.php
- [ ] Frontend: Award management + student awards + leaderboard

---

**Ready for next phase. Let the AI build P2 after P1 is complete!** 🚀
