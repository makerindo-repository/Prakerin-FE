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
  CheckSquare,
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
  Database,
  Building2,
  Factory,
  IdCard,
  CalendarClock,
  GraduationCap,
  BriefcaseBusiness,
  Map,
  ClipboardCheck,
  Stamp,
  Medal,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { alertConfirm } from "@/libs/alert";

// Interface MenuItem tidak perlu diubah
interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  href?: string;
  children?: MenuItem[]; // Untuk dropdown
}

interface Profile {
  photo_profile?: string | null;
  name: string;
  email: string;
  // role:
  //   | "Siswa/Mahasiswa"
  //   | "Perusahaan"
  //   | "Sekolah/Universitas"
  //   | "Super Admin"
  //   | "";
  role: Role;
  rawRole?: string; // tambahkan untuk menyimpan nilai role mentah dari API
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

// A constant map of menus per role to avoid recreating arrays every render
const MENU_MAP: Record<string, MenuItem[]> = { //every part that commented is do so because page is still in built, uncomment to access
  student: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Lowongan", href: "/dashboard/lowongan" },
    { icon: FileText, label: "Curriculum Vitae", href: "/dashboard/cv" },
    { icon: Building, label: "Perusahaan", href: "/dashboard/perusahaan" },
    {
      icon: ClipboardCheck,
      label: "Daftar Tugas",
      href: "/dashboard/tasklist",
    },
    { icon: MessageSquare, label: "Ulasan", href: "/dashboard/feedback" },
    { icon: Medal, label: "Sertifikat", href: "/dashboard/sertifikat" },
    // { icon: Medal, label: "Pembimbing", href: "/dashboard/pembimbing" },
    { icon: User, label: "Profil", href: "/dashboard/profile" },
  ],
  company: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      icon: UsersRound,
      label: "Siswa/Mahasiswa Magang",
      href: "/dashboard/siswa-magang",
    },
    { icon: HelpCircle, label: "Tes", href: "/dashboard/tes" },
    { icon: Briefcase, label: "Lowongan", href: "/dashboard/lowongan" },
    { icon: FileText, label: "Lamaran", href: "/dashboard/industry/lamaran" },
    {
      icon: ClipboardCheck,
      label: "Daftar Tugas",
      href: "/dashboard/tasklist",
    },
    {
      icon: BookOpen,
      label: "Sekolah/Universitas",
      href: "/dashboard/sekolah",
    },
    { icon: Handshake, label: "Kerja Sama", href: "/dashboard/mou" },
    // { icon: Award, label: "Penghargaan", href: "/dashboard/penghargaan" },
    { icon: MessageSquareText, label: "Ulasan", href: "/dashboard/feedback" },
    { icon: Medal, label: "Sertifikat", href: "/dashboard/sertifikat" },
    // {
    //   icon: Medal,
    //   label: "Pembimbing Perusahaan",
    //   href: "/dashboard/pembimbing-perusahaan",
    // },
    { icon: User, label: "Profil", href: "/dashboard/profile" },
  ],
  school: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      icon: UsersRound,
      label: "Daftar Siswa/Mahasiswa",
      href: "/dashboard/school/daftarsiswa",
    },
    { icon: MapPin, label: "Penempatan", href: "/dashboard/school/penempatan" },
    { icon: Building, label: "Perusahaan", href: "/dashboard/perusahaan" },
    { icon: Handshake, label: "Kerja Sama", href: "/dashboard/mou" },
    // { icon: Award, label: "Penghargaan", href: "/dashboard/penghargaan" },
    { icon: MessageSquareText, label: "Ulasan", href: "/dashboard/feedback" },
    // {
    //   icon: Medal,
    //   label: "Guru Pembimbing",
    //   href: "/dashboard/guru-pembimbing",
    // },
    { icon: User, label: "Profil", href: "/dashboard/profile" },
  ],
  super_admin: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      icon: Database,
      label: "Master Data",
      children: [
        {
          icon: Map,
          label: "Provinsi",
          href: "/dashboard/master-data/provinsi",
        },
        {
          icon: Building2,
          label: "Kota/Kabupaten",
          href: "/dashboard/master-data/kota-kabupaten",
        },
        {
          icon: Factory,
          label: "Sektor Perusahaan",
          href: "/dashboard/master-data/sektor",
        },
        // {
        //   icon: IdCard,
        //   label: "Posisi Magang(Deprecated)",
        //   href: "/dashboard/master-data/posisi",
        // },
        {
          icon: CalendarClock,
          label: "Durasi Magang",
          href: "/dashboard/master-data/durasi",
        },
        {
          icon: GraduationCap,
          label: "Jurusan Siswa",
          href: "/dashboard/master-data/jurusan",
        },
        {
          icon: BriefcaseBusiness,
          label: "Bidang Magang",
          href: "/dashboard/master-data/bidang",
        },
        {
          icon: UsersRound,
          label: "User",
          href: "/dashboard/master-data/users",
        },
      ],
    },
    {
      icon: LayoutDashboard,
      label: "Isi Halaman",
      href: "/dashboard/isi-halaman",
    },
    { icon: Building, label: "Perusahaan", href: "/dashboard/perusahaan" },
    {
      icon: BookOpen,
      label: "Sekolah/Universitas",
      href: "/dashboard/sekolah",
    },
    //{ icon: Award, label: "Penghargaan", href: "/dashboard/penghargaan" }, //due to it still in construction, I commented it
    { icon: User, label: "Profil", href: "/dashboard/profile" },
  ],
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<Profile>({
    username: "",
    name: "",
    email: "",
    role: "",
  });
  const pathName = usePathname();
  const router = useRouter();

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // --- AKHIR DARI LOGIKA DROPDOWN ---

  const handleLogout = async () => {
    const isConfirm = await alertConfirm("Anda yakin ingin logout?");
    if (!isConfirm) return;

    Cookies.remove("userToken");
    Cookies.remove("authorization");
    //router.replace("/");
    window.location.href = "/"; //replaced the supposed replace to hard location change for auto reload
  };
  // Menu definitions moved outside component for readability and to avoid
  // recreating large arrays on every render. We'll compute the menu for the
  // current role using useMemo below.

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await createApiCall({
        url: `${ENDPOINTS.USERS}/profile`,
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }, signal);
      
      if (response.status === 200) {
        const data = response.data.data;
        console.log(data);
        
        // Optimize role mapping
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
        
        // Extract photo_profile from the correct nested location based on role
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
        
        setProfile({ ...data, photo_profile: photoProfile, role: roleLabel, rawRole: data.role });
        setMenuItems(MENU_MAP[data.role] ?? []);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching profile:", error);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => controller.abort();
  }, [fetchProfile]);

  // Only compute and render time/date after client mount to avoid
  // server/client locale and timing mismatch which causes hydration errors.
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // run only on client
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time
    ? time.toLocaleTimeString("id-ID", { hour12: false })
    : "--:--:--";
  const dateString = time
    ? time.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const handleBack = () => {
    //router.push("/");
    window.location.href = "/" //same same here
    console.log("Force returned");
  };

  const toggleDropdown = useCallback(() => setDropdownOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  // compute menuItems on client only to avoid reading cookies during SSR which
  // leads to hydration mismatches. Start with empty array on first render.
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);

  // routes that require active status (same as middleware)
  const REQUIRES_ACTIVE_PREFIXES = [
    "/dashboard/lowongan",
    "/dashboard/cv",
    "/dashboard/tasklist",
    "/dashboard/feedback",
    "/dashboard/sertifikat",
  ];

  useEffect(() => {
    const authorization =
      typeof window !== "undefined" ? Cookies.get("authorization") ?? "" : "";
    setMenuItems(MENU_MAP[authorization] ?? []);
    // read active cookie client-side and normalize truthy values
    if (typeof window !== "undefined") {
      const v = Cookies.get("active") ?? "";
      const active = !!v && ["true", "1", "yes", "on"].includes(v.toLowerCase());
      setIsActive(active);
    }
  }, []);

  // compute visible menu items: hide protected items when not active
  const visibleMenuItems = useMemo(() => {
    if (isActive) return menuItems;
    const isProtectedHref = (href?: string) => {
      if (!href) return false;
      return REQUIRES_ACTIVE_PREFIXES.some((p) => href === p || href.startsWith(p + "/") || href.startsWith(p));
    };

    return menuItems
      .map((item) => {
        if (item.children) {
          const filteredChildren = item.children.filter((child) => !isProtectedHref(child.href));
          // if no children left, drop parent unless parent itself has href and is allowed
          if (filteredChildren.length === 0 && isProtectedHref(item.href)) return null;
          return { ...item, children: filteredChildren } as MenuItem;
        }
        return isProtectedHref(item.href) ? null : item;
      })
      .filter(Boolean) as MenuItem[];
  }, [menuItems, isActive]);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Sidebar tidak berubah */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        {/* ... Konten sidebar Anda tetap sama ... */}
        <div className="flex items-center justify-between h-16 px-6">
          <Link href={"/"} className="flex items-center space-x-2">
            <img
              src="/PrakerinID_ico.svg"
              alt="Prakerin.ID Logo"
              className="lg:w-50"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-8 h-full overflow-y-auto pb-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex bg-accent-light/15 mx-6 p-3 rounded-xl text-accent-dark justify-center space-x-2 ">
            <Clock className="w-7 my-auto h-7 " />
            <div className="">
              <h3 className="font-md">{timeString}</h3>
              <h3 className="text-xs">{dateString}</h3>
            </div>
          </div>
          {!isActive ? (
            <div className="px-5">
            <span className="text-red-500 text-xs">*Akun Kamu belum Aktif silahkan konfirmasi ke admin untuk mengaktifkan akun</span>
            </div>
          ):null}
          {visibleMenuItems.map((item) => (
            <div key={item.href ?? item.label}>
              {item.children ? (
                <SidebarDropdownMenu
                  item={item}
                  pathName={pathName} 
                  setSidebarOpen={closeSidebar}
                />
              ) : (
                <Link
                  href={item.href!}
                  onClick={closeSidebar}
                  className={`flex rounded-xl items-center mx-6 p-3 my-3 text-gray-700 transition-colors ${
                    (
                      item.href === "/dashboard"
                        ? pathName === item.href
                        : pathName === item.href ||
                          pathName.startsWith(item.href + "/")
                    )
                      ? // match exact + anak
                        "bg-accent !text-white shadow-lg font-bold"
                      : "hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* --- MODIFIKASI BAGIAN HEADER DI SINI --- */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-accent text-white shadow-sm ">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <div className="text-right hidden sm:block">
                    <span className="text-sm font-bold block">
                      {profile.role === "Super Admin"
                        ? profile.username
                        : profile.name}
                    </span>
                    <span className="text-xs text-gray-200 block">
                      {profile.role}
                    </span>
                  </div>
                  {profile.photo_profile ? (
                    <div className="w-10 h-10 rounded-full border-white border overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${profile.photo_profile}`}
                        alt="Photo Profile"
                        className="object-cover rounded-full w-full h-full"
                      />
                    </div>
                  ) : (
                    <UserCircle className="w-10 h-10 text-white" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold">
                        {profile.role === "Super Admin"
                          ? profile.username
                          : profile.name}
                      </p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/lapor-bug" // Ganti dengan link yang sesuai
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Laporan Bug
                    </Link>
                    <Link
                      href="/hubungi-cs" // Ganti dengan link yang sesuai
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Hubungi CS
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleBack} // Buat fungsi logout jika perlu
                      className="flex items-center w-full px-4 py-2 text-sm text-accent hover:bg-gray-100"
                    >
                      <CircleArrowLeft className="w-4 h-4 mr-2" />
                      Kembali
                    </button>
                    <button
                      onClick={handleLogout} // Buat fungsi logout jika perlu
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
        {/* --- AKHIR DARI MODIFIKASI HEADER --- */}

        <main className="pt-20 px-6 pb-6 flex-grow">{children}</main>

        <footer className="bg-white py-4 px-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 Prakerin ID. All rights reserved.
          </p>
        </footer>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

const SidebarDropdownMenu = React.memo(function SidebarDropdownMenu({
  item,
  pathName,
  setSidebarOpen,
}: {
  item: MenuItem;
  pathName: string;
  // simple callback to close sidebar (no args)
  setSidebarOpen: () => void;
}) {
  const [open, setOpen] = useState(false);

  // Cek apakah salah satu child aktif
  const isActive = useMemo(
    () =>
      !!item.children?.some(
        (child) =>
          pathName === child.href ||
          (child.href && pathName.startsWith(child.href + "/"))
      ),
    [item.children, pathName]
  );

  return (
    <div className="mx-6 my-3">
      <button
        className={`flex w-full rounded-xl items-center p-3 text-gray-700 transition-colors ${
          isActive
            ? "bg-accent !text-white shadow-lg font-bold"
            : "hover:bg-accent/10 hover:text-accent"
        }`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <item.icon className="w-5 h-5 mr-3" />
        <span className="flex-1 text-left">{item.label}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${
            open ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      {open && (
        <div className="ml-6 mt-2 space-y-1">
          {item.children?.map((child) => (
            <Link
              key={child.href ?? child.label}
              href={child.href!}
              onClick={setSidebarOpen}
              className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                pathName === child.href ||
                (child.href && pathName.startsWith(child.href + "/"))
                  ? "bg-accent text-white font-bold"
                  : "hover:bg-accent/10 hover:text-accent text-gray-700"
              }`}
            >
              <child.icon className="w-4 h-4 mr-2" />
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});
