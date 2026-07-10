# PRAKERIN REFACTORING PLAN
## "Another You" - Complete Implementation Roadmap

**Project:** PrakerinID (Internship & Job Application Platform)
**Created:** June 29, 2026
**Status:** Planning Phase

---

## 📊 EXECUTIVE SUMMARY

This plan covers the complete refactoring of Prakerin in 4 phases:
1. **Phase 1:** Database Schema & User Model Split 
2. **Phase 2:** Backend API Restructuring 
3. **Phase 3:** Frontend Architecture & Dashboard Rework 
4. **Phase 4:** UI/UX Redesign Per Feature 

---

## 🗄️ PHASE 1: DATABASE SCHEMA & USER MODEL SPLIT

### Current State
- Single `users` table with role enum: `['student', 'school', 'company', 'super_admin']`
- Single `students` table with no distinction between siswa (high school) and mahasiswa (university)
- Single `schools` table with a `type` field but not separated
- Missing: `activity_logs` table, `settings` table, proper type distinctions

### Changes Needed

#### 1.1 Modify Users Table
**Migration File:** `2026_06_29_000001_update_users_table_for_role_split.php`

```php
Schema::table('users', function (Blueprint $table) {
    // Update existing role enum to be more specific
    $table->enum('role', [
        'siswa',           // High school student
        'mahasiswa',       // University student
        'school_admin',    // School administrator
        'university_admin',// University administrator
        'company_owner',   // Company owner
        'company_admin',   // Company staff
        'super_admin'      // Platform admin
    ])->change();
    
    // Add new columns
    $table->boolean('is_verified')->default(false);
    $table->string('phone_number')->nullable();
    $table->timestamp('email_verified_at')->nullable();
    $table->timestamp('last_login_at')->nullable();
});
```

#### 1.2 Create SiswaStudent Table
**Migration File:** `2026_06_29_000002_create_siswa_students_table.php`

```php
Schema::create('siswa_students', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->unique();
    $table->uuid('school_id'); // Links to sekolah/high schools
    $table->uuid('major_id')->nullable();
    $table->string('name');
    $table->date('date_of_birth')->nullable();
    $table->enum('gender', ['male', 'female', 'other'])->nullable();
    $table->string('phone_number')->nullable();
    $table->text('address')->nullable();
    $table->string('class')->nullable(); // e.g., "10", "11", "12"
    $table->text('skill')->nullable();
    $table->enum('status', ['active', 'graduated', 'inactive'])->default('active');
    $table->string('portofolio_link')->nullable();
    $table->string('social_media_link')->nullable();
    $table->boolean('is_verified')->default(false);
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('school_id')->references('id')->on('sekolah')->onDelete('cascade');
    $table->foreign('major_id')->references('id')->on('majors')->onDelete('set null');
});
```

#### 1.3 Create MahasiswaStudent Table
**Migration File:** `2026_06_29_000003_create_mahasiswa_students_table.php`

```php
Schema::create('mahasiswa_students', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->unique();
    $table->uuid('university_id'); // Links to PTN/universities
    $table->uuid('major_id')->nullable();
    $table->string('name');
    $table->date('date_of_birth')->nullable();
    $table->enum('gender', ['male', 'female', 'other'])->nullable();
    $table->string('phone_number')->nullable();
    $table->text('address')->nullable();
    $table->string('semester')->nullable(); // e.g., "1", "2", "3"
    $table->text('skill')->nullable();
    $table->enum('status', ['active', 'graduated', 'inactive'])->default('active');
    $table->string('portofolio_link')->nullable();
    $table->string('social_media_link')->nullable();
    $table->boolean('is_verified')->default(false);
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('university_id')->references('id')->on('ptn')->onDelete('cascade');
    $table->foreign('major_id')->references('id')->on('majors')->onDelete('set null');
});
```

#### 1.4 Create Sekolah Table (High Schools)
**Migration File:** `2026_06_29_000004_create_sekolah_table.php`

