# Audit — Database Fix Plan Implementation
**Date**: 2026-07-08
**Session scope**: Implementing `1_DATABASE_FIX_PLAN.md` and `2_PERMISSION_PLAN.md`

---

## Problem Being Solved

The project had a naming collision and a structural mismatch:

1. The table named `roles` was actually storing **job position catalog data** (Project Manager, Content Writer, etc.) used for dashboard charts — not actual user roles.
2. The `users.role` column was a plain **string enum** with no relation to any role table.
3. `spatie/laravel-permission` had already been partially scaffolded (the migration and seeder existed) but the package itself was not installed, so nothing worked.
4. The FE had a `PermissionContext` skeleton but it was disconnected from any real data source.

---

## Backend Changes (`Prakerin-BE`)

### 1. Installed `spatie/laravel-permission`

**Why**: The package was already imported in the seeder and migration files but missing from `composer.json`.
**Result**: v6.25.0 installed (latest compatible with PHP 8.2).

Spatie creates its own tables: `auth_roles`, `auth_permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions` — prefixed with `auth_` to avoid the naming collision with the existing `roles` table (this was already configured in `config/permission.php`).

---

### 2. Renamed `roles` table to `job_positions`

**File**: `database/migrations/2025_04_29_095147_create_roles_table.php`

**Before**: `Schema::create('roles', ...)` — this table holds job position catalog data (name, is_accepted).
**After**: `Schema::create('job_positions', ...)` — same columns, correctly named.

**Why**: The table was called `roles` but had nothing to do with user access control. It stores things like "Project Manager", "Content Writer" used in pie charts. Renaming removes the confusion and prevents collision with Spatie's `auth_roles` table.

---

### 3. Fixed `internships` table foreign key

**File**: `database/migrations/2025_08_25_021155_create_internships_table.php`

**Before**: `role_id` column with FK → `roles`
**After**: `job_position_id` column with FK → `job_positions`

**Why**: The `internships` table linked to the old job-position `roles` table. After renaming the table, the FK column was renamed to match.

---

### 4. Fixed pre-existing bug in `partners` migration

**File**: `database/migrations/2026_06_24_134230_add_type_to_partners_table.php.php`

**Before**: `->change()` — tried to modify a `type` column that did not exist yet.
**After**: `->after('address')` — correctly adds the new `type` column.

**Why**: This migration was failing on `migrate:fresh` because `->change()` requires the column to already exist. Since the original create migration had no `type` column, it would always fail.

---

### 5. Created `JobPosition` model

**File**: `app/Models/JobPosition.php` *(NEW)*

Replaces the old `Role` model for the job position catalog. Points to `job_positions` table, UUID primary key, `is_accepted` field. Has an `internships()` hasMany relationship via `job_position_id`.

---

### 6. Updated `Internship` model

**File**: `app/Models/Internship.php`

- `'role'` removed from `$fillable`, replaced with `'job_position_id'`
- `role()` relationship replaced with `jobPosition()` using `JobPosition` model

---

### 7. Added `HasRoles` trait to `User` model

**File**: `app/Models/User.php`

Added `use Spatie\Permission\Traits\HasRoles` so the User model gets Spatie methods:
`assignRole()`, `getRoleNames()`, `hasRole()`, `hasPermissionTo()`, `getAllPermissions()`, etc.

The legacy `users.role` string column is **kept** — it is still used throughout `UserController` for Sanctum token abilities (`admin-access`, `student-access`, etc.). Spatie roles run **in parallel** via the `model_has_roles` pivot table.

---

### 8. Created `JobPositionController`

**File**: `app/Http/Controllers/JobPositionController.php` *(NEW)*

A direct rename of the old `RoleController`. Manages the `job_positions` table (CRUD for chart/catalog data). Same logic, uses `JobPosition` model instead of `Role`.

---

### 9. Added `myPermissions()` to `UserController`

**File**: `app/Http/Controllers/UserController.php`

New endpoint: `GET /api/v1/users/me/permissions`

Returns:
```json
{
  "data": {
    "role": "super_admin",
    "roles": ["super_admin"],
    "permissions": ["view_dashboard", "create_kelas", "..."]
  }
}
```

**Why**: The frontend needs to know what permissions the logged-in user has to show/hide UI elements. This endpoint provides that data once after login.

---

### 10. Updated `api.php` routes

**File**: `routes/api.php`

| Old route | New route | Reason |
|---|---|---|
| `GET/POST /v1/roles` | `GET/POST /v1/job-positions` | Renamed to match table rename |
| `PATCH/DELETE /v1/roles/{id}` | `PATCH/DELETE /v1/job-positions/{id}` | Same |
| *(new)* | `GET /v1/system/roles` | List all Spatie RBAC roles + their permissions |
| *(new)* | `GET /v1/system/permissions` | List all available permissions |
| *(new)* | `PUT /v1/system/roles/{name}/permissions` | Sync permissions for a role (super_admin only) |
| *(new)* | `GET /v1/users/me/permissions` | Get current user's roles + permissions |

---

### 11. Rewrote `RolePermissionSeeder`

**File**: `database/seeders/RolePermissionSeeder.php`

**Before**:
- 18 permissions using dash format (`view-lowongan`, `apply-lowongan`)
- Mismatched role names
- Used `$user->role` directly as Spatie role name (name mismatch)

