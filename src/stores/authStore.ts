import { create } from "zustand";

interface AuthState {
  role: string | null;
  permissions: string[];
  studentId: string | null; // ID row `students` milik user yang login (kalau role === "student")
  companyId: string | null; // ID row `companies` milik user yang login (kalau role === "company")
  schoolType: "school" | "university" | null; // "school" (SMK/SMA) atau "university" (Perguruan Tinggi)
  statusSubscription: "free" | "premium" | null;
  setRole: (role: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  setStudentId: (studentId: string | null) => void;
  setCompanyId: (companyId: string | null) => void;
  setSchoolType: (schoolType: "school" | "university" | null) => void;
  setStatusSubscription: (statusSubscription: "free" | "premium" | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  permissions: [],
  studentId: null,
  companyId: null,
  schoolType: null,
  statusSubscription: null,
  setRole: (role) => set({ role }),
  setPermissions: (permissions) => set({ permissions }),
  setStudentId: (studentId) => set({ studentId }),
  setCompanyId: (companyId) => set({ companyId }),
  setSchoolType: (schoolType) => set({ schoolType }),
  setStatusSubscription: (statusSubscription) => set({ statusSubscription }),
  clearAuth: () => set({ role: null, permissions: [], studentId: null, companyId: null, schoolType: null, statusSubscription: null }),
}));