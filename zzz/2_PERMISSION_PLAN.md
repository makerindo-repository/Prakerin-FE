# Permission System Plan - Role-Based Access Control

## Overview

**Goal**: Super Admin can toggle which features and actions each role can access.

**Format**: `action_feature` (e.g., `view_kelas`, `create_kelas`, `edit_kelas`, `delete_kelas`)

**Logic**: 
- Accessing feature data requires `view_feature` permission
- Creating requires `create_feature` permission
- Editing requires `edit_feature` permission
- Deleting requires `delete_feature` permission

---

## Features List (From Dashboard Sidebar)

### Main Features (Production)
1. **Dashboard** - Overview/analytics
2. **Kelas Pra-Magamg** - Class management
3. **Pembimbing** - Mentor/advisor management
4. **Manajemen User** - User management
5. **Isi Halaman** - Page content management
6. **Panduan** - Guidelines/documentation
7. **Feedback Pengguna** - User feedback
8. **Laporan** - Reporting
9. **Log Aktivitas** - Activity logs
10. **Pengaturan** - System settings
11. **Profil** - User profile

### Dev/In-Progress Features (Mark as DEV)
- AI Analytics (DEV)
- Data Provinsi (DEV)
- Data Kota/Kabupaten (DEV)
- Data Sektor Industri (DEV)
- Data Durasi Magamg (DEV)
- Data Jurusan Siswa (DEV)
- Data Bidang Magamg (DEV)
- Data Sekolah (DEV)
- Data Perguran Tinggi (DEV)
- Data Industri (DEV)

---

## Permission Categories

### 1. View Permission
```
view_dashboard
view_kelas
view_pembimbing
view_manajemen_user
view_isi_halaman
view_panduan
view_feedback
view_laporan
view_log_aktivitas
view_pengaturan
view_profil
view_ai_analytics (DEV)
view_data_provinsi (DEV)
view_data_kota (DEV)
view_data_sektor_industri (DEV)
view_data_durasi_magamg (DEV)
view_data_jurusan_siswa (DEV)
view_data_bidang_magamg (DEV)
view_data_sekolah (DEV)
view_data_perguruan_tinggi (DEV)
view_data_industri (DEV)
```

### 2. Create Permission
```
create_kelas
create_pembimbing
create_manajemen_user
create_isi_halaman
create_panduan
create_laporan
create_data_provinsi (DEV)
create_data_kota (DEV)
create_data_sektor_industri (DEV)
create_data_durasi_magamg (DEV)
create_data_jurusan_siswa (DEV)
create_data_bidang_magamg (DEV)
create_data_sekolah (DEV)
create_data_perguruan_tinggi (DEV)
create_data_industri (DEV)
```

### 3. Edit Permission
```
edit_kelas
edit_pembimbing
edit_manajemen_user
edit_isi_halaman
edit_panduan
edit_laporan
edit_pengaturan
edit_data_provinsi (DEV)
edit_data_kota (DEV)
edit_data_sektor_industri (DEV)
edit_data_durasi_magamg (DEV)
edit_data_jurusan_siswa (DEV)
edit_data_bidang_magamg (DEV)
edit_data_sekolah (DEV)
edit_data_perguruan_tinggi (DEV)
edit_data_industri (DEV)
```

### 4. Delete Permission
```
delete_kelas
delete_pembimbing
delete_manajemen_user
delete_isi_halaman
delete_panduan
delete_laporan
delete_data_provinsi (DEV)
delete_data_kota (DEV)
delete_data_sektor_industri (DEV)
delete_data_durasi_magamg (DEV)
delete_data_jurusan_siswa (DEV)
delete_data_bidang_magamg (DEV)
delete_data_sekolah (DEV)
delete_data_perguruan_tinggi (DEV)
delete_data_industri (DEV)
```

### 5. Special Permissions
```
manage_roles         # Only super_admin can assign roles
manage_permissions   # Only super_admin can modify permissions
view_log_aktivitas   # View system activity logs
approve_feedback     # Approve user feedback
```

---

## Role Definitions & Default Permissions

### Role: super_admin
**Description**: System administrator with full access

**Default Permissions**: ALL permissions (view, create, edit, delete everything)

---

