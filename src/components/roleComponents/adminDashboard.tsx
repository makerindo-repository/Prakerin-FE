"use client";

import { useEffect, useState } from "react";
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
// Dummy data — dipakai untuk bagian yang belum ada endpoint-nya
// ══════════════════════════════════════════════════════════════════════════

const COLOR_MAP: Record<string, { bg: string; text: string; badgeBg: string; badgeText: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", badgeBg: "bg-blue-50", badgeText: "text-blue-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-500", badgeBg: "bg-orange-50", badgeText: "text-orange-600" },
  green: { bg: "bg-green-50", text: "text-green-600", badgeBg: "bg-green-50", badgeText: "text-green-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", badgeBg: "bg-purple-50", badgeText: "text-purple-600" },
  red: { bg: "bg-red-50", text: "text-red-500", badgeBg: "bg-red-50", badgeText: "text-red-600" },
};

const DUMMY_TOTAL_MAHASISWA = 217;
const DUMMY_TOTAL_SEKOLAH = 58;
const DUMMY_TOTAL_PERGURUAN_TINGGI = 25;
const DUMMY_TOTAL_SISWA_FALLBACK = 520;
const DUMMY_TOTAL_INDUSTRI_FALLBACK = 204;
const DUMMY_PENEMPATAN_AKTIF_FALLBACK = 320;
const DUMMY_SUCCESS_RATE_FALLBACK = 0;

const AI_INSIGHTS = [
  {
    icon: AlertTriangle,
    value: "18",
    unit: "orang",
    title: "Siswa/Mahasiswa",
    subtitle: "Berisiko Belum Ditempatkan",
    badge: "Sedang",
    color: "orange",
  },
  {
    icon: Building2,
    value: "42",
    unit: "match",
    title: "Rekomendasi",
    subtitle: "Industri Cocok",
    badge: "Prioritas",
    color: "green",
  },
  {
    icon: TrendingUp,
    value: "86%",
    unit: "",
    title: "Estimasi Keberhasilan",
    subtitle: "Penempatan",
    badge: "Optimis",
    color: "blue",
  },
];

const MATCHING_SCORE_SMK = [
  { icon: Monitor, label: "Teknik Komputer", value: 92, color: "blue" },
  { icon: Code2, label: "RPL", value: 88, color: "green" },
  { icon: Network, label: "TKJ", value: 84, color: "purple" },
  { icon: ImageIcon, label: "Multimedia", value: 79, color: "orange" },
];

const MATCHING_SCORE_MAHASISWA = [
  { icon: Cpu, label: "Informatika", value: 90, color: "blue" },
  { icon: LineChart, label: "Sistem Informasi", value: 85, color: "green" },
  { icon: Zap, label: "Teknik Elektro", value: 80, color: "purple" },
  { icon: Users, label: "Manajemen", value: 75, color: "orange" },
];

const REGIONAL_DISTRIBUTION = [
  { region: "Jawa Barat", value: 112 },
  { region: "Sumatera Barat", value: 88 },
  { region: "Banten", value: 56 },
  { region: "Bangka Belitung", value: 32 },
  { region: "Bengkulu", value: 20 },
];

const RECENT_ACTIVITIES = [
  {
    icon: UserPlus,
    color: "green",
    title: "Pendaftaran siswa baru",
    desc: "Siswa dari SMK Negeri 1 Bandung mendaftar",
    time: "5 menit lalu",
  },
  {
    icon: Building2,
    color: "blue",
    title: "Industri baru ditambahkan",
    desc: "PT Teknologi Nusantara telah ditambahkan",
    time: "32 menit lalu",
  },
  {
    icon: MapPin,
    color: "green",
    title: "Penempatan berhasil",
    desc: "Siti Aisyah ditempatkan di PT Maju Bersama",
    time: "1 jam lalu",
  },
  {
    icon: RefreshCw,
    color: "blue",
    title: "Data industri diperbarui",
    desc: "PT Solusi Digital memperbarui informasi",
    time: "2 jam lalu",
  },
  {
    icon: GraduationCap,
    color: "purple",
    title: "Kelas pra-magang diperbarui",
    desc: "3 kelas pra-magang perlu evaluasi",
    time: "3 jam lalu",
  },
];

