"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Home,
  Briefcase,
  FileText,
  Building,
  MessageSquare,
  Award,
  User,
  Menu,
  X,
  Clock,
  LogOut,
  UsersRound,
  MapPin,
  UserCircle,
  CircleArrowLeft,
  BookOpen,
  MessageSquareText,
  Handshake,
  HelpCircle,
  UserRound,
  Building2,
  Factory,
  CalendarClock,
  GraduationCap,
  BriefcaseBusiness,
  Map,
  ClipboardCheck,
  Medal,
  LayoutDashboard,
  Search,
  Bell,
  ChevronDown,
  School,
  Settings,
  ScrollText,
  Activity,
  Newspaper,
  Shield,
  Landmark,
  Brain,
  Sparkles,
  DollarSign,
  CreditCard,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { API, createApiCall, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import { usePathname } from "next/navigation";
import { alertConfirm } from "@/libs/alert";
import { getUserPermissions } from "@/libs/permissionApi";
import { useAuthStore } from "@/stores/authStore";


// ── Types ──────────────────────────────────────────────────────────────────

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  href?: string;
  isDev?: boolean; // halaman belum dibuat → badge "Dev"
  permission?: string;
  isLms?: boolean; // LMS link
  onlyForSchoolType?: "school" | "university"; // item cuma tampil kalau institusi login match tipe ini
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface Profile {
  photo_profile?: string | null;
  name: string;
  email: string;
  role: Role;
  rawRole?: string;
  schoolType?: "school" | "university" | null; // dipakai buat nentuin menu Data Siswa vs Data Mahasiswa
  timezone?: string; // mis. "Asia/Jakarta" — dipakai buat jam dashboard
  timezoneLabel?: string; // mis. "WIB"
  username: string;
}

type Role =
  | "Siswa"
  | "Mahasiswa"
  | "Perusahaan"
  | "Sekolah"
  | "Perguruan Tinggi"
  | "Super Admin"
  | "";

// ── Semua menu dari referensi layouts.html ─────────────────────────────────

const NAV_GROUPS: Record<string, NavGroup[]> = {

  // ── Super Admin: semua menu reference lengkap ──────────────────────────
  super_admin: [
    {
      label: "UTAMA",
      items: [
        { icon: Home, label: "Dashboard", href: "/dashboard", permission: "view_dashboard" },
      ],
    },
    {
      label: "AI Features",
      items: [
        { icon: Sparkles, label: "AI Smart CV Generator", href: "/dashboard/cv/cv-pintar", permission: "view_ai_analytics" },
        { icon: Brain, label: "AI CV Analyzer", href: "/dashboard/ai-analytics", permission: "view_ai_analytics" },
        { icon: FileText, label: "AI Report", href: "/dashboard/ai-report", permission: "view_ai_analytics" },
      ],
    },
    {
      label: "MASTER DATA",
      items: [
        { icon: Map, label: "Data Provinsi", href: "/dashboard/master-data/provinsi", permission: "view_data_provinsi" },
        { icon: Building2, label: "Data Kota/Kabupaten", href: "/dashboard/master-data/kota-kabupaten", permission: "view_data_kota" },
        { icon: Factory, label: "Data Sektor Industri", href: "/dashboard/master-data/sektor", permission: "view_data_sektor_industri" },
        { icon: CalendarClock, label: "Data Durasi Magang", href: "/dashboard/master-data/durasi", permission: "view_data_durasi_magang" },
        { icon: GraduationCap, label: "Data Jurusan Siswa", href: "/dashboard/master-data/jurusan", permission: "view_data_jurusan_siswa" },
        { icon: BriefcaseBusiness, label: "Data Bidang Magang", href: "/dashboard/master-data/bidang", permission: "view_data_bidang_magang" },
        { icon: School, label: "Data Sekolah", href: "/dashboard/sekolah", permission: "view_data_sekolah" },
        { icon: Landmark, label: "Data Universitas", href: "/dashboard/universitas", permission: "view_data_perguruan_tinggi" },
        { icon: Building, label: "Data Industri", href: "/dashboard/perusahaan", permission: "view_data_industri" },
      ],
    },
    {
      label: "MANAJEMEN",
      items: [
        { icon: UsersRound, label: "Siswa", href: "/dashboard/school/siswa", permission: "view_manajemen_user" },
        { icon: GraduationCap, label: "Mahasiswa", href: "/dashboard/school/mahasiswa", permission: "view_manajemen_user" },
        { icon: MapPin, label: "Penempatan", href: "/dashboard/school/penempatan", permission: "view_kelas" },
        { icon: BookOpen, label: "Kelas Pra-Magang", href: "https://makerindo.myr.id/", isLms: true, permission: "view_kelas" },
        { icon: UserRound, label: "Pembimbing", href: "/dashboard/pembimbing", permission: "view_pembimbing" },
        { icon: UsersRound, label: "Manajemen User", href: "/dashboard/master-data/users", permission: "view_manajemen_user" },
      ],
    },
    {
      label: "KONTEN & KOMUNIKASI",
      items: [
        { icon: Newspaper, label: "Isi Halaman", href: "/dashboard/isi-halaman", permission: "view_isi_halaman" },
        { icon: HelpCircle, label: "Panduan", href: "/dashboard/guides", permission: "view_panduan" },
      ],
    },
    {
      label: "MONITORING & LAPORAN",
      items: [
        { icon: ScrollText, label: "Laporan", href: "/dashboard/laporan", permission: "view_laporan" },
        { icon: DollarSign, label: "Revenue Dashboard", href: "/dashboard/admin/revenue", permission: "view_laporan" },
        { icon: Activity, label: "Log Aktivitas", href: "/dashboard/log-aktivitas", permission: "view_log_aktivitas" },
      ],
    },
    {
      label: "SISTEM",
      items: [
        { icon: CreditCard, label: "Subscription Tiers", href: "/dashboard/subscription-tiers", permission: "manage_permissions" },
        { icon: Settings, label: "Pengaturan", href: "/dashboard/pengaturan", permission: "view_pengaturan" },
        { icon: Bell, label: "Notifikasi", href: "/dashboard/inbox", permission: "view_profil" },
        { icon: User, label: "Profil", href: "/dashboard/profile", permission: "view_profil" },
      ],
    },
  ],

  // ── Siswa / Mahasiswa ─────────────────────────────────────────────────
  student: [
    {
      label: "UTAMA",
      items: [
        { icon: Home, label: "Dashboard", href: "/dashboard", permission: "view_dashboard" },
      ],
    },
    {
      label: "AI Features",
      items: [
        { icon: Sparkles, label: "AI Smart CV Generator", href: "/dashboard/cv/cv-pintar", permission: "view_profil" },
        { icon: Brain, label: "AI CV Analyzer", href: "/dashboard/ai-analytics", permission: "view_ai_analytics" },
        { icon: FileText, label: "AI Report", href: "/dashboard/ai-report", permission: "view_dashboard" },
      ],
    },
    {
      label: "MANAJEMEN",
      items: [
        { icon: Briefcase, label: "Lowongan", href: "/dashboard/lowongan", permission: "view_kelas" },
        { icon: BookOpen, label: "Kelas Pra-Magang", href: "https://makerindo.myr.id/", isLms: true, permission: "view_kelas" },
        { icon: FileText, label: "Curriculum Vitae", href: "/dashboard/cv", permission: "view_profil" },
        { icon: Building, label: "Perusahaan", href: "/dashboard/perusahaan", permission: "view_kelas" },
        { icon: ClipboardCheck, label: "Daftar Tugas", href: "/dashboard/tasklist", permission: "view_kelas" },
        { icon: MessageSquare, label: "Ulasan", href: "/dashboard/feedback", permission: "view_feedback" },
        { icon: Medal, label: "Sertifikat", href: "/dashboard/sertifikat", permission: "view_profil" },
        { icon: Award, label: "Penghargaan Saya", href: "/dashboard/my-awards", permission: "view_profil" },
        { icon: UserRound, label: "Pembimbing", href: "/dashboard/mentor", permission: "view_pembimbing" },
        { icon: HelpCircle, label: "Panduan", href: "/dashboard/panduan/student", permission: "view_panduan" },
        { icon: Bell, label: "Notifikasi", href: "/dashboard/inbox", permission: "view_profil" },
        { icon: User, label: "Profil", href: "/dashboard/profile", permission: "view_profil" },
      ],
    },
  ],

  // ── Perusahaan ─────────────────────────────────────────────────────────
  company: [
    {
      label: "UTAMA",
      items: [
        { icon: Home, label: "Dashboard", href: "/dashboard", permission: "view_dashboard" },
      ],
    },
    {
      label: "MANAJEMEN",
      items: [
        { icon: UsersRound, label: "Siswa/Mahasiswa Magang", href: "/dashboard/siswa-magang", permission: "view_kelas" },
        { icon: BookOpen, label: "Kelas Pra-Magang", href: "https://makerindo.myr.id/", isLms: true, permission: "view_kelas" },
        { icon: HelpCircle, label: "Tes", href: "/dashboard/tes", permission: "view_kelas" },
        { icon: Briefcase, label: "Lowongan", href: "/dashboard/lowongan", permission: "view_kelas" },
        { icon: FileText, label: "Lamaran", href: "/dashboard/industry/lamaran", permission: "view_kelas" },
        { icon: ClipboardCheck, label: "Daftar Tugas", href: "/dashboard/tasklist", permission: "view_kelas" },
        { icon: BookOpen, label: "Sekolah/Universitas", href: "/dashboard/sekolah", permission: "view_kelas" },
        { icon: Handshake, label: "Kerja Sama", href: "/dashboard/mou", permission: "view_kelas" },
        { icon: Award, label: "Penghargaan", href: "/dashboard/awards", permission: "view_laporan" },
        { icon: MessageSquareText, label: "Ulasan", href: "/dashboard/feedback", permission: "view_feedback" },
        { icon: Medal, label: "Sertifikat", href: "/dashboard/sertifikat", permission: "view_profil" },
        { icon: UserRound, label: "Pembimbing Perusahaan", href: "/dashboard/pembimbing-perusahaan", permission: "view_pembimbing" },
        { icon: HelpCircle, label: "Panduan", href: "/dashboard/panduan/company", permission: "view_panduan" },
        { icon: Bell, label: "Notifikasi", href: "/dashboard/inbox", permission: "view_profil" },
        { icon: User, label: "Profil", href: "/dashboard/profile", permission: "view_profil" },
      ],
    },
  ],

  // ── Sekolah / Perguruan Tinggi ─────────────────────────────────────────
  school: [
    {
      label: "UTAMA",
      items: [
        { icon: Home, label: "Dashboard", href: "/dashboard", permission: "view_dashboard" },
      ],
    },
    {
      label: "AI Features",
      items: [
        { icon: ScrollText, label: "Template Laporan", href: "/dashboard/school/template-laporan", permission: "view_dashboard" },
      ],
    },
    {
      label: "MANAJEMEN",
      items: [
        { icon: UsersRound, label: "Data Siswa", href: "/dashboard/school/siswa", permission: "view_manajemen_user", onlyForSchoolType: "school" },
        { icon: GraduationCap, label: "Data Mahasiswa", href: "/dashboard/school/mahasiswa", permission: "view_manajemen_user", onlyForSchoolType: "university" },
        { icon: MapPin, label: "Penempatan", href: "/dashboard/school/penempatan", permission: "view_kelas" },
        { icon: BookOpen, label: "Kelas Pra-Magang", href: "https://makerindo.myr.id/", isLms: true, permission: "view_kelas" },
        { icon: Building, label: "Perusahaan", href: "/dashboard/perusahaan", permission: "view_kelas" },
        { icon: Handshake, label: "Kerja Sama", href: "/dashboard/mou", permission: "view_kelas" },
        { icon: Award, label: "Penghargaan", href: "/dashboard/awards", permission: "view_laporan" },
        { icon: MessageSquareText, label: "Ulasan", href: "/dashboard/feedback", permission: "view_feedback" },
        { icon: UserRound, label: "Guru Pembimbing", href: "/dashboard/guru-pembimbing", permission: "view_pembimbing" },
        { icon: HelpCircle, label: "Panduan", href: "/dashboard/panduan/school", permission: "view_panduan" },
        { icon: Bell, label: "Notifikasi", href: "/dashboard/inbox", permission: "view_profil" },
        { icon: User, label: "Profil", href: "/dashboard/profile", permission: "view_profil" },
      ],
    },
  ],
};

// route yang butuh status active
const REQUIRES_ACTIVE_PREFIXES = [
  "/dashboard/lowongan",
  "/dashboard/cv",
  "/dashboard/tasklist",
  "/dashboard/feedback",
  "/dashboard/sertifikat",
];

// ── Component ──────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopClosed, setIsDesktopClosed] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<Profile>({
    username: "",
    name: "",
    email: "",
    role: "",
  });
  const pathName = usePathname();

  // ── Link "Kelas Pra-Magang" (dari Pengaturan, fallback ke URL lama) ────────
  const [lmsUrl, setLmsUrl] = useState<string>("https://makerindo.myr.id/");
  useEffect(() => {
    const token = Cookies.get("userToken");
    if (!token) return;
    API.get("/api/v1/settings/public", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const url = res.data?.data?.pre_internship_class_url;
        if (url) setLmsUrl(url);
      })
      .catch(() => {
        // Diamkan saja — sidebar tetap pakai fallback URL di atas.
      });
  }, []);

  // ── Click outside dropdown ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const isConfirm = await alertConfirm("Anda yakin ingin logout?");
    if (!isConfirm) return;
    Cookies.remove("userToken");
    Cookies.remove("authorization");
    window.location.href = "/";
  };

  // ── Fetch profile ─────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      // FIX: signal sekarang jadi bagian dari config object (bukan argumen ke-2
      // terpisah), supaya createApiCall benar-benar meneruskannya ke axios.
      const response = await createApiCall({
        url: `${ENDPOINTS.USERS}/profile`,
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        signal,
      });

      const data = response.data;

      const getRoleLabel = (role: string, userData: any) => {
        switch (role) {
          case "school":
            return userData.school?.type === "school" ? "Sekolah" : "Perguruan Tinggi";
          case "student":
            return userData.student?.school?.type === "school" ? "Siswa" : "Mahasiswa";
          case "company":
            return "Perusahaan";
          case "super_admin":
            return "Super Admin";
          default:
            return "";
        }
      };

      const roleLabel = getRoleLabel(data.role, data);

      let photoProfile = null;
      if (data.role === "student" && data.student?.photo_profile) {
        photoProfile = data.student.photo_profile;
      } else if (data.role === "school" && data.school?.photo_profile) {
        photoProfile = data.school.photo_profile;
      } else if (data.role === "company" && data.company?.photo_profile) {
        photoProfile = data.company.photo_profile;
      } else if (data.photo_profile) {
        photoProfile = data.photo_profile;
      }

      setProfile({
        ...data,
        photo_profile: photoProfile,
        role: roleLabel,
        rawRole: data.role,
        schoolType: data.school?.type ?? null,
        timezone: data.timezone ?? "Asia/Jakarta",
        timezoneLabel: data.timezone_label ?? "WIB",
      });
      setNavGroups(NAV_GROUPS[data.role] ?? []);

      // Simpan ID row `students` di Zustand (dipakai komponen langganan:
      // SubscriptionStatus, LockedFeature, dst — semuanya butuh studentId).
      useAuthStore.getState().setStudentId(data.role === "student" ? data.student?.id ?? null : null);

      // Fetch and restore permissions in Zustand on reload
      const token = Cookies.get("userToken");
      if (token) {
        try {
          const permsData = await getUserPermissions(token);
          useAuthStore.getState().setRole(permsData.role);
          useAuthStore.getState().setPermissions(permsData.permissions);
        } catch (err) {
          console.warn("Could not restore user permissions on layout load:", err);
        }
      }
    } catch (error: any) {
      const isCanceled =
        error?.name === "AbortError" ||
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED" ||
        error?.message === "canceled";

      if (!isCanceled) {
        console.error("Error fetching profile:", error);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => controller.abort();
  }, [fetchProfile]);

  // ── Clock ─────────────────────────────────────────────────────────────────
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time
    ? time.toLocaleTimeString("id-ID", {
        hour12: false,
        timeZone: profile.timezone || "Asia/Jakarta",
      })
    : "--:--:--";
  const dateString = time
    ? time.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: profile.timezone || "Asia/Jakarta",
      })
    : "-";

  // ── Back to homepage ──────────────────────────────────────────────────────
  const handleBack = () => {
    window.location.href = "/";
  };

  // ── Sidebar & dropdown helpers ────────────────────────────────────────────
  const toggleDropdown = useCallback(() => setDropdownOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  // ── Menu state (lazy client init) ─────────────────────────────────────────
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    const authorization =
      typeof window !== "undefined" ? Cookies.get("authorization") ?? "" : "";
    setNavGroups(NAV_GROUPS[authorization] ?? []);
    if (typeof window !== "undefined") {
      const v = Cookies.get("active") ?? "";
      const active = !!v && ["true", "1", "yes", "on"].includes(v.toLowerCase());
      setIsActive(active);
    }
  }, []);

  const permissions = useAuthStore((s) => s.permissions);
  const userRole = useAuthStore((s) => s.role);

  // ── Compute visible nav groups (filter by active status & permissions) ────
  const visibleNavGroups = useMemo(() => {
    const isProtectedHref = (href?: string) => {
      if (!href) return false;
      return REQUIRES_ACTIVE_PREFIXES.some(
        (p) => href === p || href.startsWith(p + "/") || href.startsWith(p)
      );
    };

    const hasPermission = (item: NavItem) => {
      if (profile.rawRole === "super_admin" || userRole === "super_admin") return true;
      if (item.permission) {
        return permissions.includes(item.permission);
      }
      return true;
    };

    const matchesSchoolType = (item: NavItem) => {
      if (!item.onlyForSchoolType) return true;
      // Selama tipe institusi belum kebaca (masih loading), item disembunyikan
      // dulu (aman) daripada nampilin dua-duanya sekilas.
      return profile.schoolType === item.onlyForSchoolType;
    };

    return navGroups
      .map((group) => {
        const filteredItems = group.items
          .filter((item) => {
            // 1. Cek active status check
            if (!isActive && isProtectedHref(item.href)) return false;
            // 2. Cek cocok tipe institusi (Data Siswa vs Data Mahasiswa, dst)
            if (!matchesSchoolType(item)) return false;
            // 3. Cek permission check
            return hasPermission(item);
          })
          .map((item) =>
            // Link "Kelas Pra-Magang" diatur dari Pengaturan (bukan hardcode),
            // jadi timpa href-nya di sini pas render.
            item.isLms ? { ...item, href: lmsUrl } : item
          );
        return filteredItems.length > 0
          ? { ...group, items: filteredItems }
          : null;
      })
      .filter(Boolean) as NavGroup[];
  }, [navGroups, isActive, permissions, profile.rawRole, profile.schoolType, userRole, lmsUrl]);

  // ── Active link check ─────────────────────────────────────────────────────
  const isActiveLink = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard")
      return pathName === href;
    if (href === "/dashboard/cv") {
      return pathName === "/dashboard/cv" || (pathName.startsWith("/dashboard/cv/") && !pathName.startsWith("/dashboard/cv/cv-pintar"));
    }
    return pathName === href || pathName.startsWith(href + "/");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          !isDesktopClosed ? "lg:translate-x-0" : "lg:-translate-x-full"
        }`}
      >
        {/* Logo — logo_prakerin_new_transparent.png */}
        <div className="px-5 py-5 flex items-center" data-purpose="sidebar-logo">
          <Link href={"/"} className="flex items-center w-full">
            <img
              src="/logo_prakerin_new_transparent.png"
              alt="Prakerin.ID Logo"
              className="h-10 w-auto max-w-[200px] object-contain"
            />
          </Link>
        </div>

        {/* Clock Widget — mengacu referensi */}
        <div className="px-4 mb-3">
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="text-[#035a70]">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800 leading-tight">
                {timeString}
                <span className="ml-1.5 align-middle text-[10px] font-semibold text-accent">
                  {profile.timezoneLabel || "WIB"}
                </span>
              </div>
              <div className="text-[10px] text-gray-500">{dateString}</div>
            </div>
          </div>
        </div>

        {/* Close button (mobile only) */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation — semua menu dari referensi layouts.html */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-5 pb-6 sidebar-scroll">
          {!isActive && (
            <div className="px-2">
              <span className="text-red-500 text-xs">
                *Akun Kamu belum Aktif silahkan konfirmasi ke admin untuk mengaktifkan akun
              </span>
            </div>
          )}

          {visibleNavGroups.map((group) => (
            <div key={group.label} data-purpose="nav-group">
              <h3 className="text-[#64748b] font-bold text-[0.65rem] uppercase tracking-widest mb-2 px-2">
                {group.label}
              </h3>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActiveLink(item.href);
                  const isLms = item.isLms;
                  const el = (
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-[#035a70] text-white shadow-sm"
                          : isLms
                          ? "text-[#157af6] bg-[#157af6]/5 hover:bg-[#157af6]/15 hover:text-[#157af6] border-l-2 border-[#157af6] rounded-l-none pl-2.5"
                          : item.href
                          ? "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.isDev && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">
                          Dev
                        </span>
                      )}
                      {isLms && (
                        <span className="text-[8px] font-extrabold uppercase tracking-wider bg-[#157af6] text-white px-1.5 py-0.5 rounded shrink-0 animate-pulse">
                          LMS
                        </span>
                      )}
                    </div>
                  );

                  return (
                    <li key={item.label}>
                      {item.href ? (
                        item.href.startsWith("http") ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={closeSidebar}>
                            {el}
                          </a>
                        ) : (
                          <Link href={item.href} onClick={closeSidebar}>
                            {el}
                          </Link>
                        )
                      ) : (
                        el
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer — tombol Hide*/}
        <div className="p-4 border-t border-gray-100" data-purpose="sidebar-footer">
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) setIsDesktopClosed(true); // Hide di desktop
              else setSidebarOpen(false); // Tutup overlay di mobile
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium group"
          >
            <CircleArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Sembunyikan</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col ${isDesktopClosed ? "lg:ml-0" : "lg:ml-64"} min-w-0`}>
        {/* Header — gaya referensi (white, search, notif, profile) */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: hamburger */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) setIsDesktopClosed(false);
                  else setSidebarOpen(true);
                }}
                className={`text-gray-600 cursor-pointer ${
                  !isDesktopClosed ? "lg:hidden" : ""
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Right: notification + profile */}
            <div className="flex items-center gap-4">
              {/* Notification Bell — disembunyikan sementara (belum terhubung
                  ke notifikasi asli, badge "3" di bawah ini masih hardcode).
                  Tinggal hapus komentar ini kalau fiturnya sudah siap. */}
              {/* <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#035a70] text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">
                  3
                </span>
              </div> */}

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-800 leading-tight">
                      {profile.role === "Super Admin"
                        ? profile.username
                        : profile.name}
                    </div>
                    <div className="text-[10px] text-gray-500">{profile.role}</div>
                  </div>
                  {profile.photo_profile ? (
                    <div className="w-9 h-9 rounded-full border-2 border-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={getPhotoProfileUrl(profile.photo_profile) || ''}
                        alt="Photo Profile"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#035a70] flex items-center justify-center text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-semibold">
                        {profile.role === "Super Admin"
                          ? profile.username
                          : profile.name}
                      </p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/hubungi-kami?category=bug"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Laporan Bug
                    </Link>
                    <Link
                      href="/hubungi-kami?category=general"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Hubungi CS
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#f0f4f8]">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 px-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 Prakerin ID. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
}