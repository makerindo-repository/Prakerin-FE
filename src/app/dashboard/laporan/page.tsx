"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import { alertError, alertSuccess } from "@/libs/alert";
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Users,
  GraduationCap,
  Building2,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  FileDown,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface StatsData {
  total_internships?: number;
  by_status?: { pending: number; ongoing: number; completed: number };
  by_company?: Array<{ company_name: string; count: number }>;
  by_field?: Array<{ field_name: string; count: number }>;
  average_duration_days?: number;
  success_rate_percentage?: number;

  total_students?: number;
  pre_internship_enrolled?: number;
  pre_internship_completed?: number;
  dropout_rate_percentage?: number;
  average_rating?: number;

  total_companies?: number;
  placements_per_company?: Array<{ id: string; name: string; placements_count: number }>;
  retention_rate_percentage?: number;
  job_offer_rate_percentage?: number;
}

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<"internship_stats" | "student_progress" | "company_performance">("internship_stats");
  const [loading, setLoading] = useState(true);
  const [exportingFormat, setExportingFormat] = useState<"csv" | "pdf" | null>(null);
  const [data, setData] = useState<StatsData | null>(null);
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Options list for filters
  const [companies, setCompanies] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);

  const fetchFiltersData = async () => {
    try {
      const compRes = await createApiCall({ url: "/companies" });
      const schoolRes = await createApiCall({ url: "/users?role=school" });
      const fieldRes = await createApiCall({ url: "/fields" });
      
      setCompanies(compRes?.data || []);
      setSchools(schoolRes?.data || []);
      setFields(fieldRes?.data || []);
    } catch (err) {
      console.error("Error fetching filters options", err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let url = "";
      const params: any = {};

      if (activeTab === "internship_stats") {
        url = "/reports/internship-stats";
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (companyFilter) params.company_id = companyFilter;
        if (fieldFilter) params.field_id = fieldFilter;
        if (statusFilter) params.status = statusFilter;
      } else if (activeTab === "student_progress") {
        url = "/reports/student-progress";
        if (schoolFilter) params.school_id = schoolFilter;
        if (statusFilter) params.status = statusFilter;
      } else {
        url = "/reports/company-performance";
        if (companyFilter) params.location = companyFilter;
      }

      const queryString = new URLSearchParams(params).toString();
      const res = await createApiCall({
        url: url + (queryString ? `?${queryString}` : ""),
      });

      setData(res);
    } catch (err) {
      console.error("Error fetching report data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate, companyFilter, schoolFilter, fieldFilter, statusFilter]);

  const handleExport = async (format: "csv" | "pdf") => {
    setExportingFormat(format);
    try {
      const filters: any = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (companyFilter) filters.company_id = companyFilter;
      if (schoolFilter) filters.school_id = schoolFilter;
      if (fieldFilter) filters.field_id = fieldFilter;
      if (statusFilter) filters.status = statusFilter;

      const response = await createApiCall({
        url: "/reports/export",
        method: "POST",
        data: {
          type: activeTab,
          format,
          filters
        },
        responseType: "blob"
      });

      // Handle backend JSON errors formatted inside a blob
      if (response instanceof Blob && response.type && response.type.includes("application/json")) {
        const errorText = await response.text();
        try {
          const errObj = JSON.parse(errorText);
          alertError(errObj.message || errObj.errors || "Gagal mengunduh laporan.");
        } catch {
          alertError("Gagal mengunduh laporan.");
        }
        return;
      }

      const mimeType = format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;";
      const blob = response instanceof Blob ? response : new Blob([response], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `laporan_${activeTab}_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      alertSuccess(`Laporan ${format.toUpperCase()} berhasil diunduh.`);
    } catch (err: any) {
      console.error("Export error, attempting fallback", err);
      try {
        const token =
          Cookies.get("userToken") ||
          Cookies.get("token") ||
          (typeof window !== "undefined"
            ? localStorage.getItem("userToken") || localStorage.getItem("token")
            : "");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const url = `${cleanBase}/api/v1/reports/export?token=${token}&type=${activeTab}&format=${format}`;
        window.open(url, "_blank");
      } catch (fallbackErr) {
        alertError("Gagal mengekspor laporan. Silakan coba lagi.");
      }
    } finally {
      setExportingFormat(null);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCompanyFilter("");
    setSchoolFilter("");
    setFieldFilter("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-[#035a70] w-7 h-7" />
            Laporan & Analisis
          </h1>
          <p className="text-gray-500 text-sm">
            Statistik dan kemajuan menyeluruh program prakerin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/laporan/scheduled"
            className="flex items-center gap-2 px-4 py-2 border border-[#035a70] text-[#035a70] hover:bg-[#035a70]/5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Clock className="w-4 h-4" />
            Jadwal Laporan Otomatis
          </Link>
          <button
            onClick={fetchReportData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-sm">
        <button
          onClick={() => { setActiveTab("internship_stats"); clearFilters(); }}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === "internship_stats"
              ? "bg-[#035a70] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Statistik Magang
        </button>
        <button
          onClick={() => { setActiveTab("student_progress"); clearFilters(); }}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === "student_progress"
              ? "bg-[#035a70] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Progress Siswa
        </button>
        <button
          onClick={() => { setActiveTab("company_performance"); clearFilters(); }}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === "company_performance"
              ? "bg-[#035a70] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Kinerja Perusahaan
        </button>
      </div>

      {/* Filters & Export Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-800 text-sm border-b border-gray-50 pb-2">
          <Filter className="w-4 h-4 text-[#035a70]" />
          Filter Data
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeTab === "internship_stats" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Mulai Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Perusahaan</label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                >
                  <option value="">Semua Perusahaan</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Bidang</label>
                <select
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                >
                  <option value="">Semua Bidang</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === "student_progress" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Sekolah</label>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                >
                  <option value="">Semua Sekolah</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name || s.username}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Status Siswa</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                >
                  <option value="">Semua Status</option>
                  <option value="not_started">Belum Mulai (Not Started)</option>
                  <option value="ongoing">Sedang Magang (Ongoing)</option>
                  <option value="completed">Selesai Magang (Completed)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "company_performance" && (
            <>
              <div className="flex flex-col gap-1 col-span-1">
                <label className="text-xs font-semibold text-gray-500">Industri (Sektor)</label>
                <select
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                >
                  <option value="">Semua Sektor</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Action Panel: Clear & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-4 gap-4">
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Reset Filter
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport("csv")}
              disabled={exportingFormat !== null}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
            >
              {exportingFormat === "csv" ? (
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              )}
              {exportingFormat === "csv" ? "Mengekspor..." : "Ekspor CSV"}
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exportingFormat !== null}
              className="flex items-center gap-2 px-4 py-2 bg-[#035a70] text-white hover:bg-[#035a70]/90 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              {exportingFormat === "pdf" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {exportingFormat === "pdf" ? "Mengunduh..." : "Unduh PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <RefreshCw className="w-8 h-8 text-[#035a70] animate-spin" />
        </div>
      ) : data ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeTab === "internship_stats" && (
              <>
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Total Internship</span>
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.total_internships}</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Data keseluruhan di sistem</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Success Rate</span>
                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.success_rate_percentage}%</h2>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${data.success_rate_percentage}%` }}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Rata-rata Durasi</span>
                    <span className="p-2 bg-[#035a70]/5 text-[#035a70] rounded-lg"><Clock className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.average_duration_days}</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Hari penempatan aktif</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Dalam Proses</span>
                    <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.by_status?.ongoing}</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Siswa aktif magang</div>
                </div>
              </>
            )}

            {activeTab === "student_progress" && (
              <>
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Total Siswa</span>
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><GraduationCap className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.total_students}</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Telah teregistrasi</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Rata-rata Rating</span>
                    <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.average_rating} / 5</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Nilai rata-rata ulasan</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Pre-Internship Enrolled</span>
                    <span className="p-2 bg-[#035a70]/5 text-[#035a70] rounded-lg"><Users className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.pre_internship_enrolled}</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Kelas pra-magang diikuti</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Dropout Rate</span>
                    <span className="p-2 bg-red-50 text-red-600 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.dropout_rate_percentage}%</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Membatalkan keikutsertaan kelas</div>
                </div>
              </>
            )}

            {activeTab === "company_performance" && (
              <>
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Total Industri Mitra</span>
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building2 className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.total_companies}</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Aktif kerja sama (MOU)</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Retention Rate</span>
                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.retention_rate_percentage}%</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Tingkat keberhasilan magang</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Tawaran Kerja (Offer)</span>
                    <span className="p-2 bg-[#035a70]/5 text-[#035a70] rounded-lg"><Users className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.job_offer_rate_percentage}%</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Tawaran pekerjaan pasca magang</div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-semibold">Rating Perusahaan</span>
                    <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{data.average_rating} / 5</h2>
                  <div className="text-[10px] text-gray-400 mt-1">Nilai rating dari siswa</div>
                </div>
              </>
            )}
          </div>

          {/* Visual Tables & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTab === "internship_stats" && (
              <>
                {/* Company Placements Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Distribusi Penempatan Perusahaan</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                          <th className="py-3 px-4 font-bold">Nama Perusahaan</th>
                          <th className="py-3 px-4 font-bold text-center">Jumlah Siswa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.by_company && data.by_company.length > 0 ? (
                          data.by_company.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-medium text-gray-700">{c.company_name}</td>
                              <td className="py-3 px-4 text-center font-bold text-[#035a70]">{c.count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-8 text-center text-gray-400">Tidak ada data penempatan.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Field Breakdown SVG Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Distribusi Berdasarkan Bidang</h3>
                  <div className="space-y-4 pt-2">
                    {data.by_field && data.by_field.length > 0 ? (
                      data.by_field.map((f, i) => {
                        const totalCount = data.by_field?.reduce((sum, item) => sum + item.count, 0) || 1;
                        const percentage = Math.round((f.count / totalCount) * 100);
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-gray-700">
                              <span>{f.field_name}</span>
                              <span>{f.count} Siswa ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                              <div
                                className="bg-[#035a70] h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-400">Tidak ada data bidang.</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "student_progress" && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 col-span-2">
                  <h3 className="text-lg font-bold text-gray-800">Status Keikutsertaan Pre-Internship</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-center">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Terdaftar</span>
                      <h4 className="text-3xl font-extrabold text-blue-900 mt-1">{data.pre_internship_enrolled}</h4>
                      <p className="text-[10px] text-blue-500 mt-1">Siswa terdaftar kelas pra-magang</p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 text-center">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Lulus / Selesai</span>
                      <h4 className="text-3xl font-extrabold text-emerald-900 mt-1">{data.pre_internship_completed}</h4>
                      <p className="text-[10px] text-emerald-500 mt-1">Menyelesaikan seluruh kurikulum</p>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 text-center">
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Dropout / Keluar</span>
                      <h4 className="text-3xl font-extrabold text-red-900 mt-1">{Math.round(data.pre_internship_enrolled! * data.dropout_rate_percentage! / 100)}</h4>
                      <p className="text-[10px] text-red-500 mt-1">Mengundurkan diri di tengah jalan</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "company_performance" && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 col-span-2">
                  <h3 className="text-lg font-bold text-gray-800">Penempatan Per Perusahaan</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                          <th className="py-3 px-4 font-bold">Nama Industri</th>
                          <th className="py-3 px-4 font-bold text-center">Jumlah Placements</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.placements_per_company && data.placements_per_company.length > 0 ? (
                          data.placements_per_company.map((comp, i) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-medium text-gray-700">{comp.name}</td>
                              <td className="py-3 px-4 text-center font-bold text-[#035a70]">{comp.placements_count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-8 text-center text-gray-400">Tidak ada penempatan.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400">Gagal memuat data laporan.</p>
        </div>
      )}
    </div>
  );
}
