# Role-Permission & Feature Toggle Architecture (Laravel API + Next.js)

Yes, this project **can absolutely** use a toggle-per-feature system! In fact, transitioning from hardcoded role checks to a permission-based system is a best practice for growing applications. It keeps both the frontend and backend highly flexible, letting the Super Admin toggle permissions dynamically from a database dashboard without modifying any code.

Here is a breakdown of how it works in a decoupled **Laravel (API) + Next.js (Frontend)** stack, compared to the Laravel Blade stack you recall.

---

## 1. Comparing Architectures

| Aspect | Traditional Laravel Blade | Decoupled Next.js + Laravel API |
| :--- | :--- | :--- |
| **How it works** | The backend parses the HTML, executes `@can('feature')` on the server, and serves static HTML. | The backend exposes permissions via an API endpoint. Next.js fetches these permissions and toggles UI elements on the client side. |
| **Backend Package** | `spatie/laravel-permission` (Models, DB tables, Blade Directives) | `spatie/laravel-permission` (Used for API protection, DB tables, and API JSON payload) |
| **Frontend Checks** | Server-side PHP gates: `@can('edit-post') ... @endcan` | Client-side React Hooks/Components: `const { can } = usePermission();` |

---

## 2. Technical Implementation Workflow

### Step A: Backend Setup (Laravel API)
1. **Install Spatie Laravel Permission**:
   Run `composer require spatie/laravel-permission` and run the migrations to create the following tables:
   * `roles` (e.g., `siswa`, `company_owner`, `super_admin`)
   * `permissions` (e.g., `view-vacancies`, `create-vacancies`, `edit-profile`)
   * `model_has_roles` & `role_has_permissions` (mapping tables)
2. **Assign Permissions**:
   Create a control panel or seeder where the Super Admin can sync permissions to roles:
   ```php
   $role = Role::findByName('company_owner');
   $role->givePermissionTo(['create-vacancies', 'view-applicants']);
   ```
3. **Expose Permissions in User Profile API**:
   Modify the `/api/users/profile` endpoint so that it returns the user's active permissions alongside their profile data:
   ```json
   {
     "success": true,
     "data": {
       "id": "uuid-string",
       "username": "company_abc",
       "role": "company_owner",
       "permissions": [
         "view-vacancies",
         "create-vacancies",
         "view-applicants"
       ]
     }
   }
   ```

---

### Step B: Frontend Setup (Next.js React)
Instead of checking role constants, we will create a global React Context that provides a `can()` function.

#### 1. The Permission Context (`src/context/PermissionContext.tsx`)
```tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface PermissionContextType {
  permissions: string[];
  can: (permission: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  can: () => false,
});

export const PermissionProvider = ({ 
  permissions, 
  children 
}: { 
  permissions: string[]; 
  children: ReactNode; 
}) => {
  const can = (permission: string) => permissions.includes(permission);

  return (
    <PermissionContext.Provider value={{ permissions, can }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);
```

#### 2. The `<Can>` Guard Component (`src/components/Can.tsx`)
A simple wrapper to conditionally hide or show UI sections:
```tsx
import React from 'react';
import { usePermission } from '@/context/PermissionContext';

interface CanProps {
  perform: string;
  yes: React.ReactNode;
  no?: React.ReactNode;
}

export const Can = ({ perform, yes, no = null }: CanProps) => {
  const { can } = usePermission();
  return can(perform) ? <>{yes}</> : <>{no}</>;
};
```

---

## 3. How We Use It in Practice

### Page / Layout Refactor (Dynamic Sidebar)
In your [layout.tsx](file:///c:/laragon/www/Prakerin/Prakerin-FE/src/app/dashboard/layout.tsx), instead of filtering the sidebar menu using hardcoded `MENU_MAP[role]`, we can assign a required permission to each menu item and filter them dynamically:

```typescript
interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  href?: string;
  permission?: string; // Add this!
  children?: MenuItem[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Briefcase, label: "Lowongan", href: "/dashboard/lowongan", permission: "view-vacancies" },
  { icon: FileText, label: "Lamaran", href: "/dashboard/industry/lamaran", permission: "manage-applications" },
  { icon: Database, label: "Master Data", permission: "manage-system-data", children: [
    { icon: Map, label: "Provinsi", href: "/dashboard/master-data/provinsi" },
  ]},
];

// Inside layout component:
const { can } = usePermission();

const visibleMenuItems = useMemo(() => {
  return ALL_MENU_ITEMS.filter(item => {
    // If it requires a permission, check it
    if (item.permission && !can(item.permission)) return false;
    
    // Filter children if any
    if (item.children) {
      item.children = item.children.filter(child => !child.permission || can(child.permission));
      return item.children.length > 0;
    }
    
    return true;
  });
}, [can]);
```

### Component Toggling (Inside a single page)
If we want a single page to adapt depending on permissions (e.g. standard view vs edit/action view), we can toggle sections inline:

```tsx
import { usePermission } from '@/context/PermissionContext';

export default function VacancyPage() {
  const { can } = usePermission();

  return (
    <div>
      <h1>Job Vacancy Details</h1>
      <p>Vacancy description goes here...</p>

      {/* Only show edit button if the user has permission, regardless of their role */}
      {can('edit-vacancies') && (
        <button className="btn-edit">Edit Lowongan</button>
      )}
    </div>
  );
}
```

---

## Advantages of this System
1. **Dynamic Configuration**: The Super Admin can create new custom roles or modify existing ones via the database (e.g., allow `company_admin` to create tasks but deny them access to billing) without redeploying the frontend or backend code.
2. **Granular Control**: Avoids massive page duplications. We can create unified pages that conditionally render different panels based on user permissions.
3. **Decoupled Security**: Backend APIs remain secure by checking permissions at the controller level (`$this->authorize('create-vacancies')`), while the frontend checks matching permission tags to adjust the UI layout.
