"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "@/utils/config";
import {
  Sparkles,
  Users,
  GraduationCap,
  Building2,
  School,
  Landmark,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Monitor,
  Code2,
  Network,
  Image as ImageIcon,
  UserPlus,
  MapPin,
  RefreshCw,
  UserCircle,
  UserX,
  ChevronRight,
  ChevronLeft,
  Info,
  Cpu,
  LineChart,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ══════════════════════════════════════════════════════════════════════════
// Color utility map for dynamic colored badges/icons
// ══════════════════════════════════════════════════════════════════════════

const COLOR_MAP: Record<string, { bg: string; text: string; badgeBg: string; badgeText: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   badgeBg: "bg-blue-50",   badgeText: "text-blue-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-500", badgeBg: "bg-orange-50", badgeText: "text-orange-600" },
  green:  { bg: "bg-green-50",  text: "text-green-600",  badgeBg: "bg-green-50",  badgeText: "text-green-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", badgeBg: "bg-purple-50", badgeText: "text-purple-600" },
  red:    { bg: "bg-red-50",    text: "text-red-500",    badgeBg: "bg-red-50",    badgeText: "text-red-600" },
};

// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════


interface DashboardSummary {
  total_users: number;
  total_schools: number;
  total_perguruan_tinggi: number;
  total_companies: number;
  total_students: number;        // siswa SMK only
  total_mahasiswa: number;       // university students only
  total_all_students: number;
  total_job_openings: number;
  total_achievements: number;
  active_internships: number;
  total_feedback: number;
}

interface SystemMetrics {
  new_registrations: number;
  active_users: number;
  total_placements: number;
  success_rate: number;
}

interface Insight {
  key: string;
  value: string;
  unit: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
}

interface Recommendation {
  key: string;
  icon: string;
  color: string;
  title: string;
  desc: string;
  priority: string;
  priorityColor: string;
}

interface RecentActivity {
  action: string;
  resource_type: string;
  resource_name: string | null;
  description: string | null;
  user_name: string;
  time_ago: string;
}

interface PlacementStatus {
  label: string;
  value: number;
  percent: number;
  color: string;
}

interface PreInternshipSummary {
  total: number;
  ongoing: number;
  needs_review: number;
}

interface MatchingScoreItem {
  label: string;
  full_name: string;
  value: number;
  color: string;
  icon: string | React.ElementType;
}

interface DashboardResponse {
  summary: DashboardSummary;
  system_metrics: SystemMetrics;
  regional_data: { province: string; company_count: number; student_count: number }[];
  placement_status: PlacementStatus[];
  insights: Insight[];
  recommendations: Recommendation[];
  recent_activities: RecentActivity[];
  pre_internship_summary: PreInternshipSummary;
  matching_scores?: {
    smk: MatchingScoreItem[];
    mahasiswa: MatchingScoreItem[];
  };
}

// ══════════════════════════════════════════════════════════════════════════
// COMPONENT — dipanggil dari dashboard/page.tsx sebagai <AdminDashboard />
// khusus role super_admin
// ══════════════════════════════════════════════════════════════════════════

interface AdminDashboardProps {
  isLoading?: boolean;
  setIsLoading?: (value: boolean) => void;
}

// Icon lookup for recommendation icons sent as strings from the API
const ICON_MAP: Record<string, React.ElementType> = {
  UserX,
  Building2,
  UserCircle,
  Users,
  GraduationCap,
  MapPin,
  UserPlus,
  RefreshCw,
};

const MAJOR_ICON_MAP: Record<string, React.ElementType> = {
  Monitor,
  Code2,
  Network,
  ImageIcon,
  Cpu,
  LineChart,
  Zap,
  Users,
};

// Maps each recommendation key → the dashboard page it should navigate to
const RECOMMENDATION_LINKS: Record<string, string> = {
  no_mentor:           "/dashboard/siswa-magang",
  zero_applicants:     "/dashboard/lowongan",
  low_progress_classes:"/dashboard/pre-internship-classes",
  unverified_schools:  "/dashboard/sekolah",
};

