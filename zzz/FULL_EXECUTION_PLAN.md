# 🚀 FULL EXECUTION PLAN — ALL 18 FEATURES

**Project Stack:**
- Backend: Laravel + Sanctum (API-first)
- Frontend: React + Next.js (/src structure) + Tailwind CSS + Lucide icons
- DB: Full dummy data ready
- Team: 4 people (2 human + 2 AI) working NOW

**Status: 0% done today → 100% planned & ready to execute**

---

## 📊 MASTER BREAKDOWN

| Priority | Feature | Type | Effort | Status |
|----------|---------|------|--------|--------|
| P0 | Fix 6 buggy features (M) | Bug Fix | 2-3 days | See Section 2 |
| P1 | Hubungi kami (Contact) | New | 1 day | See Section 3.1 |
| P1 | Panduan (Guides) | New | 2 days | See Section 3.2 |
| P1 | Kelas Pra Magang (Student) | New | 2-3 days | See Section 3.3 |
| P1 | Guru Pembimbing (Mentors) | New | 1-2 days | See Section 3.4 |
| P2 | Penempatan (Placement) | New | 3-4 days | See Section 3.5 |
| P2 | Data Sekolah (School Data) | New | 2 days | See Section 3.6 |
| P2 | Data Universitas (University Data) | New | 2 days | See Section 3.7 |
| P2 | Kelas Pra Magang (School) | New | 2-3 days | See Section 3.8 |
| P2 | Kelas Pra Magang (Company) | New | 2-3 days | See Section 3.9 |
| P2 | Pembimbing (Mentors CRUD) | New | 2-3 days | See Section 3.10 |
| P3 | Panduan (Admin) | New | 1 day | See Section 3.11 |
| P3 | Penghargaan (Awards) | New | 2 days | See Section 3.12 |

**Total Realistic Effort: 23-31 days for 2 people (11-15 days for 4 people with parallelization)**

---

## SECTION 1: UNDERSTANDING THE CURRENT STATE

### Step 0: Audit Before Building

**Have your IDE AI run these checks FIRST (30 mins):**

```
BACKEND CHECKS:
1. List all models in /app/Models/ 
   - Which ones exist? (User, Student, Company, Internship, Feedback, etc.)
   - Which relationships are defined?

2. Check /app/Http/Controllers/
   - Which CRUD controllers exist?
   - Pattern: ResourceController vs custom methods?

3. Check /routes/api.php
   - What endpoints exist?
   - What's the URL pattern? (/api/v1/... ?)

4. Check /database/migrations/
   - Which tables have migrations?
   - Are there any pre_internship_classes, mentors, placements tables?

FRONTEND CHECKS:
1. Check /src/app layout
   - How are routes organized?
   - Is there a /dashboard folder?

2. Check /src/components
   - What existing components can be reused?
   - Are there CRUDTemplates or FormComponents?

3. Check API service
   - How are API calls made? (axios wrapper?)
   - What's the base URL pattern?

4. Check Tailwind setup
   - Custom colors defined?
   - Design tokens?
```

**Report back findings before starting Section 2.**

---

## SECTION 2: FIX THE 6 BUGGY FEATURES (M)

### 2.1 Fix: Siswa CRUD (Student)
**Problem:** Minor bugs in form validation, styling, or edge cases

**What to do:**
1. **Backend:** Check StudentController@store, @update methods
   - Look for: Incomplete validation, missing error handling
   - Add: Proper error messages, field validation rules
   
2. **Frontend:** Check Student CRUD form
   - Look for: Broken form fields, missing error display
   - Fix: Add validation feedback, fix CSS classes

**Time: 1-2 hours per bug**
**Ask AI to check:** `/app/Http/Controllers/StudentController.php` + student form component

---

### 2.2 Fix: Mahasiswa CRUD (University Student)
**Similar to Siswa — likely same bug patterns**

**Time: 1-2 hours**

---

### 2.3 Fix: Managemen User CRUD
**Problem:** User management permissions/role filtering issues

**What to do:**
1. Check if role filtering works (admin vs company vs student)
2. Verify delete permissions (who can delete who?)
3. Fix UI to show role badges properly

**Time: 1-2 hours**

---

### 2.4 Fix: Laporan (Reports)
**Problem:** Data accuracy, export format, or filtering issues

**What to do:**
1. Check report data calculation (is math correct?)
2. Fix export format (PDF/Excel generation)
3. Test date range filtering

**Time: 2 hours**

---

### 2.5 Fix: Log Aktivitas (Activity Log)
**Problem:** Filtering, pagination, timestamp display

**What to do:**
1. Add proper date formatting
2. Fix pagination controls
3. Add filtering by user/action type

**Time: 1 hour**

---

### 2.6 Fix: Penghargaan (Awards)
**Problem:** Visual display or filtering

**What to do:**
1. Check award card rendering
2. Fix filtering by category/level
3. Add proper styling/icons

**Time: 1 hour**