```php
Schema::create('sekolah', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->unique();
    $table->uuid('city_regency_id');
    $table->string('name');
    $table->enum('type', ['SMA', 'SMK', 'MA'])->default('SMA');
    $table->text('address');
    $table->string('phone_number')->nullable();
    $table->string('npsn')->unique();
    $table->enum('accreditation', ['A', 'B', 'C', 'TT'])->nullable();
    $table->string('website')->nullable();
    $table->boolean('is_verified')->default(false);
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->json('description')->nullable();
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('city_regency_id')->references('id')->on('city_regencies')->onDelete('restrict');
});
```

#### 1.5 Create PTN Table (Universities)
**Migration File:** `2026_06_29_000005_create_ptn_table.php`

```php
Schema::create('ptn', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->unique();
    $table->uuid('city_regency_id');
    $table->string('name');
    $table->enum('type', ['Universitas', 'Institut', 'Sekolah Tinggi'])->default('Universitas');
    $table->text('address');
    $table->string('phone_number')->nullable();
    $table->string('npsn')->unique();
    $table->enum('accreditation', ['A', 'B', 'C', 'TT'])->nullable();
    $table->string('website')->nullable();
    $table->boolean('is_verified')->default(false);
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->json('description')->nullable();
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('city_regency_id')->references('id')->on('city_regencies')->onDelete('restrict');
});
```

#### 1.6 Create ActivityLogs Table
**Migration File:** `2026_06_29_000006_create_activity_logs_table.php`

```php
Schema::create('activity_logs', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->nullable();
    $table->string('action'); // e.g., 'login', 'created_job_opening', 'applied_internship'
    $table->string('entity_type')->nullable(); // e.g., 'JobOpening', 'Student'
    $table->uuid('entity_id')->nullable();
    $table->text('description')->nullable();
    $table->string('ip_address')->nullable();
    $table->string('user_agent')->nullable();
    $table->json('data')->nullable(); // Any additional data
    $table->timestamp('created_at');
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
    $table->index(['user_id', 'created_at']);
    $table->index(['action', 'created_at']);
});
```

#### 1.7 Create UserSettings Table
**Migration File:** `2026_06_29_000007_create_user_settings_table.php`

```php
Schema::create('user_settings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->unique();
    $table->boolean('notification_email')->default(true);
    $table->boolean('notification_push')->default(true);
    $table->boolean('notification_sms')->default(false);
    $table->enum('language', ['id', 'en'])->default('id');
    $table->enum('theme', ['light', 'dark', 'auto'])->default('auto');
    $table->boolean('privacy_profile_public')->default(false);
    $table->boolean('privacy_show_email')->default(false);
    $table->json('custom_settings')->nullable(); // For future extensibility
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
});
```

### Data Migration Strategy

For existing `students` table, create a migration that:
1. Reads existing student records
2. Checks user role from `users` table
3. Inserts into appropriate table (`siswa_students` OR `mahasiswa_students`)
4. Optionally archives old `students` table

**Migration File:** `2026_06_29_000008_migrate_students_to_siswa_mahasiswa.php`

```php
// Pseudo-code
public function up(): void
{
    // For each record in students table
    $students = DB::table('students')->get();
    
    foreach ($students as $student) {
        $user = User::find($student->user_id);
        
        if ($user->role === 'siswa') {
            DB::table('siswa_students')->insert([
                'id' => $student->id,
                'user_id' => $student->user_id,
                'school_id' => $student->school_id,
                // ... other fields
            ]);
        } elseif ($user->role === 'mahasiswa') {
            // Determine which school is actually a university
            // and insert into mahasiswa_students
        }
    }
    
    // After migration is complete and verified:
    // Schema::dropIfExists('students');
}
```

### Similar approach for Schools

Split current `schools` table based on context/validation into `sekolah` and `ptn`.

---

## 🔌 PHASE 2: BACKEND API RESTRUCTURING

### 2.1 New/Updated Models

#### SiswaStudent Model
```php
// app/Models/SiswaStudent.php
namespace App\Models;

class SiswaStudent extends Model
{
    protected $table = 'siswa_students';
    protected $fillable = [
        'user_id', 'school_id', 'major_id', 'name', 'date_of_birth',
        'gender', 'phone_number', 'address', 'class', 'skill', 'status',
        'portofolio_link', 'social_media_link', 'is_verified'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function school()
    {
        return $this->belongsTo(Sekolah::class, 'school_id');
    }

    public function major()
    {
        return $this->belongsTo(Major::class);
    }

    public function internships()
    {
        return $this->hasMany(Internship::class, 'siswa_student_id');
    }

    public function internshipApplications()
    {
        return $this->hasMany(InternshipApplication::class, 'siswa_student_id');
    }

    public function curriculumVitae()
    {
        return $this->hasMany(CurriculumVitae::class, 'siswa_student_id');
    }
}
```

