# Database Fix Plan - Role & Permissions Structure

## Current Problem

The `roles` table is currently storing **job position data** (for dashboard charts), but the `users` table expects a proper **role-based access control system**. The `role` column in `users` stores string values instead of foreign keys.

```
Current (broken):
users.role = "super_admin" (string, no relation)
roles table = job position data (unrelated to user roles)
```

## Solution: Restructure Database

### Step 1: Rename Chart Data Table
Rename `roles` table → `job_positions`

**Reason**: It stores position/role catalog data for display (pie chart, etc.), not actual user roles.

**What stays the same**:
- All existing data in this table
- The chart queries still work

---

### Step 2: Create Proper Role System

#### New `roles` table
```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,  -- super_admin, school_admin, siswa, etc.
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Seed initial data**:
- super_admin
- school_admin
- siswa
- company_owner
- university_admin
- mahasiswa

#### New `permissions` table
```sql
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,  -- format: "action_feature" (view_kelas, create_kelas, etc.)
    description TEXT,
    feature VARCHAR(100),  -- kelas, pembimbing, manajemen_user, etc.
    action VARCHAR(50),    -- view, create, edit, delete, approve
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Example permissions**:
```
view_kelas, create_kelas, edit_kelas, delete_kelas
view_pembimbing, create_pembimbing, edit_pembimbing, delete_pembimbing
view_manajemen_user, create_manajemen_user, edit_manajemen_user, delete_manajemen_user
view_data_provinsi, create_data_provinsi, edit_data_provinsi, delete_data_provinsi
... (for each feature)
```

#### New `role_permission` junction table
```sql
CREATE TABLE role_permission (
    id BIGINT PRIMARY KEY,
    role_id BIGINT FOREIGN KEY → roles.id,
    permission_id BIGINT FOREIGN KEY → permissions.id,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
```

---

### Step 3: Update Users Table

**Migrate** `role` column (string) → `role_id` (foreign key)

**Before**:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(255);
-- Values: "super_admin", "school_admin", "siswa", etc.
```

**After**:
```sql
-- 1. Add new role_id column
ALTER TABLE users ADD COLUMN role_id BIGINT;

-- 2. Migrate existing data (string → id lookup)
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE roles.name = users.role)
WHERE users.role IS NOT NULL;

-- 3. Add foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT users_role_id_foreign 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- 4. Drop old role column
ALTER TABLE users DROP COLUMN role;
```

---

## Summary: Final Schema

```
users
├── id
├── email
├── password
├── role_id (FK → roles.id)  ← NEW/FIXED
├── is_pro
├── created_at
├── updated_at

roles
├── id
├── name (super_admin, school_admin, siswa, etc.)
├── description
├── created_at
├── updated_at

permissions
├── id
├── name (view_kelas, create_kelas, edit_kelas, etc.)
├── description
├── feature (kelas, pembimbing, manajemen_user, etc.)
├── action (view, create, edit, delete, approve)
├── created_at
├── updated_at

role_permission (junction)
├── id
├── role_id (FK → roles.id)
├── permission_id (FK → permissions.id)
├── created_at
├── updated_at

job_positions (old chart data - renamed from 'roles')
├── id
├── name (Project Manager, Content Writer, etc.)
├── is_accepted
├── created_at
├── updated_at
```

---

## Migration Order

1. Create new `roles` table
2. Create `permissions` table
3. Create `role_permission` table
4. Create `job_positions` as copy of old `roles`
5. Migrate `users.role` string → `users.role_id` FK
6. Drop old `roles` table

---

## Notes

- No data loss — all existing user roles are migrated by name lookup
- Chart queries will use `job_positions` instead of `roles`
- This enables proper permission system implementation
- Only super_admin can assign roles to users (enforced in backend)
