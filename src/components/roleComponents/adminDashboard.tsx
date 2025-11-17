'use client';

import {
  Users,
  GraduationCap,
  Building,
  Activity,
  Crown
} from "lucide-react";
import RatingSummaryCompenent from "../RatingSummaryCompenent";
import PieChartCompenent from "../Charts/PieChartCompenent";
import BarChartCompenent from "../Charts/BarChartCompenent";
import { useEffect, useState } from "react";
import Loader from "../loader";
import { API, ENDPOINTS } from "../../../utils/config";
import cookies from "js-cookie";

// Interfaces (sesuai struktur data API)
interface Summary {
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
        console.log(response.data);
        
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
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => location.reload()}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  if (!summary || !systemMetrics) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
      {/* === Top Statistics Cards === */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Pengguna"
          value={summary.total_users}
          icon={<Users className="text-accent w-6 h-6 sm:w-7 sm:h-7" />}
        />
        <StatCard
          title="Sekolah & Universitas"
          value={summary.total_schools}
          icon={<GraduationCap className="text-accent w-6 h-6 sm:w-7 sm:h-7" />}
        />
        <StatCard
          title="Perusahaan Terdaftar"
          value={summary.total_companies}
          icon={<Building className="text-accent w-6 h-6 sm:w-7 sm:h-7" />}
        />
        <StatCard
          title="Magang Aktif"
          value={summary.active_internships}
          icon={<Activity className="text-accent w-6 h-6 sm:w-7 sm:h-7" />}
        />
        <StatCard
          title="User Premium"
          value={summary.active_internships}
          icon={<Crown className="text-accent w-6 h-6 sm:w-7 sm:h-7" />}
        />
      </div>

      {/* === System Metrics === */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
        <h3 className="font-bold text-base sm:text-lg mb-2">Metrik Sistem</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Statistik performa dan aktivitas platform
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricBox label="Registrasi Baru (30 hari)" value={systemMetrics.new_registrations} color="bg-blue-50" />
          <MetricBox label="Pengguna Aktif" value={systemMetrics.active_users} color="bg-green-50" />
          <MetricBox label="Total Penempatan" value={systemMetrics.total_placements} color="bg-yellow-50" />
          <MetricBox label="Tingkat Keberhasilan" value={`${systemMetrics.success_rate}%`} color="bg-purple-50" />
        </div>
      </div>

      {/* === Charts Section === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
          <h3 className="font-bold text-base sm:text-lg mb-2">Distribusi Pengguna</h3>
          <PieChartCompenent
            legend=""
            tooltip="Total per Tipe Pengguna"
            dataList={[
              { name: "Siswa/Mahasiswa", value: summary.total_students, color: "#4f46e5" },
              { name: "Perusahaan", value: summary.total_companies, color: "#22c55e" },
              { name: "Sekolah", value: summary.total_schools, color: "#eab308" },
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
          <h3 className="font-bold text-base sm:text-lg mb-2">Distribusi Regional</h3>
          <BarChartCompenent
            legend="Distribusi Regional - Siswa"
            dataList={regionalData.map((d) => ({
              name: d.province,
              value: d.student_count,
            }))}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
          <h3 className="font-bold text-base sm:text-lg mb-2">User Premium</h3>
          <PieChartCompenent
            legend=""
            tooltip="Total per Tipe Pengguna"
            dataList={[
              { name: "Non Pro", value: summary.total_students, color: "#e2e600ff" },
              { name: "Perusahaan", value: summary.total_companies, color: "#4f46e5" },
              { name: "Sekolah", value: summary.total_schools, color: "#22c55e" },
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
        <h3 className="font-bold text-base sm:text-lg mb-2">Metrik Sistem</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Statistik performa dan aktivitas platform
        </p>

        <div className="grid grid-cols-1 gap-4">
          <MetricBox label="Sekolah" value={systemMetrics.new_registrations} color="bg-blue-50" />
          <MetricBox label="Universitas" value={systemMetrics.active_users} color="bg-green-50" />
          <MetricBox label="Non Pro" value={systemMetrics.total_placements} color="bg-yellow-50" />
        </div>
      </div>
      </div>

      {/* === Recent Activity === */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
        <h3 className="font-bold text-base sm:text-lg mb-2">Aktivitas Platform</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Statistik lowongan dan penempatan
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActivityBox
            title="Lowongan Aktif"
            value={summary.total_job_openings}
            desc={`${Math.round(summary.total_job_openings / summary.total_companies)} rata-rata per perusahaan`}
          />
          <ActivityBox title="Total Penghargaan" value={summary.total_achievements} desc="Diberikan kepada siswa & perusahaan" />
          <ActivityBox title="Ulasan Platform" value={summary.total_feedback} desc="Dari pengguna aktif" />
        </div>
      </div>
    </div>
  );
}

// === Sub-components ===
function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
      <div className="text-accent-dark min-w-0 flex-1">
        <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">{value}</h1>
        <h3 className="text-xs sm:text-sm leading-tight break-words">{title}</h3>
      </div>
      {icon}
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-accent-dark mt-2">{value}</p>
    </div>
  );
}

function ActivityBox({ title, value, desc }: { title: string; value: number; desc: string }) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <p className="text-2xl font-bold text-accent-dark">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  );
}