#### MahasiswaStudent Model
```php
// app/Models/MahasiswaStudent.php
namespace App\Models;

class MahasiswaStudent extends Model
{
    protected $table = 'mahasiswa_students';
    protected $fillable = [
        'user_id', 'university_id', 'major_id', 'name', 'date_of_birth',
        'gender', 'phone_number', 'address', 'semester', 'skill', 'status',
        'portofolio_link', 'social_media_link', 'is_verified'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function university()
    {
        return $this->belongsTo(Ptn::class, 'university_id');
    }

    public function major()
    {
        return $this->belongsTo(Major::class);
    }

    public function internships()
    {
        return $this->hasMany(Internship::class, 'mahasiswa_student_id');
    }

    public function internshipApplications()
    {
        return $this->hasMany(InternshipApplication::class, 'mahasiswa_student_id');
    }

    public function curriculumVitae()
    {
        return $this->hasMany(CurriculumVitae::class, 'mahasiswa_student_id');
    }
}
```

#### Sekolah Model
```php
// app/Models/Sekolah.php
namespace App\Models;

class Sekolah extends Model
{
    protected $table = 'sekolah';
    protected $fillable = [
        'user_id', 'city_regency_id', 'name', 'type', 'address',
        'phone_number', 'npsn', 'accreditation', 'website',
        'is_verified', 'status', 'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function students()
    {
        return $this->hasMany(SiswaStudent::class, 'school_id');
    }

    public function cityRegency()
    {
        return $this->belongsTo(CityRegency::class);
    }

    public function mous()
    {
        return $this->hasMany(Mou::class, 'school_id');
    }
}
```

#### Ptn Model
```php
// app/Models/Ptn.php
namespace App\Models;

class Ptn extends Model
{
    protected $table = 'ptn';
    protected $fillable = [
        'user_id', 'city_regency_id', 'name', 'type', 'address',
        'phone_number', 'npsn', 'accreditation', 'website',
        'is_verified', 'status', 'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function students()
    {
        return $this->hasMany(MahasiswaStudent::class, 'university_id');
    }

    public function cityRegency()
    {
        return $this->belongsTo(CityRegency::class);
    }

    public function mous()
    {
        return $this->hasMany(Mou::class, 'university_id');
    }
}
```

#### ActivityLog Model
```php
// app/Models/ActivityLog.php
namespace App\Models;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';
    public $timestamps = false;
    
    protected $fillable = [
        'user_id', 'action', 'entity_type', 'entity_id',
        'description', 'ip_address', 'user_agent', 'data'
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function log($action, $entityType, $entityId, $description = null, $data = null)
    {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'data' => $data,
            'created_at' => now(),
        ]);
    }
}
```

#### UserSettings Model
```php
// app/Models/UserSettings.php
namespace App\Models;

class UserSettings extends Model
{
    protected $table = 'user_settings';
    
    protected $fillable = [
        'user_id', 'notification_email', 'notification_push',
        'notification_sms', 'language', 'theme', 'privacy_profile_public',
        'privacy_show_email', 'custom_settings'
    ];

    protected $casts = [
        'notification_email' => 'boolean',
        'notification_push' => 'boolean',
        'notification_sms' => 'boolean',
        'privacy_profile_public' => 'boolean',
        'privacy_show_email' => 'boolean',
        'custom_settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### 2.2 Updated User Model

```php
// Update app/Models/User.php
public function siswaStudent()
{
    return $this->hasOne(SiswaStudent::class);
}

public function mahasiswaStudent()
{
    return $this->hasOne(MahasiswaStudent::class);
}

public function sekolah()
{
    return $this->hasOne(Sekolah::class);
}

public function ptn()
{
    return $this->hasOne(Ptn::class);
}

public function settings()
{
    return $this->hasOne(UserSettings::class);
}

