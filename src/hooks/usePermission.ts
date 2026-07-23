import { useAuthStore } from '@/stores/authStore';
import { isFreeFeature } from '@/config/features';

/**
 * Hook for checking user permissions and subscription tier access.
 * Reads from Zustand auth store which is populated after login.
 *
 * Usage:
 *   const { can, canAny, role, permissions, canAccessFeature } = usePermission();
 *   if (can('view_kelas')) { ... }
 *   if (canAccessFeature('view_ai_analytics', userSubscriptionTier)) { ... }
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
   */
  const hasRole = (roleName: string): boolean => {
    return role === roleName;
  };

  /**
   * Checks if user can access a feature based on subscription tier ('free' | 'premium').
   */
  const canAccessFeature = (featureName: string, subscriptionTier: 'free' | 'premium' = 'free'): boolean => {
    if (role === 'super_admin' || subscriptionTier === 'premium') return true;
    return isFreeFeature(featureName);
  };

  return { can, canAny, canAll, hasRole, canAccessFeature, role, permissions };
}

