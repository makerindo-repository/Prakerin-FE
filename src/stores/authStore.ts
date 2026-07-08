import { create } from "zustand";

interface AuthState {
  role: string | null;
  permissions: string[];
  setRole: (role: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  permissions: [],
  setRole: (role) => set({ role }),
  setPermissions: (permissions) => set({ permissions }),
  clearAuth: () => set({ role: null, permissions: [] }),
}));