const PLACEMENT_STATUS = [
  { label: "Menunggu", value: 46, percent: 14, color: "#3b82f6" },
  { label: "Proses", value: 96, percent: 30, color: "#22c55e" },
  { label: "Berlangsung", value: 128, percent: 40, color: "#f97316" },
  { label: "Selesai", value: 46, percent: 14, color: "#a855f7" },
  { label: "Dibatalkan", value: 4, percent: 1, color: "#9ca3af" },
];

const AI_RECOMMENDATIONS = [
  {
    icon: Building2,
    color: "green",
    title: "Sinkronkan data sekolah dan perguruan tinggi",
    desc: "Pastikan data terbaru agar rekomendasi AI lebih akurat.",
    priority: "Prioritas Tinggi",
    priorityColor: "green",
  },
  {
    icon: Users,
    color: "orange",
    title: "Hubungi 5 industri potensial",
    desc: "AI menemukan 5 industri dengan kecocokan tinggi.",
    priority: "Prioritas Sedang",
    priorityColor: "orange",
  },
  {
    icon: UserCircle,
    color: "blue",
    title: "Evaluasi 3 kelas pra-magang",
    desc: "dengan progres rendah.",
    priority: "Prioritas Sedang",
    priorityColor: "orange",
  },
  {
    icon: UserX,
    color: "red",
    title: "Prioritaskan peserta tanpa pembimbing",
    desc: "28 peserta belum memiliki pembimbing. Tindakan cepat disarankan.",
    priority: "Prioritas Rendah",
    priorityColor: "red",
  },
];

// ══════════════════════════════════════════════════════════════════════════