public function activityLogs()
{
    return $this->hasMany(ActivityLog::class);
}

// Helper method to get student profile regardless of type
public function getStudentProfile()
{
    if ($this->role === 'siswa') {
        return $this->siswaStudent;
    } elseif ($this->role === 'mahasiswa') {
        return $this->mahasiswaStudent;
    }
    return null;
}

// Helper method to get school profile regardless of type
public function getSchoolProfile()
{
    if ($this->role === 'school_admin') {
        return $this->sekolah;
    } elseif ($this->role === 'university_admin') {
        return $this->ptn;
    }
    return null;
}
```

### 2.3 New API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register          - Register new user (will determine siswa/mahasiswa)
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh-token     - Refresh JWT token
GET    /api/auth/me                - Get current user profile
```

#### Student Management Endpoints

**Siswa Endpoints:**
```
GET    /api/siswa                          - List all siswa (admin only)
POST   /api/siswa                          - Create siswa account
GET    /api/siswa/{id}                     - Get specific siswa
PUT    /api/siswa/{id}                     - Update siswa profile
DELETE /api/siswa/{id}                     - Delete siswa
GET    /api/siswa/{id}/internships        - Get siswa's internships
GET    /api/siswa/{id}/applications       - Get siswa's applications
GET    /api/siswa/verify/{token}          - Verify siswa email
```

**Mahasiswa Endpoints:**
```
GET    /api/mahasiswa                      - List all mahasiswa (admin only)
POST   /api/mahasiswa                      - Create mahasiswa account
GET    /api/mahasiswa/{id}                 - Get specific mahasiswa
PUT    /api/mahasiswa/{id}                 - Update mahasiswa profile
DELETE /api/mahasiswa/{id}                 - Delete mahasiswa
GET    /api/mahasiswa/{id}/internships    - Get mahasiswa's internships
GET    /api/mahasiswa/{id}/applications   - Get mahasiswa's applications
GET    /api/mahasiswa/verify/{token}      - Verify mahasiswa email
```

#### School Management Endpoints

**Sekolah (High School) Endpoints:**
```
GET    /api/sekolah                        - List all sekolah
POST   /api/sekolah                        - Create sekolah account (admin only)
GET    /api/sekolah/{id}                   - Get specific sekolah
PUT    /api/sekolah/{id}                   - Update sekolah profile
DELETE /api/sekolah/{id}                   - Delete sekolah
GET    /api/sekolah/{id}/students         - Get sekolah's siswa students
GET    /api/sekolah/{id}/mous             - Get sekolah's MOUs
```

**PTN (University) Endpoints:**
```
GET    /api/ptn                            - List all PTN
POST   /api/ptn                            - Create PTN account (admin only)
GET    /api/ptn/{id}                       - Get specific PTN
PUT    /api/ptn/{id}                       - Update PTN profile
DELETE /api/ptn/{id}                       - Delete PTN
GET    /api/ptn/{id}/students             - Get PTN's mahasiswa students
GET    /api/ptn/{id}/mous                 - Get PTN's MOUs
```

#### User Settings & Logs Endpoints
```
GET    /api/settings                       - Get current user settings
PUT    /api/settings                       - Update user settings
GET    /api/activity-logs                  - Get user's activity logs
GET    /api/activity-logs/admin            - Get all activity logs (admin only)
GET    /api/activity-logs/user/{user_id}  - Get specific user's logs (admin only)
```

#### Data Master Endpoints
```
GET    /api/data-master/majors             - List majors
GET    /api/data-master/provinces          - List provinces
GET    /api/data-master/cities             - List cities
GET    /api/data-master/sectors            - List business sectors
```

#### Job Opening & Internship Endpoints
```
GET    /api/job-openings                   - List job openings (filtered by student type)
GET    /api/job-openings/{id}              - Get specific job opening
GET    /api/internships                    - List internships (filtered by student type)
GET    /api/internships/{id}               - Get specific internship
POST   /api/applications                   - Apply for job/internship
GET    /api/applications                   - Get user's applications
GET    /api/applications/{id}              - Get application details
```

### 2.4 API Response Structure

Standardize all responses:

