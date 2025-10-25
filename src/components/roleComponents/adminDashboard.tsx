'use client';

import {
  BadgeCheck,
  BriefcaseBusiness,
  Building,
  CircleArrowRight,
  Users,
  GraduationCap,
  Building2,
  Activity
} from "lucide-react";
import RatingSummaryCompenent from "../RatingSummaryCompenent";
import PieChartCompenent from "../Charts/PieChartCompenent";
import BarChartCompenent from "../Charts/BarChartCompenent";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "../loader";

// Dummy data interfaces
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

export default function AdminDashboard({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Dummy initial state
  const [summary, setSummary] = useState<Summary>({
    total_users: 1250,
    total_schools: 45,
    total_companies: 78,
    total_students: 890,
    total_job_openings: 234,
    total_achievements: 67,
    active_internships: 156,
    total_feedback: 432
  });

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    new_registrations: 89,
    active_users: 567,
    total_placements: 234,
    success_rate: 87.5
  });

  const [regionalData] = useState<RegionalData[]>([
    { province: "DKI Jakarta", student_count: 245, company_count: 28 },
    { province: "Jawa Barat", student_count: 189, company_count: 23 },
    { province: "Jawa Timur", student_count: 167, company_count: 19 },
    { province: "Jawa Tengah", student_count: 156, company_count: 15 },
    { province: "Banten", student_count: 133, company_count: 12 }
  ]);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.total_users}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Total Pengguna
            </h3>
          </div>
          <Users className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>

        {/* Schools Card */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.total_schools}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Sekolah & Universitas
            </h3>
          </div>
          <GraduationCap className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>

        {/* Companies Card */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.total_companies}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Perusahaan Terdaftar
            </h3>
          </div>
          <Building className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>

        {/* Active Internships */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.active_internships}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Magang Aktif
            </h3>
          </div>
          <Activity className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>
      </div>

      {/* System Metrics Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row mb-4 gap-2 sm:gap-4 justify-between items-start">
          <div className="flex flex-col flex-1">
            <h3 className="font-bold text-base sm:text-lg">Metrik Sistem</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Statistik performa dan aktivitas platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Registrasi Baru (30 hari)</p>
            <p className="text-2xl font-bold text-accent-dark mt-2">
              {systemMetrics.new_registrations}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Pengguna Aktif</p>
            <p className="text-2xl font-bold text-accent-dark mt-2">
              {systemMetrics.active_users}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Penempatan</p>
            <p className="text-2xl font-bold text-accent-dark mt-2">
              {systemMetrics.total_placements}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Tingkat Keberhasilan</p>
            <p className="text-2xl font-bold text-accent-dark mt-2">
              {systemMetrics.success_rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex flex-col mb-4">
            <h3 className="font-bold text-base sm:text-lg">Distribusi Pengguna</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Perbandingan jumlah tiap tipe pengguna
            </p>
          </div>

          <PieChartCompenent
            legend="Distribusi Pengguna"
            tooltip="Total per Tipe Pengguna"
            dataList={[
              {
                name: "Siswa/Mahasiswa",
                value: summary.total_students,
                color: "#4f46e5",
              },
              {
                name: "Perusahaan",
                value: summary.total_companies,
                color: "#22c55e",
              },
              {
                name: "Sekolah",
                value: summary.total_schools,
                color: "#eab308",
              }
            ]}
          />
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex flex-col mb-4">
            <h3 className="font-bold text-base sm:text-lg">Distribusi Regional</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Sebaran siswa dan perusahaan per provinsi teratas
            </p>
          </div>

          <BarChartCompenent
            legend="Distribusi Regional - Siswa"
            dataList={regionalData.map((d) => ({
              name: d.province,
              value: d.student_count,
            }))}
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex flex-col mb-4">
          <h3 className="font-bold text-base sm:text-lg">Aktivitas Platform</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Statistik lowongan dan penempatan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Lowongan Aktif</h4>
            <p className="text-2xl font-bold text-accent-dark">
              {summary.total_job_openings}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(summary.total_job_openings / summary.total_companies)} rata-rata per perusahaan
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Total Penghargaan</h4>
            <p className="text-2xl font-bold text-accent-dark">
              {summary.total_achievements}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Diberikan kepada siswa & perusahaan
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Ulasan Platform</h4>
            <p className="text-2xl font-bold text-accent-dark">
              {summary.total_feedback}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dari pengguna aktif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