interface DashboardSummary {
  total_users: number;
  total_schools: number;
  total_companies: number;
  total_students: number;
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

interface DashboardResponse {
  summary: DashboardSummary;
  system_metrics: SystemMetrics;
  regional_data: { province: string; company_count: number }[];
}

// ══════════════════════════════════════════════════════════════════════════
// COMPONENT — dipanggil dari dashboard/page.tsx sebagai <AdminDashboard />
// khusus role super_admin
// ══════════════════════════════════════════════════════════════════════════

interface AdminDashboardProps {
  isLoading?: boolean;
  setIsLoading?: (value: boolean) => void;
}

export default function AdminDashboard({ setIsLoading }: AdminDashboardProps) {
  const [matchMode, setMatchMode] = useState<"smk" | "mahasiswa">("smk");
  const matchingData = matchMode === "smk" ? MATCHING_SCORE_SMK : MATCHING_SCORE_MAHASISWA;

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [totalSiswa, setTotalSiswa] = useState<number>(DUMMY_TOTAL_SISWA_FALLBACK);
  const [totalIndustri, setTotalIndustri] = useState<number>(DUMMY_TOTAL_INDUSTRI_FALLBACK);
  const [penempatanAktif, setPenempatanAktif] = useState<number>(DUMMY_PENEMPATAN_AKTIF_FALLBACK);
  const [successRate, setSuccessRate] = useState<number>(DUMMY_SUCCESS_RATE_FALLBACK);

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

        const { summary, system_metrics } = response.data;

        setTotalSiswa(summary.total_students);
        setTotalIndustri(summary.total_companies);
        setPenempatanAktif(summary.active_internships);
        setSuccessRate(system_metrics.success_rate);
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
      sub: "120 registrasi baru bulan ini",
      badge: "Prediksi naik 12%",
      badgeIcon: TrendingUp,
      color: "blue",
    },
    {
      icon: GraduationCap,
      label: "Total Mahasiswa",
      value: DUMMY_TOTAL_MAHASISWA,
      sub: "36 registrasi baru bulan ini",
      badge: "Aktif",
      badgeIcon: CheckCircle2,
      color: "orange",
    },
    {
      icon: Building2,
      label: "Total Industri",
      value: totalIndustri,
      sub: "42 direkomendasikan AI",
      badge: "Match tinggi",
      badgeIcon: TrendingUp,
      color: "green",
    },
    {
      icon: School,
      label: "Total Sekolah",
      value: DUMMY_TOTAL_SEKOLAH,
      sub: "9 aktif mengirim peserta",
      badge: "Data stabil",
      badgeIcon: BarChart3,
      color: "blue",
    },
    {
      icon: Landmark,
      label: "Total Perguruan Tinggi",
      value: DUMMY_TOTAL_PERGURUAN_TINGGI,
      sub: "3 aktif mengirim peserta",
      badge: "Terverifikasi",
      badgeIcon: ShieldCheck,
      color: "purple",
    },
  ];

  const donutRaw = [
    { label: "Siswa", value: totalSiswa, color: "#3b82f6" },
    { label: "Mahasiswa", value: DUMMY_TOTAL_MAHASISWA, color: "#f97316" },
    { label: "Industri", value: totalIndustri, color: "#22c55e" },
    { label: "Sekolah", value: DUMMY_TOTAL_SEKOLAH, color: "#a855f7" },
    { label: "Perguruan Tinggi", value: DUMMY_TOTAL_PERGURUAN_TINGGI, color: "#eab308" },
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
            {AI_INSIGHTS.map((item) => {
              const c = COLOR_MAP[item.color];
              return (
                <div key={item.title} className="border border-gray-100 rounded-xl p-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${c.bg} mb-3`}>
                    <item.icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <p className="text-xs text-gray-500">{item.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{item.subtitle}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {item.value} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
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
              Kelas Pra-Magang aktif: <b>12 kelas</b> &nbsp;&nbsp; 3 kelas pra-magang perlu evaluasi
            </span>
            <button className="flex items-center gap-1 font-semibold shrink-0">
              Lihat detail <ChevronRight className="w-3 h-3" />
            </button>
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
            {matchingData.map((item) => {
              const c = COLOR_MAP[item.color];
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${c.bg}`}>
                        <item.icon className={`w-3.5 h-3.5 ${c.text}`} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{item.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

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
                <button className="flex items-center gap-1 text-xs text-accent font-medium">
                  Lihat detail <ChevronRight className="w-3 h-3" />
                </button>
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
                <button className="flex items-center gap-1 text-xs text-accent font-medium">
                  Lihat detail <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={REGIONAL_DISTRIBUTION}>
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
                <button className="flex items-center gap-1 text-xs text-accent font-medium">
                  Lihat semua <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-4">
                {RECENT_ACTIVITIES.map((item, idx) => {
                  const c = COLOR_MAP[item.color];
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${c.bg}`}>
                        <item.icon className={`w-3.5 h-3.5 ${c.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Status Penempatan</h2>
                <button className="flex items-center gap-1 text-xs text-accent font-medium">
                  Lihat detail <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PLACEMENT_STATUS}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={38}
                        outerRadius={60}
                        paddingAngle={2}
                      >
                        {PLACEMENT_STATUS.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {PLACEMENT_STATUS.reduce((sum, s) => sum + s.value, 0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {PLACEMENT_STATUS.map((item) => (
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
            <button className="text-xs text-accent font-medium">Lihat semua</button>
          </div>
          <div className="space-y-4">
            {AI_RECOMMENDATIONS.map((item, idx) => {
              const c = COLOR_MAP[item.color];
              const pc = COLOR_MAP[item.priorityColor];
              return (
                <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
                    <item.icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 mb-1">{item.title}</p>
                    <p className="text-[11px] text-gray-500 mb-2">{item.desc}</p>
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md ${pc.badgeBg} ${pc.badgeText}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}