```php
// Success response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 100,
    "timestamp": "2026-06-29T10:30:00Z"
  }
}

// Error response
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  },
  "meta": {
    "timestamp": "2026-06-29T10:30:00Z"
  }
}
```

### 2.5 Middleware for Role-Based Access

```php
// app/Http/Middleware/CheckRole.php
class CheckRole
{
    public function handle($request, Closure $next, ...$roles)
    {
        if (!auth()->check() || !in_array(auth()->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }
        return $next($request);
    }
}

// Usage in routes:
Route::middleware(['auth:sanctum', 'CheckRole:siswa,mahasiswa'])->group(function () {
    // Student routes
});
```

---

## 🎨 PHASE 3: FRONTEND ARCHITECTURE & DASHBOARD REWORK

### 3.1 Recommended Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Shared dashboard layout
│   │   ├── student/
│   │   │   ├── layout.tsx      # Student-specific layout
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── applications/
│   │   │   ├── internships/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── cv/
│   │   ├── school/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── students/
│   │   │   ├── mous/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── company/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── job-openings/
│   │   │   ├── applications/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── users/
│   │       ├── schools/
│   │       ├── activity-logs/
│   │       └── data-master/
│   ├── (public)/
│   │   ├── page.tsx            # Homepage
│   │   ├── explore/            # Browse jobs/internships
│   │   └── about/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── PasswordResetForm.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── BreadcrumbNav.tsx
│   ├── student/
│   │   ├── JobCard.tsx
│   │   ├── ApplicationCard.tsx
│   │   ├── ProfileCard.tsx
│   │   └── CVUpload.tsx
│   ├── school/
│   │   ├── StudentsList.tsx
│   │   ├── MouManagement.tsx
│   │   └── SchoolProfile.tsx
│   ├── company/
│   │   ├── JobOpeningForm.tsx
│   │   ├── ApplicationsList.tsx
│   │   └── CompanyProfile.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   └── ui/ (shadcn/ui components)
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useUser.ts
│   └── useFetch.ts
├── lib/
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth utilities
│   ├── storage.ts          # Local storage utilities
│   └── utils.ts
├── context/
│   ├── AuthContext.tsx
│   └── UserContext.tsx
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── student.ts
│   ├── school.ts
│   ├── company.ts
│   └── common.ts
└── constants/
    ├── api.ts
    ├── roles.ts
    └── routes.ts
```

### 3.2 Key Components to Build

#### Auth Context (Manages authentication state across app)
```typescript
// src/context/AuthContext.tsx
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
  userRole: Role | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

#### Role-Based Layout Wrapper
```typescript
// src/components/dashboard/RoleBasedLayout.tsx
// Renders different layouts based on user role
// Shows/hides menu items based on role
// Redirects if user doesn't have access
```

#### Dashboard Sidebar Component
```typescript
// src/components/dashboard/Sidebar.tsx
// Dynamic menu items based on role
// Menu structure:
// - Dashboard (home)
// - My Profile
// - [Role-specific items]
// - Settings
// - Activity Logs
// - Logout
```

### 3.3 Dashboard Page Structure

**For Siswa/Mahasiswa:**
- Overview: Recent applications, saved jobs, upcoming internships
- Applications: List of applied jobs/internships with status
- Saved Jobs: Bookmarked positions
- My Profile: Personal details, education
- CV Management: Upload/manage CVs
- Settings: Account settings, notifications
- Activity Logs: View personal activity

**For School Admin:**
- Overview: Number of students, active MOUs
- Students: List of registered students from school
- MOUs: Manage agreements with companies
- Profile: School information
- Settings: Account settings
- Activity Logs: School activity

**For Company:**
- Overview: Job postings, applications received
- Job Openings: Create/manage job postings
- Applications: View and manage applications
- Profile: Company information
- Settings: Account settings
- Activity Logs: Company activity

**For Super Admin:**
- Overview: System statistics
- User Management: Manage all users
- Schools: Manage sekolah and PTN
- Data Master: Manage majors, provinces, sectors, etc.
- Activity Logs: View all system activity
- Settings: System settings

### 3.4 Conditional Rendering Example

