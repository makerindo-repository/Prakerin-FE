import { useAuthStore } from '@/stores/authStore';

/**
 * Hook for checking user permissions.
 * Reads from Zustand auth store which is populated after login.
 *
 * Usage:
 *   const { can, canAny, role, permissions } = usePermission();
 *   if (can('view_kelas')) { ... }
 *   if (canAny(['create_kelas', 'edit_kelas'])) { ... }
 */
export function usePermission() {
  const { role, permissions } = useAuthStore();

  /**
   * Returns true if the user has the specified permission.
   */
  const can = (permission: string): boolean => {
    if (role === 'super_admin') return true;
    return permissions.includes(permission);
  };

  /**
   * Returns true if the user has ANY of the specified permissions.
   */
  const canAny = (perms: string[]): boolean => {
    if (role === 'super_admin') return true;
    return perms.some((p) => permissions.includes(p));
  };

  /**
   * Returns true if the user has ALL of the specified permissions.
   */
  const canAll = (perms: string[]): boolean => {
    if (role === 'super_admin') return true;
    return perms.every((p) => permissions.includes(p));
  };

  /**
   * Returns true if the user has the specified Spatie role.
   * Use the legacy role string (e.g. 'super_admin', 'school', 'student', 'company').
   */
  const hasRole = (roleName: string): boolean => {
    return role === roleName;
  };

  return { can, canAny, canAll, hasRole, role, permissions };
}

