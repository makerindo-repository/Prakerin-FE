import { alertSuccess } from '@/libs/alert';
import { useAuthStore } from '@/stores/authStore';

/**
 * Utility to execute an async API call and suppress errors if the current user is a super_admin.
 * In case of error for a super_admin, logs a warning, alerts a presentation success message,
 * and returns a mock success response containing Axios-compatible structure.
 */
export const suppressErrorForSuperAdmin = async <T = any>(
  apiCall: () => Promise<T>,
  options?: { showSuccessMessage?: boolean; successMessage?: string; defaultData?: any }
): Promise<T | any> => {
  try {
    return await apiCall();
  } catch (error) {
    const userRole = useAuthStore.getState().role;
    
    if (userRole === 'super_admin') {
      console.warn('[SuperAdmin Error Suppressed]', error);
      
      if (options?.showSuccessMessage !== false) {
        alertSuccess(options?.successMessage || 'Operation completed (presentation mode)');
      }
      
      const mockData = options?.defaultData !== undefined ? options.defaultData : null;
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: {
          success: true,
          message: options?.successMessage || 'Operation completed (presentation mode - errors suppressed)',
          data: mockData,
        },
        success: true,
        message: options?.successMessage || 'Operation completed (presentation mode - errors suppressed)',
      };
    }
    
    throw error;
  }
};
