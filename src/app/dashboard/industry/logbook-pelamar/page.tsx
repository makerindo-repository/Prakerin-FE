"use client";

import {
  AlertCircle,
  BriefcaseBusiness,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  History,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";
import Loader from "@/components/loader";
import { alertError, alertSuccess } from "@/libs/alert";

interface JobOpeningOption {
  id: string;
  title: string;
}

interface InternshipApplication {
  id: string;
  student?: {
    id?: string;
    name: string;
    phone_number?: string | null;
  };
  user?: {
    email?: string;
    photo_profile?: string | null;
    whatsapp_number?: string | null;
  };
  school?: {
    name: string;
    type?: string;
  };
  major?: string | null;
  job_opening_id?: string;
  job_opening?: {
    id: string;
    title: string;
    type?: string;
    location?: string;
    company_name?: string;
  } | null;
  status: "in_progress" | "accepted" | "rejected";
  read_at?: string | null;
  is_read?: boolean;
  cover_letter?: string | null;
  message_rejected?: string | null;
  created_at: string;
  updated_at: string;
  curriculum_vitae?: {
    id: string;
    name: string;
  };
}

interface StatsData {
  total: number;
  accepted: number;
  rejected: number;
  in_progress: number;
  acceptance_rate: number;
}

type StatusFilter = "all" | "accepted" | "rejected" | "in_progress";

export default function LogbookPelamarPage() {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    accepted: 0,
    rejected: 0,
    in_progress: 0,
    acceptance_rate: 0,
  });
  const [jobOptions, setJobOptions] = useState<JobOpeningOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedSearch = useDebounce(inputSearch, 500);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [downloadingCvId, setDownloadingCvId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  // Fetch job openings for filter dropdown
  const fetchJobOptions = async () => {
    try {
      const res = await API.get(ENDPOINTS.JOB_OPENINGS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        params: {
          limit: 100,
          dashboard: true,
        },
      });
      if (res.status === 200 && res.data?.data) {
        setJobOptions(
          res.data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching job options:", err);
    }
  };

  // Fetch stats counts
  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const res = await API.get(`${ENDPOINTS.INTERNSHIP_APPLICATIONS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        params: selectedJobId ? { job_opening_id: selectedJobId } : {},
      });
      if (res.status === 200 && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Fetch applications list
  const fetchApplications = async (page = pages.activePages) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (selectedJobId) {
        params.job_opening_id = selectedJobId;
      }

      const res = await API.get(ENDPOINTS.INTERNSHIP_APPLICATIONS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        params,
      });

      if (res.status === 200) {
        setApplications(res.data.data || []);
        setPages({
          activePages: res.data.current_page || 1,
          pages: res.data.last_page || 1,
        });
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobOptions();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedJobId]);

  useEffect(() => {
    setPages((prev) => ({ ...prev, activePages: 1 }));
    fetchApplications(1);
  }, [debouncedSearch, statusFilter, selectedJobId]);

  const handleDownloadCv = async (cvId: string, studentName?: string) => {
    if (downloadingCvId || !cvId) return;
    setDownloadingCvId(cvId);
    setDownloadProgress(0);

    try {
      const response = await API.get(
        `${ENDPOINTS.CURRICULUM_VITAE}/${cvId}/download`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setDownloadProgress(percent);
            }
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const safeFilename = (studentName || "Pelamar").replace(/[^a-zA-Z0-9_-]/g, "_");
      link.setAttribute("download", `CV_${safeFilename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      await alertSuccess("CV berhasil diunduh!");
    } catch (err: any) {
      console.error("Error downloading CV:", err);
      await alertError("Gagal mengunduh berkas CV.");
    } finally {
      setDownloadingCvId(null);
      setDownloadProgress(0);
    }
  };

  const getWhatsAppLink = (phone: string | null | undefined, name?: string) => {
    if (!phone || typeof phone !== "string") return null;
    let cleaned = phone.replace(/\D/g, "");
    if (!cleaned) return null;
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }
    const safeName = (name || "Pelamar").trim();
    const msg = encodeURIComponent(
      `Halo ${safeName}, kami dari tim HR Perusahaan di PRAKERIN.ID ingin mengonfirmasi terkait status lamaran magang Anda.`
    );
    return `https://wa.me/${cleaned}?text=${msg}`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "-";
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr || "-";
    }
  };

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-1">
            <Link href="/dashboard" className="hover:text-accent transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-400">Perusahaan</span>
            <span>/</span>
            <span className="text-accent font-medium">Logbook Pelamar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-emerald-400 flex items-center justify-center text-white shadow-md shadow-accent/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Logbook & Riwayat Seleksi Pelamar
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Rekapitulasi lengkap status pelamar, riwayat seleksi (Diterima / Ditolak / Menunggu), serta catatan keputusan.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action: Print Logbook */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-accent hover:text-accent text-gray-700 text-sm font-medium rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Logbook</span>
          </button>
          <Link
            href="/dashboard/industry/lamaran"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl shadow-md shadow-accent/20 transition-all"
          >
            <BriefcaseBusiness className="w-4 h-4" />
            <span>Kelola Lamaran</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 print:grid-cols-5">
        {/* Total Pelamar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Pelamar
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {isStatsLoading ? "..." : stats.total}
            </h3>
          </div>
        </div>

        {/* Diterima */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs flex items-center gap-4 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Diterima
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
              {isStatsLoading ? "..." : stats.accepted}
            </h3>
          </div>
        </div>

        {/* Ditolak */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-100 shadow-xs flex items-center gap-4 bg-gradient-to-br from-white to-red-50/30">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
              Ditolak
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-red-700 mt-0.5">
              {isStatsLoading ? "..." : stats.rejected}
            </h3>
          </div>
        </div>

        {/* Menunggu Keputusan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-xs flex items-center gap-4 bg-gradient-to-br from-white to-amber-50/30">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Menunggu
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
              {isStatsLoading ? "..." : stats.in_progress}
            </h3>
          </div>
        </div>

        {/* Rasio Penerimaan */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-xs flex items-center gap-4 bg-gradient-to-br from-white to-indigo-50/30">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Penerimaan
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-indigo-700 mt-0.5">
              {isStatsLoading ? "..." : `${stats.acceptance_rate}%`}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("accepted")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "accepted"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Diterima ({stats.accepted})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("rejected")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "rejected"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-red-700 hover:bg-red-50"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Ditolak ({stats.rejected})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "in_progress"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu ({stats.in_progress})</span>
            </button>
          </div>

          {/* Lowongan Dropdown Filter */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium cursor-pointer"
            >
              <option value="">Semua Posisi / Lowongan</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            placeholder="Cari berdasarkan nama pelamar, asal sekolah/perguruan tinggi, jurusan, atau posisi..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-gray-400"
          />
          {inputSearch && (
            <button
              type="button"
              onClick={() => setInputSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full px-2 py-0.5"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* Logbook Table / List Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-gray-900 text-base">
              Daftar Catatan Riwayat Pelamar
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Menampilkan {applications.length} data
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader width={48} height={48} />
            <p className="text-sm text-gray-500 font-medium">Memuat logbook pelamar...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center">
            <NotFoundComponent text="Tidak ada catatan logbook pelamar yang sesuai dengan filter pencarian." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4 sm:px-6">No & Tanggal</th>
                  <th className="py-3.5 px-4 sm:px-6">Pelamar (Kandidat)</th>
                  <th className="py-3.5 px-4 sm:px-6">Posisi Lowongan</th>
                  <th className="py-3.5 px-4 sm:px-6">Status Seleksi</th>
                  <th className="py-3.5 px-4 sm:px-6">Catatan / Keterangan</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {applications.map((app, index) => {
                  const studentName = app.student?.name || "Pelamar";
                  const schoolName = app.school?.name || "-";
                  const majorName = app.major || "Jurusan belum diisi";
                  const jobTitle = app.job_opening?.title || "Lowongan";
                  const waNumber = app.user?.whatsapp_number || app.student?.phone_number;
                  const waLink = getWhatsAppLink(waNumber, studentName);
                  const isDownloadingThisCv = downloadingCvId === app.curriculum_vitae?.id;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. No & Tanggal Melamar */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono font-semibold">
                            #{(pages.activePages - 1) * 10 + (index + 1)}
                          </span>
                          <p className="text-xs text-gray-800 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                            {formatDate(app.created_at)}
                          </p>
                          {formatTime(app.created_at) && (
                            <p className="text-[11px] text-gray-400">
                              {formatTime(app.created_at)} WIB
                            </p>
                          )}
                          {app.read_at ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                              <Eye className="w-2.5 h-2.5" />
                              Ditinjau
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                              Belum dibaca
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Data Pelamar */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {app.user?.photo_profile ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${app.user.photo_profile}`}
                                alt={studentName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-gray-900 group-hover:text-accent transition-colors">
                              {studentName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-medium line-clamp-1">
                                {schoolName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {majorName}
                            </p>
                            {app.user?.email && (
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>{app.user.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Posisi Lowongan */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="space-y-1 max-w-[200px]">
                          <p className="font-semibold text-gray-800 line-clamp-2">
                            {jobTitle}
                          </p>
                          {app.job_opening?.location && (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                              {app.job_opening.location === "onsite"
                                ? "Onsite"
                                : app.job_opening.location === "remote"
                                ? "Remote"
                                : "Hybrid"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Status Seleksi */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        {app.status === "accepted" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>DITERIMA</span>
                            </span>
                            <p className="text-[11px] text-emerald-700 font-medium">
                              Peserta Magang
                            </p>
                          </div>
                        )}

                        {app.status === "rejected" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              <span>DITOLAK</span>
                            </span>
                            <p className="text-[11px] text-red-600 font-medium">
                              Tidak Lolos Seleksi
                            </p>
                          </div>
                        )}

                        {app.status === "in_progress" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>MENUNGGU</span>
                            </span>
                            <p className="text-[11px] text-amber-700 font-medium">
                              Dalam Evaluasi
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 5. Catatan / Alasan */}
                      <td className="py-4 px-4 sm:px-6 align-top max-w-xs">
                        {app.status === "rejected" ? (
                          app.message_rejected && typeof app.message_rejected === "string" && app.message_rejected.trim() ? (
                            <div className="p-2.5 bg-red-50/80 border border-red-100 rounded-xl text-xs text-red-800 space-y-1">
                              <div className="flex items-center gap-1 font-semibold text-red-900">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Alasan Penolakan:</span>
                              </div>
                              <p className="text-red-700 italic">
                                &ldquo;{app.message_rejected.trim()}&rdquo;
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Tidak ada catatan alasan penolakan.
                            </span>
                          )
                        ) : app.status === "accepted" ? (
                          <div className="p-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1">
                            <div className="flex items-center gap-1 font-semibold text-emerald-900">
                              <FileCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Konfirmasi Magang:</span>
                            </div>
                            <p className="text-emerald-700">
                              Surat penerimaan telah dikirimkan ke email pelamar.
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Menunggu tinjauan & keputusan tim HR.
                          </span>
                        )}
                      </td>

                      {/* 6. Aksi */}
                      <td className="py-4 px-4 sm:px-6 align-top text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail Lamaran Link */}
                          <Link
                            href={`/dashboard/industry/lamaran/${app.id}`}
                            className="p-2 text-gray-500 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors title='Lihat Detail Lamaran'"
                            title="Lihat Detail Lamaran"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Unduh CV */}
                          {app.curriculum_vitae?.id && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadCv(
                                  app.curriculum_vitae!.id,
                                  studentName
                                )
                              }
                              disabled={isDownloadingThisCv}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Unduh CV Pelamar"
                            >
                              {isDownloadingThisCv ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* WhatsApp Chat Button */}
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Chat WhatsApp Pelamar"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && applications.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <p className="text-xs sm:text-sm text-gray-500">
              Halaman <span className="font-semibold text-gray-900">{pages.activePages}</span> dari{" "}
              <span className="font-semibold text-gray-900">{pages.pages}</span>
            </p>
            <PaginationComponent
              activePage={pages.activePages}
              totalPages={pages.pages}
              loading={isLoading}
              onPageChange={(selectedPage) => {
                setPages((prev) => ({ ...prev, activePages: selectedPage }));
                fetchApplications(selectedPage);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
