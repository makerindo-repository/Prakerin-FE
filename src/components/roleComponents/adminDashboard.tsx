'use client';

import {
  Users,
  GraduationCap,
  Building,
  Activity,
  Crown,
  UserPlus,
  TrendingUp,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import PieChartCompenent from "../Charts/PieChartCompenent";
import BarChartCompenent from "../Charts/BarChartCompenent";
import { useEffect, useState } from "react";
import Loader from "../loader";
import { API, ENDPOINTS } from "@/utils/config";
import cookies from "js-cookie";
import KPICard from "../dashboard/KPICard";
import InsightCard from "../dashboard/InsightCard";
import SectionHeader from "../dashboard/SectionHeader";

// Interfaces (sesuai struktur data API)
interface Summary {
  total_users: number;
  total_schools: number;
  total_companies: number;
  total_students: number;
  total_college_students: number;
  total_job_openings: number;
  total_achievements: number;
  active_internships: number;
  total_feedback: number;
  total_users_with_pro_account: number;
  total_companies_with_pro_account: number;
  total_schools_with_pro_account: number;
  total_users_without_pro_account: number;
}

interface SystemMetrics {
  new_registrations: number;
  active_users: number;
  total_placements: number;
  success_rate: number;
}

interface RegionalData {
  province: string;
  student_count: number;
  company_count: number;
}

interface DashboardData {
  summary: Summary;
  system_metrics: SystemMetrics;
  regional_data: RegionalData[];
}

export default function AdminDashboard({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // State
  const [summary, setSummary] = useState<Summary | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`${ENDPOINTS.ADMIN}/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies.get("userToken") || ""}`,
          },
        });

        const data: DashboardData = response.data;
        setSummary(data.summary);
        setSystemMetrics(data.system_metrics);
        setRegionalData(data.regional_data);
        setError(null);
      } catch (err: any) {
        console.error("Gagal ambil data dashboard:", err);
        setError("Gagal memuat data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [setIsLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => location.reload()}
          className="mt-3 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  if (!summary || !systemMetrics) return null;

  const totalStudents = (summary.total_students ?? 0) + (summary.total_college_students ?? 0);

  return (
    <div className="flex flex-col gap-6">
      {/* === KPI Cards === */}
      <section>
        <SectionHeader
          title="Ringkasan Platform"
          subtitle="Statistik keseluruhan pengguna dan aktivitas"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Pengguna"
            value={summary.total_users}
            icon={<Users className="w-5 h-5" />}
            iconBg="bg-teal-100"
            iconColor="text-teal-600"
            description="Semua pengguna terdaftar"
          />
          <KPICard
            title="Sekolah & Universitas"
            value={summary.total_schools}
            icon={<GraduationCap className="w-5 h-5" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            description="Institusi pendidikan mitra"
          />
          <KPICard
            title="Perusahaan Terdaftar"
            value={summary.total_companies}
            icon={<Building className="w-5 h-5" />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            description="Perusahaan partner aktif"
          />
          <KPICard
            title="Magang Aktif"
            value={summary.active_internships}
            icon={<Activity className="w-5 h-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            description="Saat ini sedang berjalan"
          />
          <KPICard
            title="User Premium"
            value={summary.total_users_with_pro_account}
            icon={<Crown className="w-5 h-5" />}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            description="Akun berbayar aktif"
          />
        </div>
      </section>

      {/* === Insight Cards === */}
      <section>
        <SectionHeader
          title="Insights Sistem"
          subtitle="Metrik performa dan aktivitas platform terkini"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightCard
            icon={<UserPlus className="w-5 h-5" />}
            title="Registrasi Baru (30 Hari)"
            metric={systemMetrics.new_registrations}
            description="Pengguna baru yang mendaftar dalam 30 hari terakhir"
            status="neutral"
          />
          <InsightCard
            icon={<Users className="w-5 h-5" />}
            title="Pengguna Aktif"
            metric={systemMetrics.active_users}
            description="Pengguna yang login dalam periode aktif"
            status="positive"
          />
          <InsightCard
            icon={<Briefcase className="w-5 h-5" />}
            title="Total Penempatan"
            metric={systemMetrics.total_placements}
            description="Penempatan magang yang berhasil dilakukan"
            status="positive"
          />
          <InsightCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Tingkat Keberhasilan"
            metric={systemMetrics.success_rate}
            metricUnit="%"
            description="Persentase penempatan yang berhasil"
            status={systemMetrics.success_rate >= 70 ? "positive" : "warning"}
          />
        </div>
      </section>

      {/* === Charts Section === */}
      <section>
        <SectionHeader
          title="Distribusi & Analitik"
          subtitle="Visualisasi data pengguna dan wilayah"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Distribusi Pengguna</h4>
            <PieChartCompenent
              legend=""
              tooltip="Total per Tipe Pengguna"
              hideCardStyle={true}
              dataList={[
                { name: "Siswa", value: summary.total_students ?? 0, color: "#4f46e5" },
                { name: "Mahasiswa", value: summary.total_college_students ?? 0, color: "#06b6d4" },
                { name: "Perusahaan", value: summary.total_companies ?? 0, color: "#22c55e" },
                { name: "Sekolah/Univ", value: summary.total_schools ?? 0, color: "#eab308" },
              ]}
            />
          </div>

          {/* Regional Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Distribusi Regional — Siswa</h4>
            <BarChartCompenent
              legend=""
              hideCardStyle={true}
              dataList={regionalData.map((d) => ({
                name: d.province,
                value: d.student_count,
              }))}
            />
          </div>

          {/* Premium Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Distribusi User Premium</h4>
            <PieChartCompenent
              legend=""
              tooltip="Total per Tipe Pengguna"
              hideCardStyle={true}
              dataList={[
                { name: "Non Pro", value: summary.total_users_without_pro_account ?? 0, color: "#e2e600ff" },
                { name: "Perusahaan", value: summary.total_companies_with_pro_account ?? 0, color: "#4f46e5" },
                { name: "Sekolah", value: summary.total_schools_with_pro_account ?? 0, color: "#22c55e" },
              ]}
            />
          </div>

          {/* Platform Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Aktivitas Platform</h4>
            <p className="text-xs text-gray-500 mb-4">Statistik lowongan dan penempatan</p>
            <div className="grid grid-cols-1 gap-3">
              <ActivityBox
                title="Lowongan Aktif"
                value={summary.total_job_openings ?? 0}
                desc={
                  (summary.total_companies ?? 0) > 0
                    ? `${((summary.total_job_openings ?? 0) / summary.total_companies).toFixed(2)} rata-rata per perusahaan`
                    : "Belum ada data perusahaan"
                }
                color="bg-teal-50"
                textColor="text-teal-700"
              />
              <ActivityBox
                title="Total Penghargaan"
                value={summary.total_achievements ?? 0}
                desc="Diberikan kepada siswa & perusahaan"
                color="bg-purple-50"
                textColor="text-purple-700"
              />
              <ActivityBox
                title="Ulasan Platform"
                value={summary.total_feedback ?? 0}
                desc="Dari pengguna aktif"
                color="bg-blue-50"
                textColor="text-blue-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* === Summary Stats Bar === */}
      <section>
        <div className="bg-gradient-to-r from-accent to-accent-light rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">Ringkasan Siswa & Mahasiswa</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-2xl font-extrabold">{(summary.total_students ?? 0).toLocaleString("id-ID")}</p>
              <p className="text-sm text-white/80 mt-1">Total Siswa (SMK)</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-2xl font-extrabold">{(summary.total_college_students ?? 0).toLocaleString("id-ID")}</p>
              <p className="text-sm text-white/80 mt-1">Total Mahasiswa</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 col-span-2 sm:col-span-1">
              <p className="text-2xl font-extrabold">{totalStudents.toLocaleString("id-ID")}</p>
              <p className="text-sm text-white/80 mt-1">Total Pelajar</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// === Sub-components ===
function ActivityBox({
  title,
  value,
  desc,
  color = "bg-gray-50",
  textColor = "text-accent-dark",
}: {
  title: string;
  value: number;
  desc: string;
  color?: string;
  textColor?: string;
}) {
  return (
    <div className={`${color} rounded-xl p-4 flex items-center justify-between gap-4`}>
      <div>
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <p className={`text-2xl font-extrabold ${textColor} flex-shrink-0`}>
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