### Role: school_admin
**Description**: School administrator

**Default Permissions**:
```
view_dashboard
view_kelas, create_kelas, edit_kelas, delete_kelas
view_pembimbing, create_pembimbing, edit_pembimbing, delete_pembimbing
view_manajemen_user, create_manajemen_user, edit_manajemen_user
view_isi_halaman, create_isi_halaman, edit_isi_halaman
view_panduan, create_panduan, edit_panduan
view_feedback, approve_feedback
view_laporan
view_log_aktivitas
view_profil, edit_profil
```

---

### Role: siswa (Student)
**Description**: Student user

**Default Permissions**:
```
view_dashboard
view_kelas
view_pembimbing
view_panduan
view_profil, edit_profil
view_feedback
```

---

### Role: company_owner
**Description**: Company/employer representative

**Default Permissions**:
```
view_dashboard
view_kelas (limited to their company's data)
view_pembimbing
view_panduan
view_profil, edit_profil
view_feedback
```

---

### Role: university_admin
**Description**: University administrator

**Default Permissions**:
```
view_dashboard
view_kelas, create_kelas, edit_kelas, delete_kelas
view_pembimbing
view_manajemen_user, create_manajemen_user, edit_manajemen_user
view_isi_halaman, create_isi_halaman, edit_isi_halaman
view_panduan, create_panduan, edit_panduan
view_laporan
view_log_aktivitas
view_profil, edit_profil
```

---

### Role: mahasiswa (University Student)
**Description**: University student user

**Default Permissions**:
```
view_dashboard
view_kelas
view_pembimbing
view_panduan
view_profil, edit_profil
view_feedback
```

---

## Super Admin Permission Management UI

The super admin will have a page where they can:

1. **Select a role** (dropdown)
2. **View all available permissions** (organized by feature and action)
3. **Toggle permissions** (checkboxes per permission)
4. **Save changes** (bulk update role_permission table)

### Example UI Layout:
```
┌─────────────────────────────────────────────┐
│ Role Permission Manager                     │
├─────────────────────────────────────────────┤
│                                             │
│ Select Role: [super_admin ▼]               │
│                                             │
│ Dashboard                                   │
│ ☑ view_dashboard                           │
│                                             │
│ Kelas                                       │
│ ☑ view_kelas                               │
│ ☑ create_kelas                             │
│ ☑ edit_kelas                               │
│ ☑ delete_kelas                             │
│                                             │
│ Pembimbing                                  │
│ ☑ view_pembimbing                          │
│ ☑ create_pembimbing                        │
│ ☑ edit_pembimbing                          │
│ ☑ delete_pembimbing                        │
│                                             │
│ [Cancel]  [Save Changes]                    │
└─────────────────────────────────────────────┘
```

---

## Implementation Steps

1. **Database**: Implement database fix plan (1_DATABASE_FIX_PLAN.md)
2. **Seed Data**: Create roles and permissions in database
3. **Laravel Models**: Create Role, Permission models with relationships
4. **Laravel API**: Build endpoints for:
   - GET `/api/roles` - List all roles
   - GET `/api/roles/{id}/permissions` - Get permissions for a role
   - PUT `/api/roles/{id}/permissions` - Update role permissions
   - GET `/api/user/permissions` - Get current user's permissions
5. **Next.js**: Implement permission hook and guards
6. **UI**: Build role permission manager in admin dashboard

---

## Checking Permissions in Code

### Backend (Laravel)
```php
// Check if user has permission
if (auth()->user()->hasPermissionTo('create_kelas')) {
    // Allow action
}

// Get user's role
auth()->user()->role()->first();
```

### Frontend (Next.js)
```javascript
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
    const { hasPermission } = usePermission();
    
    return (
        <>
            {hasPermission('view_kelas') && (
                <div>User can view kelas</div>
            )}
            {hasPermission('create_kelas') && (
                <button>Create Kelas</button>
            )}
        </>
    );
}
```

---

## Notes

- Permissions are checked on both frontend (UI) and backend (API)
- DEV features can be toggled off for roles until they're ready
- Only super_admin can modify role permissions
- Permissions are cached/stored in user session to avoid excessive DB queries
- Future: Could add per-resource permissions (e.g., only see their own school's data)
