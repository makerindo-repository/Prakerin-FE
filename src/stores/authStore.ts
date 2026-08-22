import { create } from "zustand";

interface AuthState {
  role: string | null;
  permissions: string[];
  studentId: string | null; // ID row `students` milik user yang login (kalau role === "student")
  schoolType: "school" | "university" | null; // "school" (SMK/SMA) atau "university" (Perguruan Tinggi)
  setRole: (role: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  setStudentId: (studentId: string | null) => void;
  setSchoolType: (schoolType: "school" | "university" | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  permissions: [],
  studentId: null,
  schoolType: null,
  setRole: (role) => set({ role }),
  setPermissions: (permissions) => set({ permissions }),
  setStudentId: (studentId) => set({ studentId }),
  setSchoolType: (schoolType) => set({ schoolType }),
  clearAuth: () => set({ role: null, permissions: [], studentId: null, schoolType: null }),
}));