```typescript
// src/components/dashboard/Sidebar.tsx
const menuItems = {
  siswa: [
    { label: 'Dashboard', href: '/dashboard/student', icon: '📊' },
    { label: 'Applications', href: '/dashboard/student/applications', icon: '📝' },
    { label: 'Saved Jobs', href: '/dashboard/student/saved', icon: '❤️' },
    { label: 'My Profile', href: '/dashboard/student/profile', icon: '👤' },
    { label: 'CV Management', href: '/dashboard/student/cv', icon: '📄' },
  ],
  mahasiswa: [
    { label: 'Dashboard', href: '/dashboard/student', icon: '📊' },
    { label: 'Applications', href: '/dashboard/student/applications', icon: '📝' },
    { label: 'Saved Jobs', href: '/dashboard/student/saved', icon: '❤️' },
    { label: 'My Profile', href: '/dashboard/student/profile', icon: '👤' },
    { label: 'CV Management', href: '/dashboard/student/cv', icon: '📄' },
  ],
  school_admin: [
    { label: 'Dashboard', href: '/dashboard/school', icon: '🏫' },
    { label: 'Students', href: '/dashboard/school/students', icon: '👥' },
    { label: 'MOUs', href: '/dashboard/school/mous', icon: '📋' },
    { label: 'Profile', href: '/dashboard/school/profile', icon: '🏢' },
  ],
  company_owner: [
    { label: 'Dashboard', href: '/dashboard/company', icon: '🏢' },
    { label: 'Job Openings', href: '/dashboard/company/jobs', icon: '💼' },
    { label: 'Applications', href: '/dashboard/company/applications', icon: '📥' },
    { label: 'Profile', href: '/dashboard/company/profile', icon: '🏢' },
  ],
  super_admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: '⚙️' },
    { label: 'Users', href: '/dashboard/admin/users', icon: '👥' },
    { label: 'Schools', href: '/dashboard/admin/schools', icon: '🏫' },
    { label: 'Data Master', href: '/dashboard/admin/data-master', icon: '📊' },
    { label: 'Activity Logs', href: '/dashboard/admin/logs', icon: '📜' },
  ],
};

export const Sidebar = ({ role }: { role: Role }) => {
  const items = menuItems[role] || [];
  
  return (
    <aside className="sidebar">
      <nav>
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
      <CommonItems /> {/* Settings, Activity Logs, Logout for all */}
    </aside>
  );
};
```

### 3.5 Types Definition

```typescript
// src/types/index.ts
export type Role = 'siswa' | 'mahasiswa' | 'school_admin' | 'university_admin' | 'company_owner' | 'company_admin' | 'super_admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  photo_profile?: string;
  is_verified: boolean;
  phone_number?: string;
  last_login_at?: string;
}

export interface SiswaStudent {
  id: string;
  user_id: string;
  school_id: string;
  name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone_number?: string;
  address?: string;
  class?: string;
  skill?: string;
  status: 'active' | 'graduated' | 'inactive';
  portofolio_link?: string;
  social_media_link?: string;
  is_verified: boolean;
}

export interface MahasiswaStudent {
  id: string;
  user_id: string;
  university_id: string;
  name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone_number?: string;
  address?: string;
  semester?: string;
  skill?: string;
  status: 'active' | 'graduated' | 'inactive';
  portofolio_link?: string;
  social_media_link?: string;
  is_verified: boolean;
}

export interface Sekolah {
  id: string;
  user_id: string;
  city_regency_id: string;
  name: string;
  type: 'SMA' | 'SMK' | 'MA';
  address: string;
  phone_number?: string;
  npsn: string;
  accreditation?: string;
  website?: string;
  is_verified: boolean;
  status: 'active' | 'inactive';
}

export interface Ptn {
  id: string;
  user_id: string;
  city_regency_id: string;
  name: string;
  type: 'Universitas' | 'Institut' | 'Sekolah Tinggi';
  address: string;
  phone_number?: string;
  npsn: string;
  accreditation?: string;
  website?: string;
  is_verified: boolean;
  status: 'active' | 'inactive';
}

export interface UserSettings {
  notification_email: boolean;
  notification_push: boolean;
  notification_sms: boolean;
  language: 'id' | 'en';
  theme: 'light' | 'dark' | 'auto';
  privacy_profile_public: boolean;
  privacy_show_email: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  created_at: string;
}
```

### 3.6 API Client Hook