**Total for Section 2: 8-10 hours (can be done in parallel by 2 people)**

---

## SECTION 3: BUILD THE 12 MISSING FEATURES

### 3.1 HUBUNGI KAMI (Contact Form) — P1 Priority

**Context:** Users contact admin/staff from landing page

**Backend Requirements:**

1. **Create Model** (if doesn't exist):
   ```php
   // App/Models/ContactMessage.php
   - id (UUID)
   - name (string)
   - email (string)
   - phone (string)
   - subject (string)
   - message (text)
   - status (enum: 'new', 'read', 'replied')
   - replied_by (FK to users.id, nullable)
   - replied_at (timestamp, nullable)
   - created_at, updated_at
   ```

2. **Create Migration** (if doesn't exist):
   ```bash
   php artisan make:model ContactMessage -m
   ```
   Add fields above

3. **Create Controller**:
   ```php
   // App/Http/Controllers/ContactController.php
   
   class ContactController extends Controller {
       // Store contact message (PUBLIC - no auth needed)
       public function store(Request $request) {
           $validated = $request->validate([
               'name' => 'required|string|max:255',
               'email' => 'required|email',
               'phone' => 'required|string',
               'subject' => 'required|string|max:255',
               'message' => 'required|string'
           ]);
           
           ContactMessage::create($validated);
           
           // Send email to admin
           Mail::to(config('app.admin_email'))->send(new ContactFormNotification($validated));
           
           return response()->json(['message' => 'Message sent successfully']);
       }
       
       // Admin view messages
       public function index(Request $request) {
           $this->authorize('admin-access'); // Sanctum ability
           
           return ContactMessage::orderBy('created_at', 'DESC')
               ->paginate(20);
       }
       
       // Mark as replied
       public function reply(ContactMessage $contact, Request $request) {
           $this->authorize('admin-access');
           
           $contact->update([
               'status' => 'replied',
               'replied_by' => auth()->id(),
               'replied_at' => now()
           ]);
           
           return response()->json($contact);
       }
   }
   ```

4. **Create Routes**:
   ```php
   // routes/api.php
   
   // Public route
   Route::post('/contacts', [ContactController::class, 'store']);
   
   // Admin routes
   Route::middleware('auth:sanctum')->group(function () {
       Route::get('/contacts', [ContactController::class, 'index'])
           ->middleware('abilities:admin-access');
       Route::patch('/contacts/{contact}/reply', [ContactController::class, 'reply'])
           ->middleware('abilities:admin-access');
   });
   ```

5. **Create Mailable** (for email notifications):
   ```bash
   php artisan make:mail ContactFormNotification
   ```

**Frontend Requirements:**

1. **Create Contact Form Component**:
   ```typescript
   // src/components/ContactForm.tsx
   - Form fields: name, email, phone, subject, message
   - Validation: all required, email format
   - Submit: POST to /api/v1/contacts
   - Success message: "Message sent! We'll respond soon"
   - Error handling
   ```

2. **Add to Landing Page**:
   - Section with form
   - Form styled with Tailwind
   - Success/error toast notifications

3. **Create Admin Page** (if time):
   ```typescript
   // src/app/dashboard/contact-messages/page.tsx
   - List all messages
   - Filter by status (new, read, replied)
   - Click to view message
   - Reply button
   ```

**Effort: 1 day (6-8 hours)**
**Team: 1 person backend + 1 person frontend (parallel)**

---

### 3.2 PANDUAN (Guides) — P1 Priority

**Context:** Educational guides for Students, Schools, Companies. Superadmin can upload PDFs.

**Database Requirements:**

1. **Create Table**:
   ```php
   // Migration
   Schema::create('guides', function (Blueprint $table) {
       $table->uuid('id')->primary();
       $table->enum('type')->values(['student', 'school', 'company']);
       $table->string('title');
       $table->text('description')->nullable();
       $table->string('file_path')->nullable(); // PDF path
       $table->boolean('is_published')->default(false);
       $table->timestamps();
   });
   ```

2. **Create Model**:
   ```php
   class Guide extends Model {
       protected $fillable = ['type', 'title', 'description', 'file_path', 'is_published'];
   }
   ```

**Backend Requirements:**

1. **Create Controller**:
   ```php
   class GuideController extends Controller {
       // Get guides by type (PUBLIC)
       public function getByType($type) {
           return Guide::where('type', $type)
               ->where('is_published', true)
               ->get();
       }
       
       // Admin: Upload guide
       public function upload(Request $request) {
           $this->authorize('admin-access');
           
           $validated = $request->validate([
               'type' => 'required|in:student,school,company',
               'title' => 'required|string',
               'description' => 'nullable|string',
               'file' => 'required|mimes:pdf|max:10240' // 10MB max
           ]);
           
           $filePath = $request->file('file')->store('guides');
           
           Guide::create([
               'type' => $validated['type'],
               'title' => $validated['title'],
               'description' => $validated['description'],
               'file_path' => $filePath,
               'is_published' => true
           ]);
           
           return response()->json(['message' => 'Guide uploaded']);
       }
       
       // Admin: List all guides
       public function index() {
           $this->authorize('admin-access');
           return Guide::all();
       }
       
       // Admin: Delete guide
       public function destroy(Guide $guide) {
           $this->authorize('admin-access');
           Storage::delete($guide->file_path);
           $guide->delete();
           return response()->json(['message' => 'Deleted']);
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::get('/guides/{type}', [GuideController::class, 'getByType']);
   
   Route::middleware('auth:sanctum')->group(function () {
       Route::post('/guides', [GuideController::class, 'upload'])
           ->middleware('abilities:admin-access');
       Route::get('/guides', [GuideController::class, 'index'])
           ->middleware('abilities:admin-access');
       Route::delete('/guides/{guide}', [GuideController::class, 'destroy'])
           ->middleware('abilities:admin-access');
   });
   ```

**Frontend Requirements:**

1. **Create Public Guide Pages**:
   ```typescript
   // src/app/panduan/[type]/page.tsx
   - Fetch guides by type (student/school/company)
   - Display title, description
   - Embed or link to PDF
   - Use iframe or download button
   ```

2. **Create Admin Upload Page**:
   ```typescript
   // src/app/dashboard/guides/page.tsx
   - List existing guides
   - Form to upload new guide (type, title, description, PDF file)
   - Delete button
   - Search/filter by type
   ```

3. **Add to Navigation**:
   - Panduan link in navbar → routes to /panduan/student (or /panduan/school, /panduan/company)

**Effort: 2 days (12-16 hours)**
**Team: 1 person backend + 1 person frontend (parallel)**

---

### 3.3 KELAS PRA MAGANG (Student View) — P1 Priority

**Context:** Students view available pre-internship training classes and enroll.

**Database Requirements:**

1. **Create Table** (if doesn't exist):
   ```php
   Schema::create('pre_internship_classes', function (Blueprint $table) {
       $table->uuid('id')->primary();
       $table->string('title');
       $table->text('description');
       $table->date('start_date');
       $table->date('end_date');
       $table->integer('capacity');
       $table->enum('level')->values(['beginner', 'intermediate', 'advanced']);
       $table->enum('status')->values(['scheduled', 'ongoing', 'completed'])->default('scheduled');
       $table->timestamps();
   });
   
   Schema::create('pre_internship_enrollments', function (Blueprint $table) {
       $table->uuid('id')->primary();
       $table->uuid('student_id');
       $table->uuid('class_id');
       $table->enum('status')->values(['enrolled', 'completed', 'dropped'])->default('enrolled');
       $table->date('enrolled_at');
       $table->timestamps();
       
       $table->foreign('student_id')->references('id')->on('users');
       $table->foreign('class_id')->references('id')->on('pre_internship_classes');
       $table->unique(['student_id', 'class_id']);
   });
   ```

2. **Create Models**:
   ```php
   class PreInternshipClass extends Model {
       public function enrollments() {
           return $this->hasMany(PreInternshipEnrollment::class, 'class_id');
       }
   }
   
   class PreInternshipEnrollment extends Model {
       public function class() {
           return $this->belongsTo(PreInternshipClass::class, 'class_id');
       }
       public function student() {
           return $this->belongsTo(User::class, 'student_id');
       }
   }
   ```

**Backend Requirements:**

1. **Create Controller**:
   ```php
   class PreInternshipClassController extends Controller {
       // List available classes for student
       public function index() {
           return PreInternshipClass::where('status', '!=', 'completed')
               ->withCount('enrollments')
               ->get();
       }
       
       // Student enrolls in class
       public function enroll(PreInternshipClass $class) {
           $student = auth()->user();
           
           // Check capacity
           if ($class->enrollments()->count() >= $class->capacity) {
               return response()->json(['error' => 'Class is full'], 400);
           }
           
           // Check if already enrolled
           if ($class->enrollments()->where('student_id', $student->id)->exists()) {
               return response()->json(['error' => 'Already enrolled'], 400);
           }
           
           PreInternshipEnrollment::create([
               'student_id' => $student->id,
               'class_id' => $class->id,
               'enrolled_at' => now()
           ]);
           
           return response()->json(['message' => 'Enrolled successfully']);
       }
       
       // Student drops class
       public function drop(PreInternshipEnrollment $enrollment) {
           $this->authorize('own', $enrollment); // User can only drop their own
           
           $enrollment->update(['status' => 'dropped']);
           
           return response()->json(['message' => 'Dropped successfully']);
       }
       
       // Get student's enrollments
       public function myClasses() {
           $student = auth()->user();
           
           return PreInternshipEnrollment::where('student_id', $student->id)
               ->with('class')
               ->get();
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::get('/pre-internship-classes', [PreInternshipClassController::class, 'index']);
       Route::post('/pre-internship-classes/{class}/enroll', [PreInternshipClassController::class, 'enroll']);
       Route::patch('/pre-internship-enrollments/{enrollment}/drop', [PreInternshipClassController::class, 'drop']);
       Route::get('/my-pre-internship-classes', [PreInternshipClassController::class, 'myClasses']);
   });
   ```

**Frontend Requirements:**

1. **Create Class List Page**:
   ```typescript
   // src/app/dashboard/pre-internship-classes/page.tsx
   - List all available classes
   - Show: title, description, dates, capacity, level
   - Progress bar: enrolled / capacity
   - "Enroll" button (disabled if full)
   - Filter by level
   ```

2. **Create My Classes Page**:
   ```typescript
   // src/app/dashboard/my-pre-internship-classes/page.tsx
   - List student's enrolled classes
   - Show status (enrolled, completed, dropped)
   - "Drop Class" button
   - Show class details on click
   ```

3. **Add to Sidebar**:
   - Link to pre-internship classes

**Effort: 2-3 days (16-24 hours)**
**Team: 1 person backend + 1 person frontend (parallel)**

---

### 3.4 GURU PEMBIMBING (Mentors - Student View) — P1 Priority

**Context:** Students view their assigned mentors/guides.

**Database Requirements:**

1. **Create Table** (if doesn't exist):
   ```php
   Schema::create('mentors', function (Blueprint $table) {
       $table->uuid('id')->primary();
       $table->uuid('user_id'); // Teacher/Staff
       $table->string('title');
       $table->text('bio')->nullable();
       $table->string('expertise'); // e.g., "Web Development, UI/UX"
       $table->string('phone')->nullable();
       $table->string('email')->nullable();
       $table->timestamps();
       
       $table->foreign('user_id')->references('id')->on('users');
   });
   
   Schema::create('mentor_assignments', function (Blueprint $table) {
       $table->uuid('id')->primary();
       $table->uuid('student_id');
       $table->uuid('mentor_id');
       $table->date('assigned_at');
       $table->date('ended_at')->nullable();
       $table->timestamps();
       
       $table->foreign('student_id')->references('id')->on('users');
       $table->foreign('mentor_id')->references('id')->on('mentors');
   });
   ```

2. **Create Models**:
   ```php
   class Mentor extends Model {
       public function user() {
           return $this->belongsTo(User::class);
       }
   }
   
   class MentorAssignment extends Model {
       public function mentor() {
           return $this->belongsTo(Mentor::class);
       }
       public function student() {
           return $this->belongsTo(User::class, 'student_id');
       }
   }
   ```

**Backend Requirements:**

1. **Create Controller**:
   ```php
   class MentorController extends Controller {
       // Student: Get their current mentor
       public function myMentor() {
           $student = auth()->user();
           
           return MentorAssignment::where('student_id', $student->id)
               ->where('ended_at', null)
               ->with('mentor.user')
               ->latest('assigned_at')
               ->first();
       }
       
       // List all mentors (for assignment)
       public function index() {
           return Mentor::with('user')->get();
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::get('/my-mentor', [MentorController::class, 'myMentor']);
       Route::get('/mentors', [MentorController::class, 'index']);
   });
   ```

**Frontend Requirements:**

1. **Create Mentor Display Page**:
   ```typescript
   // src/app/dashboard/mentor/page.tsx
   - Fetch current mentor
   - Display: photo (if available), name, expertise, bio, contact
   - Contact button (email/phone)
   - Show assigned date
   ```

**Effort: 1-2 days (8-16 hours)**
**Team: 1 person (can do backend + simple frontend)**

---

### 3.5 PENEMPATAN (Internship Placement) — P2 Priority

**Context:** Admin/Company manages student placements at companies.

**Database Requirements:**

Uses existing `internships` table (should have: student_id, company_id, field_id, etc.)

**If placement tracking doesn't exist:**
```php
Schema::create('placements', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('student_id');
    $table->uuid('company_id');
    $table->uuid('internship_id')->nullable();
    $table->date('start_date');
    $table->date('end_date');
    $table->enum('status')->values(['pending', 'approved', 'ongoing', 'completed', 'rejected'])->default('pending');
    $table->timestamps();
    
    $table->foreign('student_id')->references('id')->on('users');
    $table->foreign('company_id')->references('id')->on('users');
    $table->foreign('internship_id')->references('id')->on('internships');
});
```

**Backend Requirements:**

1. **Create Controller**:
   ```php
   class PlacementController extends Controller {
       // Admin/Company: List placements
       public function index() {
           $user = auth()->user();
           
           if ($user->hasRole('admin')) {
               $query = Placement::query();
           } else {
               $query = Placement::where('company_id', $user->id);
           }
           
           return $query->with('student', 'company', 'internship')
               ->paginate(20);
       }
       
       // Admin: Create placement
       public function store(Request $request) {
           $this->authorize('admin-access');
           
           $validated = $request->validate([
               'student_id' => 'required|uuid|exists:users,id',
               'company_id' => 'required|uuid|exists:users,id',
               'start_date' => 'required|date',
               'end_date' => 'required|date|after:start_date'
           ]);
           
           Placement::create($validated + ['status' => 'pending']);
           
           return response()->json(['message' => 'Placement created']);
       }
       
       // Company/Admin: Approve placement
       public function approve(Placement $placement) {
           $placement->update(['status' => 'approved']);
           return response()->json($placement);
       }
       
       // Company/Admin: Reject placement
       public function reject(Placement $placement) {
           $placement->update(['status' => 'rejected']);
           return response()->json($placement);
       }
       
       // Auto-update to "ongoing" when start_date reached (scheduled task)
       public function markOngoing() {
           Placement::where('status', 'approved')
               ->where('start_date', '<=', today())
               ->update(['status' => 'ongoing']);
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::get('/placements', [PlacementController::class, 'index']);
       Route::post('/placements', [PlacementController::class, 'store'])
           ->middleware('abilities:admin-access');
       Route::patch('/placements/{placement}/approve', [PlacementController::class, 'approve']);
       Route::patch('/placements/{placement}/reject', [PlacementController::class, 'reject']);
   });
   ```

**Frontend Requirements:**

1. **Create Placements List Page**:
   ```typescript
   // src/app/dashboard/placements/page.tsx
   - List placements (for admin/company)
   - Show: student name, company name, dates, status
   - Status badge: pending (yellow), approved (green), rejected (red), ongoing (blue)
   - Filter by status
   - Approve/Reject buttons
   ```

2. **Create Add Placement Form**:
   ```typescript
   - Dropdown: Select student
   - Dropdown: Select company
   - Date inputs: start_date, end_date
   - Submit button
   ```

**Effort: 3-4 days (24-32 hours)**
**Team: 1 person backend + 1 person frontend (parallel)**

---

### 3.6 DATA SEKOLAH (School Data) — P2 Priority

**Context:** Admin views/manages school information.

**Database Requirements:**

Likely uses existing `schools` or similar table. If not:
```php
Schema::create('schools', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('address');
    $table->uuid('city_regency_id');
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->string('website')->nullable();
    $table->integer('student_count')->default(0);
    $table->timestamps();
});
```

**Backend Requirements:**

1. **Create Controller**:
   ```php
   class SchoolController extends Controller {
       // Admin: List all schools
       public function index() {
           $this->authorize('admin-access');
           
           return School::with('cityRegency.province')
               ->paginate(20);
       }
       
       // Admin: View single school
       public function show(School $school) {
           return $school->load('cityRegency.province');
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::middleware('auth:sanctum', 'abilities:admin-access')->group(function () {
       Route::get('/schools', [SchoolController::class, 'index']);
       Route::get('/schools/{school}', [SchoolController::class, 'show']);
   });
   ```

**Frontend Requirements:**

1. **Create School Data Page**:
   ```typescript
   // src/app/dashboard/data-sekolah/page.tsx
   - List all schools in table
   - Show: name, location, contact, student count
   - Click to view details
   - Search by name/location
   ```

2. **Create School Detail Page**:
   ```typescript
   // src/app/dashboard/data-sekolah/[id]/page.tsx
   - Show: name, address, phone, email, website
   - Student count
   - List of students from this school
   ```

**Effort: 2 days (16 hours)**
**Team: 1 person (backend simple + frontend)**

---

### 3.7 DATA UNIVERSITAS (University Data) — P2 Priority

**Identical to 3.6, just for universities instead of schools**

**Effort: 2 days (16 hours)**
**Team: 1 person (can copy 3.6 pattern)**

---

### 3.8 KELAS PRA MAGANG (School View) — P2 Priority

**Context:** Schools can create and manage pre-internship training classes.

**Uses the same table as 3.3:**
```php
pre_internship_classes
pre_internship_enrollments
```

**Add column to track creator:**
```php
$table->uuid('created_by_id'); // School/Admin who created
$table->foreign('created_by_id')->references('id')->on('users');
```

**Backend Requirements:**

1. **Create Controller** (extend from 3.3):
   ```php
   class PreInternshipClassController extends Controller {
       // School: Create class
       public function store(Request $request) {
           $school = auth()->user();
           
           $validated = $request->validate([
               'title' => 'required|string',
               'description' => 'required|string',
               'start_date' => 'required|date',
               'end_date' => 'required|date|after:start_date',
               'capacity' => 'required|integer|min:1',
               'level' => 'required|in:beginner,intermediate,advanced'
           ]);
           
           PreInternshipClass::create($validated + ['created_by_id' => $school->id]);
           
           return response()->json(['message' => 'Class created']);
       }
       
       // School: Update class
       public function update(PreInternshipClass $class, Request $request) {
           $this->authorize('own', $class); // Only creator can update
           
           $class->update($request->validated());
           
           return response()->json($class);
       }
       
       // School: Delete class
       public function destroy(PreInternshipClass $class) {
           $this->authorize('own', $class);
           
           $class->delete();
           
           return response()->json(['message' => 'Deleted']);
       }
       
       // School: View enrollments for a class
       public function enrollments(PreInternshipClass $class) {
           $this->authorize('own', $class);
           
           return $class->enrollments()->with('student')->get();
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::post('/pre-internship-classes', [PreInternshipClassController::class, 'store']);
       Route::patch('/pre-internship-classes/{class}', [PreInternshipClassController::class, 'update']);
       Route::delete('/pre-internship-classes/{class}', [PreInternshipClassController::class, 'destroy']);
       Route::get('/pre-internship-classes/{class}/enrollments', [PreInternshipClassController::class, 'enrollments']);
   });
   ```

**Frontend Requirements:**

1. **Create Classes Management Page** (for schools):
   ```typescript
   // src/app/dashboard/kelas-pra-magang/page.tsx
   - List school's classes
   - "Create Class" button → form
   - Edit/Delete buttons
   - View enrollments
   ```

2. **Create Class Form**:
   - title, description, dates, capacity, level
   - Submit POST request

**Effort: 2-3 days (16-24 hours)**
**Team: 1 person (build from existing 3.3 code)**

---

### 3.9 KELAS PRA MAGANG (Company View) — P2 Priority

**Similar to 3.8, but for companies instead of schools**

**Could reuse the same table with a `created_by_role` field:**
```php
$table->enum('created_by_role')->values(['school', 'company'])->default('school');
```

**Effort: 2-3 days (16-24 hours)**
**Team: 1 person (copy from 3.8)**

---

### 3.10 PEMBIMBING (Mentors CRUD) — P2 Priority

**Context:** Admin manages mentors for the system.

**Uses table from 3.4:**
```php
mentors
mentor_assignments
```

**Backend Requirements:**

1. **Create Controller** (extend from 3.4):
   ```php
   class MentorController extends Controller {
       // Admin: Create mentor
       public function store(Request $request) {
           $this->authorize('admin-access');
           
           $validated = $request->validate([
               'user_id' => 'required|uuid|exists:users,id',
               'title' => 'required|string',
               'bio' => 'nullable|string',
               'expertise' => 'required|string',
               'phone' => 'nullable|string',
               'email' => 'nullable|email'
           ]);
           
           Mentor::create($validated);
           
           return response()->json(['message' => 'Mentor created']);
       }
       
       // Admin: Update mentor
       public function update(Mentor $mentor, Request $request) {
           $this->authorize('admin-access');
           
           $mentor->update($request->validated());
           
           return response()->json($mentor);
       }
       
       // Admin: Delete mentor
       public function destroy(Mentor $mentor) {
           $this->authorize('admin-access');
           
           $mentor->delete();
           
           return response()->json(['message' => 'Deleted']);
       }
       
       // Admin: List all mentors
       public function index() {
           $this->authorize('admin-access');
           
           return Mentor::with('user')->paginate(20);
       }
       
       // Admin: Assign mentor to student
       public function assign(Request $request) {
           $this->authorize('admin-access');
           
           $validated = $request->validate([
               'student_id' => 'required|uuid|exists:users,id',
               'mentor_id' => 'required|uuid|exists:mentors,id'
           ]);
           
           // End previous assignment if exists
           MentorAssignment::where('student_id', $validated['student_id'])
               ->where('ended_at', null)
               ->update(['ended_at' => now()]);
           
           MentorAssignment::create($validated + ['assigned_at' => now()]);
           
           return response()->json(['message' => 'Mentor assigned']);
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::middleware('auth:sanctum', 'abilities:admin-access')->group(function () {
       Route::post('/mentors', [MentorController::class, 'store']);
       Route::patch('/mentors/{mentor}', [MentorController::class, 'update']);
       Route::delete('/mentors/{mentor}', [MentorController::class, 'destroy']);
       Route::get('/mentors', [MentorController::class, 'index']);
       Route::post('/mentor-assignments', [MentorController::class, 'assign']);
   });
   ```

**Frontend Requirements:**

1. **Create Mentors Management Page**:
   ```typescript
   // src/app/dashboard/mentors/page.tsx
   - List all mentors
   - Show: name, expertise, contact
   - Edit/Delete buttons
   - "Create Mentor" button
   ```

2. **Create Mentor Form**:
   - Dropdown: Select user
   - title, bio, expertise, phone, email
   - Submit

3. **Create Assign Mentor Page**:
   ```typescript
   // src/app/dashboard/mentors/assign/page.tsx
   - Dropdown: Select student
   - Dropdown: Select mentor
   - Submit button
   - List current assignments
   ```

**Effort: 2-3 days (16-24 hours)**
**Team: 1 person backend + 1 person frontend (parallel)**

---

### 3.11 PANDUAN (Admin Guide Management) — P3 Priority

**Same as 3.2 (already includes admin upload page)**

**Effort: Included in 3.2**

---

### 3.12 PENGHARGAAN (Awards/Recognition) — P3 Priority

**Context:** Admin creates awards, assigns to students for achievements.

**Database Requirements:**

```php
Schema::create('awards', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('icon')->nullable(); // Icon name (Lucide)
    $table->enum('category')->values(['achievement', 'excellence', 'participation', 'other']);
    $table->timestamps();
});

Schema::create('student_awards', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('student_id');
    $table->uuid('award_id');
    $table->text('reason')->nullable();
    $table->date('awarded_at');
    $table->uuid('awarded_by_id');
    $table->timestamps();
    
    $table->foreign('student_id')->references('id')->on('users');
    $table->foreign('award_id')->references('id')->on('awards');
    $table->foreign('awarded_by_id')->references('id')->on('users');
});
```

**Backend Requirements:**

1. **Create Controller**:
   ```php
   class AwardController extends Controller {
       // Admin: Create award
       public function store(Request $request) {
           $this->authorize('admin-access');
           
           $validated = $request->validate([
               'name' => 'required|string',
               'description' => 'nullable|string',
               'icon' => 'nullable|string',
               'category' => 'required|in:achievement,excellence,participation,other'
           ]);
           
           Award::create($validated);
           
           return response()->json(['message' => 'Award created']);
       }
       
       // Admin: List awards
       public function index() {
           $this->authorize('admin-access');
           return Award::all();
       }
       
       // Admin: Assign award to student
       public function assignToStudent(Request $request) {
           $this->authorize('admin-access');
           
           $validated = $request->validate([
               'student_id' => 'required|uuid|exists:users,id',
               'award_id' => 'required|uuid|exists:awards,id',
               'reason' => 'nullable|string'
           ]);
           
           StudentAward::create($validated + [
               'awarded_at' => now(),
               'awarded_by_id' => auth()->id()
           ]);
           
           return response()->json(['message' => 'Award assigned']);
       }
       
       // Student: View their awards
       public function myAwards() {
           $student = auth()->user();
           
           return StudentAward::where('student_id', $student->id)
               ->with('award')
               ->orderBy('awarded_at', 'DESC')
               ->get();
       }
       
       // Public: View student's awards
       public function studentAwards(User $student) {
           return StudentAward::where('student_id', $student->id)
               ->with('award')
               ->get();
       }
   }
   ```

2. **Create Routes**:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::get('/my-awards', [AwardController::class, 'myAwards']);
       Route::get('/students/{student}/awards', [AwardController::class, 'studentAwards']);
   });
   
   Route::middleware('auth:sanctum', 'abilities:admin-access')->group(function () {
       Route::post('/awards', [AwardController::class, 'store']);
       Route::get('/awards', [AwardController::class, 'index']);
       Route::post('/student-awards', [AwardController::class, 'assignToStudent']);
   });
   ```

**Frontend Requirements:**

1. **Create Awards Management Page**:
   ```typescript
   // src/app/dashboard/awards/page.tsx
   - List all awards
   - Show: name, category, icon
   - Edit/Delete buttons
   - "Create Award" button
   ```

2. **Create Award Assignment Page**:
   ```typescript
   // src/app/dashboard/awards/assign/page.tsx
   - Dropdown: Select student
   - Dropdown: Select award
   - Text area: reason
   - Submit button
   ```

3. **Display Student Awards** (on profile/dashboard):
   ```typescript
   - List cards showing each award
   - Show icon, name, awarded date
   - Filter by category
   ```

**Effort: 2 days (16 hours)**
**Team: 1 person backend + 1 person frontend (parallel)**

---

## SECTION 4: TEAM TASK BREAKDOWN

### Team Structure: 4 people (2 human + 2 AI)

**Recommended allocation:**

**PERSON 1 (Backend Lead - Human)**
- **Days 1-2:** Fix 3 buggy backend features (Siswa, Mahasiswa, User Management CRUD bugs)
- **Days 3-5:** Hubungi kami + Panduan (backend)
- **Days 6-8:** Kelas Pra Magang Student (backend)
- **Days 9-10:** Guru Pembimbing (backend)
- Coordinate with frontend devs

**PERSON 2 (Frontend Lead - Human)**
- **Days 1-2:** Fix 2 buggy frontend features (visual/styling bugs)
- **Days 3-5:** Hubungi kami + Panduan (frontend)
- **Days 6-8:** Kelas Pra Magang Student (frontend)
- **Days 9-10:** Guru Pembimbing (frontend)

**AI #1 (Backend Code Generator)**
- **Days 1-2:** Generate migration files for all missing tables
- **Days 3-7:** Generate Controllers + Models + Routes for: Contact, Guides, PreInternship, Mentor
- **Days 8-10:** Placements, Schools, Universities CRUD
- **Days 11-12:** Awards, Pembimbing full CRUD

**AI #2 (Frontend Code Generator)**
- **Days 1-2:** Create Tailwind component templates
- **Days 3-7:** Generate React/Next pages for Contact, Guides, PreInternship
- **Days 8-10:** Generate Placements, Schools, Universities admin pages
- **Days 11-12:** Awards, Mentor assignment pages

---

## SECTION 5: DATABASE SETUP CHECKLIST

Before starting, have AI check/create these migrations:

```
☐ contact_messages (3.1)
☐ guides (3.2)
☐ pre_internship_classes (3.3)
☐ pre_internship_enrollments (3.3)
☐ mentors (3.4)
☐ mentor_assignments (3.4)
☐ placements (3.5)
☐ schools (3.6)
☐ universities (3.7)
☐ awards (3.12)
☐ student_awards (3.12)
```

Run migrations:
```bash
php artisan migrate
php artisan db:seed # If seeders exist
```

---

## SECTION 6: FRONTEND ROUTING STRUCTURE

Add these routes to your Next.js app:

```
/panduan/student → Guide for students
/panduan/school → Guide for schools
/panduan/company → Guide for companies

/dashboard/pre-internship-classes → Student view
/dashboard/my-pre-internship-classes → Student's enrolled classes
/dashboard/mentor → View current mentor
/dashboard/kelas-pra-magang → School view (create/manage)
/dashboard/placements → Admin/Company placements list
/dashboard/data-sekolah → Admin school data
/dashboard/data-universitas → Admin university data
/dashboard/mentors → Admin mentor CRUD
/dashboard/mentors/assign → Admin assign mentor
/dashboard/awards → Admin award CRUD
/dashboard/awards/assign → Admin assign awards
/dashboard/contact-messages → Admin contact form replies
/dashboard/guides → Admin guide upload
```

---

## SECTION 7: API ENDPOINTS CHECKLIST

**All endpoints should follow pattern:** `/api/v1/[resource]`

**Public endpoints:**
```
POST   /api/v1/contacts              (Contact form)
GET    /api/v1/guides/{type}         (Student/School/Company guides)
GET    /api/v1/pre-internship-classes
GET    /api/v1/mentors
GET    /api/v1/students/{id}/awards
```

**Authenticated endpoints:**
```
GET    /api/v1/my-mentor
GET    /api/v1/my-pre-internship-classes
GET    /api/v1/my-awards
POST   /api/v1/pre-internship-classes/{id}/enroll
PATCH  /api/v1/pre-internship-enrollments/{id}/drop
```

**Admin-only endpoints:**
```
GET    /api/v1/contacts
PATCH  /api/v1/contacts/{id}/reply
POST   /api/v1/guides
DELETE /api/v1/guides/{id}
GET    /api/v1/placements
POST   /api/v1/placements
PATCH  /api/v1/placements/{id}/approve
GET    /api/v1/schools
GET    /api/v1/universities
POST   /api/v1/mentors
PATCH  /api/v1/mentors/{id}
DELETE /api/v1/mentors/{id}
POST   /api/v1/mentor-assignments
POST   /api/v1/awards
GET    /api/v1/awards
POST   /api/v1/student-awards
```

---

## SECTION 8: REALISTIC TIMELINE

**With 4-person team working in parallel:**

| Phase | Features | Days | Status |
|-------|----------|------|--------|
| Phase 0 | Fix 6 bugs + setup DB | 2-3 | CRITICAL |
| Phase 1 | Contact + Guides + PreInternship Student + Mentor | 5-7 | HIGH |
| Phase 2 | Placements + Data Sekolah/Universitas + Kelas (School/Company) | 8-10 | MEDIUM |
| Phase 3 | Pembimbing + Awards + Polish | 5-7 | LOW |

**Total: 20-27 days with 4 people** (vs 40+ days with 2 people)

**If boss needs JUST the critical features (Contact + Guides + Student Kelas):**
- **Timeline: 7-10 days** (can have something meaningful TODAY via scaffolding)

---

## SECTION 9: DAILY STANDUP TEMPLATE

```
PERSON 1 (Backend):
  ✅ Yesterday: [Feature completed]
  ⚙️ Today: [Feature being worked on]
  🚧 Blockers: [None / Issue with X]

PERSON 2 (Frontend):
  ✅ Yesterday: [Feature completed]
  ⚙️ Today: [Feature being worked on]
  🚧 Blockers: [None / Waiting for API from Person 1]

AI #1 (Backend Code):
  ✅ Generated: [Files/Controllers]
  ⚙️ Generating: [Next batch]
  🚧 Issues: [Any compilation errors?]

AI #2 (Frontend Code):
  ✅ Generated: [Pages/Components]
  ⚙️ Generating: [Next batch]
  🚧 Issues: [TypeScript errors?]
```

---

## FINAL CHECKLIST

Before presenting to boss:

- [ ] All 6 bugs fixed and tested
- [ ] All 12 missing features have working backend endpoints
- [ ] All 12 missing features have working frontend pages
- [ ] Database migrations created and run
- [ ] Seeders updated with sample data (optional but good)
- [ ] All routes documented
- [ ] Testing done (at least manual smoke tests)
- [ ] Deployed to staging/live
- [ ] Changelog written
- [ ] Screenshots taken for presentation

---

**You got this. Go build it. 🚀**