export default function AdminDashboard({ setIsLoading }: AdminDashboardProps) {
  const [matchMode, setMatchMode] = useState<"smk" | "mahasiswa">("smk");
  const [matchingScores, setMatchingScores] = useState<{
    smk: MatchingScoreItem[];
    mahasiswa: MatchingScoreItem[];
  } | null>(null);

  const matchingData = matchingScores
    ? (matchMode === "smk" ? matchingScores.smk : matchingScores.mahasiswa)
    : [];

  // AI Matching Score cuma nampilin 4 baris per halaman, sisanya di-geser
  // pakai panah/dot kalau datanya lebih dari 4.
  const MATCH_PAGE_SIZE = 4;
  const [matchPage, setMatchPage] = useState(0);
  const matchTotalPages = Math.max(1, Math.ceil(matchingData.length / MATCH_PAGE_SIZE));
  const visibleMatchingData = matchingData.slice(
    matchPage * MATCH_PAGE_SIZE,
    matchPage * MATCH_PAGE_SIZE + MATCH_PAGE_SIZE
  );

  useEffect(() => {
    setMatchPage(0);
  }, [matchMode, matchingScores]);

  const [isFetching, setIsFetching] = useState<boolean>(true);

  // Summary stat card state
  const [totalSiswa,           setTotalSiswa]           = useState<number>(0);
  const [totalMahasiswa,       setTotalMahasiswa]       = useState<number>(0);
  const [totalIndustri,        setTotalIndustri]        = useState<number>(0);
  const [totalSekolah,         setTotalSekolah]         = useState<number>(0);
  const [totalPerguruanTinggi, setTotalPerguruanTinggi] = useState<number>(0);
  const [penempatanAktif,      setPenempatanAktif]      = useState<number>(0);
  const [successRate,          setSuccessRate]          = useState<number>(0);

  // Live sections state
  const [insights,            setInsights]            = useState<Insight[]>([]);
  const [recommendations,     setRecommendations]     = useState<Recommendation[]>([]);
  const [recentActivities,    setRecentActivities]    = useState<RecentActivity[]>([]);
  const [placementStatus,     setPlacementStatus]     = useState<PlacementStatus[]>([]);
  const [regionalData,        setRegionalData]        = useState<{ province: string; company_count: number; student_count: number }[]>([]);
  const [preInternship,       setPreInternship]       = useState<PreInternshipSummary>({ total: 0, ongoing: 0, needs_review: 0 });

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboard = async () => {
      setIsFetching(true);
      try {
        const response = await API.get<DashboardResponse>(ENDPOINTS.DASHBOARD, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          signal: controller.signal,
        });

        const { summary, system_metrics, insights: ins, recommendations: rec, recent_activities, placement_status, regional_data, pre_internship_summary, matching_scores } = response.data;

        setTotalSiswa(summary.total_students);
        setTotalMahasiswa(summary.total_mahasiswa);
        setTotalIndustri(summary.total_companies);
        setTotalSekolah(summary.total_schools);
        setTotalPerguruanTinggi(summary.total_perguruan_tinggi);
        setPenempatanAktif(summary.active_internships);
        setSuccessRate(system_metrics.success_rate);
        setInsights(ins ?? []);
        setRecommendations(rec ?? []);
        setRecentActivities(recent_activities ?? []);
        setPlacementStatus(placement_status ?? []);
        setRegionalData(regional_data ?? []);
        setPreInternship(pre_internship_summary ?? { total: 0, ongoing: 0, needs_review: 0 });
        setMatchingScores(matching_scores ?? null);
      } catch (error: any) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error("Gagal memuat data dashboard:", error);
        }
      } finally {
        setIsFetching(false);
        setIsLoading?.(false);
      }
    };

    fetchDashboard();
    return () => controller.abort();
  }, [setIsLoading]);


  const STAT_CARDS = [
    {
      icon: Users,
      label: "Total Siswa",
      value: totalSiswa,
      sub: "Siswa SMK terdaftar",
      badge: "Aktif",
      badgeIcon: TrendingUp,
      color: "blue",
    },
    {
      icon: GraduationCap,
      label: "Total Mahasiswa",
      value: totalMahasiswa,
      sub: "Mahasiswa perguruan tinggi",
      badge: "Aktif",
      badgeIcon: CheckCircle2,
      color: "orange",
    },
    {
      icon: Building2,
      label: "Total Industri",
      value: totalIndustri,
      sub: "Perusahaan terdaftar",
      badge: "Terdaftar",
      badgeIcon: TrendingUp,
      color: "green",
    },
    {
      icon: School,
      label: "Total Sekolah",
      value: totalSekolah,
      sub: "SMK terdaftar",
      badge: "Data stabil",
      badgeIcon: BarChart3,
      color: "blue",
    },
    {
      icon: Landmark,
      label: "Total Perguruan Tinggi",
      value: totalPerguruanTinggi,
      sub: "Kampus terdaftar",
      badge: "Terdaftar",
      badgeIcon: ShieldCheck,
      color: "purple",
    },
  ];

  const donutRaw = [
    { label: "Siswa",          value: totalSiswa,           color: "#3b82f6" },
    { label: "Mahasiswa",      value: totalMahasiswa,       color: "#f97316" },
    { label: "Industri",       value: totalIndustri,        color: "#22c55e" },
    { label: "Sekolah",        value: totalSekolah,         color: "#a855f7" },
    { label: "Perguruan Tinggi", value: totalPerguruanTinggi, color: "#eab308" },
  ];
  const donutTotal = donutRaw.reduce((sum, item) => sum + item.value, 0);
  const USER_DISTRIBUTION = donutRaw.map((item) => ({
    ...item,
    percent: donutTotal > 0 ? Math.round((item.value / donutTotal) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          Dashboard AI Prakerin <Sparkles className="w-5 h-5 text-accent" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Analitik penempatan, prediksi risiko, dan rekomendasi magang berbasis AI
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map((card) => {
          const c = COLOR_MAP[card.color];
          const BadgeIcon = card.badgeIcon;
          return (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.bg}`}>
                  <card.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <span className="text-xs text-gray-500 font-medium">{card.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isFetching ? "…" : card.value}
              </div>
              <div className="text-[11px] text-gray-500 mb-3">{card.sub}</div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${c.badgeBg} ${c.badgeText}`}
              >
                <BadgeIcon className="w-3 h-3" />
                {card.badge}
              </span>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-50">
              <Briefcase className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Penempatan Aktif</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isFetching ? "…" : penempatanAktif}
          </div>
          <div className="text-[11px] text-gray-500 mb-2">
            {successRate}% estimasi keberhasilan
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-5">
            <Sparkles className="w-4 h-4 text-accent" />
            AI Insight Hari Ini
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {insights.map((item) => {
              const c = COLOR_MAP[item.color] ?? COLOR_MAP["blue"];
              return (
                <div key={item.key} className="border border-gray-100 rounded-xl p-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${c.bg} mb-3`}>
                    <AlertTriangle className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <p className="text-xs text-gray-500">{item.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{item.subtitle}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {isFetching ? "…" : item.value}{" "}
                      <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${c.badgeBg} ${c.badgeText}`}>
                      {item.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 text-xs rounded-lg px-4 py-3">
            <Info className="w-4 h-4 shrink-0" />
            <span className="flex-1">
              Kelas Pra-Magang aktif: <b>{isFetching ? "…" : preInternship.ongoing} kelas</b> &nbsp;&nbsp;{" "}
              {isFetching ? "…" : preInternship.needs_review} kelas pra-magang perlu evaluasi
            </span>
            <Link
              href="/dashboard/pre-internship-classes/manage"
              className="flex items-center gap-1 font-semibold shrink-0 hover:underline"
            >
              Lihat detail <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Sparkles className="w-4 h-4 text-accent" />
              AI Matching Score
            </h2>
          </div>
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setMatchMode("smk")}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                matchMode === "smk" ? "bg-accent text-white" : "border border-gray-200 text-gray-500"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Siswa SMK
            </button>
            <button
              onClick={() => setMatchMode("mahasiswa")}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                matchMode === "mahasiswa" ? "bg-accent text-white" : "border border-gray-200 text-gray-500"
              }`}
            >
              Mahasiswa
            </button>
          </div>

          <div className="space-y-4 mb-5">
            {isFetching ? (
              <p className="text-xs text-gray-400 text-center py-4">Memuat data…</p>
            ) : visibleMatchingData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada data jurusan tersedia.</p>
            ) : (
              visibleMatchingData.map((item) => {
                const c = COLOR_MAP[item.color];
                const IconComponent = typeof item.icon === "string"
                  ? (MAJOR_ICON_MAP[item.icon] || Monitor)
                  : item.icon;
                return (
                  <div key={item.full_name || item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${c.bg}`}>
                          <IconComponent className={`w-3.5 h-3.5 ${c.text}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 truncate" title={item.full_name || item.label}>
                          {item.full_name || item.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0 ml-2">{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {matchTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mb-5">
              <button
                onClick={() => setMatchPage((p) => (p - 1 + matchTotalPages) % matchTotalPages)}
                className="p-1 rounded-full border border-gray-200 text-gray-500 hover:text-accent hover:border-accent transition-colors cursor-pointer"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: matchTotalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMatchPage(idx)}
                    aria-label={`Halaman ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === matchPage ? "w-5 bg-accent" : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setMatchPage((p) => (p + 1) % matchTotalPages)}
                className="p-1 rounded-full border border-gray-200 text-gray-500 hover:text-accent hover:border-accent transition-colors cursor-pointer"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <p className="text-[11px] text-gray-400 mb-3">
            Mode Siswa SMK: skor berdasarkan jurusan dan kebutuhan industri.
          </p>
          <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500">
              Mode Mahasiswa menampilkan prodi seperti Informatika, Sistem Informasi, Teknik Elektro, Manajemen.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Distribusi Pengguna</h2>
                <Link href="/dashboard/master-data/users" className="flex items-center gap-1 text-xs text-accent font-medium hover:underline">
                  Lihat detail <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={USER_DISTRIBUTION}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                      >
                        {USER_DISTRIBUTION.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {USER_DISTRIBUTION.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-gray-500">
                        {item.percent}% <span className="text-gray-400">({item.value})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Distribusi Regional</h2>
                <Link href="/dashboard/master-data/provinsi" className="flex items-center gap-1 text-xs text-accent font-medium hover:underline">
                  Lihat detail <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={regionalData.map(r => ({ region: r.province, value: r.student_count }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="region"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      label={{ value: "Jumlah Siswa", angle: -90, position: "insideLeft", fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#035a70" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Aktivitas Terbaru</h2>
                <Link href="/dashboard/log-aktivitas" className="flex items-center gap-1 text-xs text-accent font-medium hover:underline">
                  Lihat semua <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities.length === 0 && !isFetching ? (
                  <p className="text-xs text-gray-400 text-center py-4">Belum ada aktivitas tercatat.</p>
                ) : (
                  recentActivities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-blue-50">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">
                          {item.action} — {item.resource_type}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.description ?? item.resource_name ?? `oleh ${item.user_name}`}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{item.time_ago}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Status Penempatan</h2>
                <Link href="/dashboard/school/penempatan" className="flex items-center gap-1 text-xs text-accent font-medium hover:underline">
                  Lihat detail <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={placementStatus}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={38}
                        outerRadius={60}
                        paddingAngle={2}
                      >
                        {placementStatus.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {placementStatus.reduce((sum, s) => sum + s.value, 0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {placementStatus.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-gray-500">
                        {item.value} <span className="text-gray-400">({item.percent}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Sparkles className="w-4 h-4 text-accent" />
              Rekomendasi AI
            </h2>
            <Link href="/dashboard/ai-analytics" className="text-xs text-accent font-medium hover:underline">Lihat semua</Link>
          </div>
          <div className="space-y-4">
            {recommendations.length === 0 && !isFetching ? (
              <p className="text-xs text-gray-400 text-center py-4">Tidak ada rekomendasi saat ini.</p>
            ) : (
              recommendations.map((item, idx) => {
                const c  = COLOR_MAP[item.color]       ?? COLOR_MAP["blue"];
                const pc = COLOR_MAP[item.priorityColor] ?? COLOR_MAP["blue"];
                const IconComp = ICON_MAP[item.icon] ?? Building2;
                const href = RECOMMENDATION_LINKS[item.key] ?? "#";
                return (
                  <Link
                    key={item.key ?? idx}
                    href={href}
                    className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0 group rounded-lg -mx-2 px-2 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
                      <IconComp className={`w-4 h-4 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 mb-1 group-hover:text-accent transition-colors">{item.title}</p>
                      <p className="text-[11px] text-gray-500 mb-2">{item.desc}</p>
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md ${pc.badgeBg} ${pc.badgeText}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1 group-hover:text-accent transition-colors" />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}