**After**:
- **71 permissions** using underscore format (`view_kelas`, `create_kelas`) matching `2_PERMISSION_PLAN.md`
- Covers all features: dashboard, kelas, pembimbing, manajemen_user, isi_halaman, panduan, feedback, laporan, log_aktivitas, pengaturan, profil, and all DEV features
- **7 roles**: `siswa`, `mahasiswa`, `company_owner`, `company_admin`, `school_admin`, `university_admin`, `super_admin`
- Legacy role mapping: `student` -> `siswa`, `school` -> `school_admin`, `company` -> `company_owner`, `super_admin` -> `super_admin`

---

### 12. Updated `DatabaseSeeder`

**File**: `database/seeders/DatabaseSeeder.php`

- Calls `RolePermissionSeeder::class` **first**, before creating any users
- After each seeded user is created, calls `->assignRole(...)` with the corresponding Spatie role
- Example: `superadmin@makerindo.id` gets `->assignRole('super_admin')`

---

## Frontend Changes (`Prakerin-FE`)

### 13. Updated `authStore.ts`

**File**: `src/stores/authStore.ts`

Added `permissions: string[]` field and `setPermissions()` action to the Zustand store. Updated `clearAuth()` to reset permissions on logout.

**Before**: only stored `role: string | null`
**After**: stores both `role` and `permissions[]`

---

### 14. Rewrote `PermissionContext.tsx`

**File**: `src/context/PermissionContext.tsx`

**Before**: required `permissions` to be passed as a prop — had no connection to real data.
**After**: reads directly from Zustand `useAuthStore`. Added `canAll()` helper alongside `can()` and `canAny()`.

Accepts an optional `permissions` prop override for testing/SSR scenarios.

---

### 15. Created `usePermission` hook

**File**: `src/hooks/usePermission.ts` *(NEW)*

A convenience hook that reads from Zustand:

| Method | Description |
|---|---|
| `can('view_kelas')` | True if user has this exact permission |
| `canAny(['create_kelas', 'edit_kelas'])` | True if user has at least one |
| `canAll(['view_kelas', 'edit_kelas'])` | True if user has all of them |
| `hasRole('super_admin')` | True if legacy role matches |
| `role` | The legacy role string |
| `permissions` | The full permissions array |

---

### 16. Created `permissionApi.ts`

**File**: `src/libs/permissionApi.ts` *(NEW)*

API helper functions:
- `getUserPermissions(token)` -> `GET /users/me/permissions`
- `getAllRoles(token)` -> `GET /system/roles`
- `getAllPermissions(token)` -> `GET /system/permissions`
- `updateRolePermissions(token, roleName, permissions[])` -> `PUT /system/roles/{name}/permissions`

---

### 17. Wired permissions into the login flow

**File**: `src/app/masuk/page.tsx`

After a successful login API call, immediately calls `getUserPermissions(token)` and stores the result in Zustand via `setRole()` and `setPermissions()`.

This means from the moment the user logs in, `usePermission()` anywhere in the app returns the correct permissions.

---

## User Changes (made manually after implementation)

The user commented out the ReCAPTCHA for local development:

**FE** (`masuk/page.tsx`):
- ReCAPTCHA import commented out
- `recaptchaRef` and `executeAsync()` calls commented out
- `<ReCAPTCHA />` component commented out

**BE** (`UserController.php`):
- CAPTCHA verification block in `register()` wrapped in `/* ... */`
- CAPTCHA verification block in `login()` wrapped in `/* ... */`

---

## Database State After `migrate:fresh --seed`

| Table | Count | Notes |
|---|---|---|
| `users` | 52 | 4 named seed users + 48 factory users |
| `auth_roles` | 7 | siswa, mahasiswa, company_owner, company_admin, school_admin, university_admin, super_admin |
| `auth_permissions` | 71 | Full permission set from 2_PERMISSION_PLAN.md |
| `job_positions` | 0 | Renamed from `roles`; empty until populated via API |
| `model_has_roles` | 4 | Named seed users each assigned their Spatie role |

---

## How to Use Going Forward

### Check permissions in FE components
```tsx
import { usePermission } from '@/hooks/usePermission';

function SomeComponent() {
  const { can, canAny } = usePermission();

  return (
    <>
      {can('view_kelas') && <KelasSection />}
      {can('create_kelas') && <button>Tambah Kelas</button>}
      {canAny(['edit_kelas', 'delete_kelas']) && <AdminActions />}
    </>
  );
}
```

### Check permissions in BE Laravel
```php
// In a controller
if (auth()->user()->hasPermissionTo('create_kelas')) {
    // allow
}

// As middleware on a route
Route::post('/kelas', ...)->middleware('permission:create_kelas');
```

### Update role permissions (super_admin only)
```
PUT /api/v1/system/roles/{roleName}/permissions
Body: { "permissions": ["view_kelas", "create_kelas", "edit_kelas"] }
```

---

## Notes and Caveats

- The **legacy `users.role` string** is kept intact. All existing Sanctum token ability checks (`admin-access`, `student-access`, etc.) still use it. Spatie is an additional layer on top.
- After `migrate:fresh`, all browser session cookies become invalid (tokens are wiped). Users must clear cookies and log in again — this is expected, not a bug.
- The `job_positions` table is empty after a fresh migration. It only gets data via the API (no seed data was ever added to the old `roles` table either).
- `RoleController.php` still exists in the codebase but its routes have been replaced by `JobPositionController`. It is safe to delete.