```typescript
// src/hooks/useApi.ts
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: data ? JSON.stringify(data) : undefined,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API error');
      }

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
};
```

---

## 🎨 PHASE 4: UI/UX REDESIGN

This phase involves:
1. Creating a consistent design system (colors, typography, spacing)
2. Building reusable component library
3. Applying consistent styling across all features
4. Improving user flows and interactions

### 4.1 Design System

Define in a `src/styles/design-system.ts`:
- Color palette (primary, secondary, success, error, warning)
- Typography (font sizes, weights, line heights)
- Spacing scale
- Border radius values
- Shadow definitions
- Breakpoints for responsive design

### 4.2 Component Library

Build a comprehensive set of reusable components:
- Forms (Input, Select, Textarea, Checkbox, Radio)
- Cards
- Buttons (variants: primary, secondary, danger, etc.)
- Tables
- Modals
- Alerts/Notifications
- Dropdowns
- Pagination
- Breadcrumbs

### 4.3 Page Redesigns

Redesign each major page/feature with:
- Clear visual hierarchy
- Consistent spacing and alignment
- Proper color usage
- Readable typography
- Mobile responsiveness
- Accessibility standards (WCAG)

---

## 📋 IMPLEMENTATION ROADMAP

### Week 1-2: Database & Migrations (Phase 1)
- [ ] Create all migrations
- [ ] Update User model relationships
- [ ] Create new models (SiswaStudent, MahasiswaStudent, Sekolah, Ptn)
- [ ] Run migrations and test data integrity
- [ ] Migrate existing data

### Week 3: Backend Endpoints (Phase 2)
- [ ] Create controllers for new endpoints
- [ ] Implement authentication routes
- [ ] Implement student management routes
- [ ] Implement school management routes
- [ ] Implement settings/logs routes
- [ ] Add request validation
- [ ] Update Swagger documentation

### Week 4-5: Frontend Architecture (Phase 3)
- [ ] Create folder structure
- [ ] Set up Auth context
- [ ] Create authentication pages
- [ ] Build dashboard layouts per role
- [ ] Create sidebar navigation
- [ ] Build type definitions

### Week 6-7: Dashboard Pages (Phase 3)
- [ ] Build student dashboard
- [ ] Build school dashboard
- [ ] Build company dashboard
- [ ] Build admin dashboard
- [ ] Implement role-based rendering

### Week 8-9: Settings & Logs (Phase 3)
- [ ] Create settings page
- [ ] Create activity logs page
- [ ] Connect to backend

### Week 10-12: UI/UX Redesign (Phase 4)
- [ ] Define design system
- [ ] Create component library
- [ ] Redesign all major pages
- [ ] Testing and refinement

---

## 🔍 VALIDATION CHECKLIST

Before moving to next phase:

**Phase 1:**
- [ ] All migrations created and tested
- [ ] Data migration completed without errors
- [ ] All models have proper relationships
- [ ] Foreign keys validated
- [ ] Backup of original data created

**Phase 2:**
- [ ] All endpoints tested in Swagger/Postman
- [ ] Authentication working correctly
- [ ] Role-based access control working
- [ ] Error responses standardized
- [ ] API documentation updated

**Phase 3:**
- [ ] All page routes accessible
- [ ] Authentication flow working
- [ ] Dashboard rendering correct role content
- [ ] Navigation working between pages
- [ ] Responsive design tested

**Phase 4:**
- [ ] Design system documented
- [ ] All components styled consistently
- [ ] Pages match design specification
- [ ] Mobile responsive verified
- [ ] Accessibility tested

---

## 📝 NOTES

1. **Use transactions** for data migrations to ensure rollback capability
2. **Create feature branches** for each phase (feature/user-split, feature/dashboard-rework, etc.)
3. **Write tests** as you implement (unit tests for models, integration tests for API)
4. **Document changes** in README and API documentation
5. **Get user feedback** early in Phase 3 before doing full Phase 4 redesign

---

## 🚀 QUICK START

1. Start with Phase 1: Create migrations and models
2. Test migrations locally with test data
3. Implement Phase 2 API endpoints
4. Build Phase 3 frontend architecture
5. Iterate on design in Phase 4

Good luck! 🎯
