# 📋 ACTION PLAN: Based on Audit Results

## QUICK SUMMARY

| Feature | Status | Complexity |
|---------|--------|------------|
| **Siswa CRUD** | Partially working, needs fixes | Quick |
| **Mahasiswa CRUD** | Doesn't exist (shares Siswa code) | Quick |
| **User Management** | Partially working, has bugs | Quick |
| **Laporan (Reports)** | Completely missing | Medium |
| **Activity Logs** | Completely missing | Medium |
| **Awards** | Under construction, needs rebuild | Medium |

---

## PRIORITY ORDER: What to Fix First

### 🟢 PHASE 1: Quick Wins — DO THESE FIRST

#### 1.1 Fix Siswa CRUD Backend
**Issues to fix:**
- Stubbed update method (doesn't save to DB)
- Double password hashing
- ID type mismatch (int vs UUID)
- Token ability spelling inconsistency

**What AI needs to do:**
- Complete the `update()` method in StudentController
- Remove manual password hashing in `store()`
- Fix ID parameter types to use UUID string
- Fix spelling: `school:access` → `school-access`

---

#### 1.2 Fix Siswa CRUD Frontend
**Issues to fix:**
- Missing edit/delete buttons in list
- Add student form missing profile fields
- N+1 query performance issue

**What AI needs to do:**
- Add Edit button → opens edit form (reuse create form component)
- Add Delete button with confirmation modal
- Add fields to form: class, major, gender, address, phone_number, date_of_birth
- (Backend fix will handle N+1 lazy loading)

---

#### 1.3 Fix User Management Backend
**Issue to fix:**
- Target role validation bug (uses wrong role to validate)
- Update method not routed correctly

**What AI needs to do:**
- Fix `UserUpdateProfileRequest` to use target user's role, not logged-in user's role
- Ensure PATCH `/api/v1/users/{id}` routes to correct method
- Handle all role types: student, school, company, super_admin

---

#### 1.4 Fix User Management Frontend
**Issue to fix:**
- Hardcoded role names in success messages
- No create user button

**What AI needs to do:**
- Use actual role name in toast messages
- Add "Create New User" button → form with fields: name, email, role
- Make validation dynamic based on selected role

---

### 🟡 PHASE 2: Medium Features — AFTER PHASE 1

#### 2.1 Mahasiswa CRUD
**Status:** Doesn't exist separately
**Action:** Already covered by fixing Siswa CRUD

---

#### 2.2 Awards (Penghargaan)
**Current state:** Stubbed, under construction
**What needs to be built:**

**Backend:**
- Fix migration: Add fields (name, description, category, icon, created_at, updated_at)
- Create AwardController with full CRUD
- Create model relationships (Award hasMany StudentAward)
- Create endpoints: GET/POST awards, POST assign award to student

**Frontend:**
- Replace `<UnderConstruction />` with actual list page
- List awards with name, category, icon
- Create form for adding awards
- Create form for assigning awards to students
- Show student's awards on profile

---

#### 2.3 Activity Logs (Log Aktivitas)
**Current state:** Completely missing
**What needs to be built:**

**Backend:**
- Create migration: id, user_id, action, resource_type, resource_id, timestamp
- Create ActivityLog model
- Create logging middleware to capture user actions (create/update/delete)
- Create ActivityLogController with index method

**Frontend:**
- Create admin page: /dashboard/log-aktivitas
- Table showing: User, Action, Resource, Timestamp
- Filters: by user, by action type, date range

---

#### 2.4 Reports (Laporan)
**Current state:** Completely missing
**What needs to be built:**

**Backend:**
- Create Report model (or queries for various reports)
- ReportController with methods for each report type:
  - Internship statistics (total, by company, by status)
  - Student progress (enrolled, in progress, completed)
  - Company performance (placement rate, avg rating)
- Export methods (JSON/CSV for Excel)

**Frontend:**
- Create admin page: /dashboard/laporan
- Summary cards showing key metrics
- Filter options: date range, type, company/school
- Charts (bar/pie) showing distributions
- Export button (CSV/PDF)

---

## EXECUTION STRATEGY

**Work in parallel:**
```
PERSON 1 (Backend):
  - Fix Siswa CRUD bugs
  - Fix User Management bugs

PERSON 2 (Frontend):
  - Fix Siswa CRUD UI
  - Fix User Management UI

AI #1 (Backend):
  - Generate fixes for all backend issues
  - Have code ready for human review

AI #2 (Frontend):
  - Generate component updates
  - Have code ready for human review
```

**Then:**
```
Move to Phase 2 (Awards, Activity Logs, Reports)
Parallel work by all 4 people
```

---

## What to Tell Your Boss

"We audited the system. Here's the breakdown:
- 3 features have bugs we need to fix
- 3 features need to be built from scratch
- We've identified exactly what's broken and what needs to be built. Starting now."

---

## Files to Give AI Devs

1. **FULL_EXECUTION_PLAN.md** (has all the technical specs)
2. **This file** (priorities + what to do first)
3. **Audit report** (for reference on what's broken)

Then let them rip!

---

**Ready to go.** Give this to your AI devs and let them start building.
