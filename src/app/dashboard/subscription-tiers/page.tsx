"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Sparkles,
  Users,
  Building2,
  GraduationCap,
  School,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import { alertConfirm } from "@/libs/alert";
import { useAuthStore } from "@/stores/authStore";
import UpgradePremiumSection from "@/components/UpgradePremiumSection";

interface AccountItem {
  id: string;
  name: string;
  email?: string;
  user_type: string;
  school: string | null;
  status_subscription: "free" | "premium";
  status_magang: string;
  subscription_end_date: string | null;
  renewal_date: string | null;
  subscription_status: string | null;
}

export default function SubscriptionTiersPage() {
  const role = useAuthStore((s) => s.role);
  const studentId = useAuthStore((s) => s.studentId);
  const companyId = useAuthStore((s) => s.companyId);
  const schoolId = useAuthStore((s) => s.schoolId);

  const [activeTab, setActiveTab] = useState<"student" | "company" | "school">("student");
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        account_type: activeTab,
        ...(search && { search }),
        ...(tierFilter && { tier: tierFilter }),
      });

      const res = await createApiCall<{
        data: AccountItem[];
        meta: {
          total: number;
          current_page: number;
          last_page: number;
        };
      }>(`${ENDPOINTS.ADMIN_SUBSCRIPTIONS}/list?${params.toString()}`, {
        method: "GET",
      });

      if (res && res.data) {
        setAccounts(res.data);
        setTotalPages(res.meta.last_page || 1);
        setTotalCount(res.meta.total || 0);
      }
    } catch (error) {
      console.error("Gagal memuat akun langganan", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search, tierFilter]);

  useEffect(() => {
    if (role === "super_admin" || !role) {
      fetchAccounts();
    }
  }, [fetchAccounts, role]);

  const handleToggleTier = async (
    accId: string,
    accName: string,
    currentTier: "free" | "premium",
    newTier: "free" | "premium"
  ) => {
    if (currentTier === newTier) return;

    const confirmed = await alertConfirm(
      "Ubah Tier Langganan",
      `Apakah kamu yakin ingin mengubah status langganan ${accName} dari ${currentTier.toUpperCase()} menjadi ${newTier.toUpperCase()}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(accId);
      await createApiCall(`${ENDPOINTS.ADMIN_SUBSCRIPTIONS}/toggle`, {
        method: "POST",
        data: {
          account_id: accId,
          account_type: activeTab,
          status_subscription: newTier,
        },
      });

      // Refresh list
      fetchAccounts();
    } catch (err: any) {
      alert("Gagal memperbarui tier langganan");
    } finally {
      setUpdatingId(null);
    }
  };

  // If role is company or student, display self-service upgrade view
  if (role === "company") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paket Perusahaan</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upgrade Paket Langganan Perusahaan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dapatkan akses penuh ke fitur eksklusif termasuk AI Company Profile Match & Pencarian Talenta Magang.
          </p>
        </div>

        <UpgradePremiumSection companyId={companyId} isCompany={true} />
      </div>
    );
  }

  if (role === "school") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paket Sekolah & Kampus</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upgrade Paket Langganan Sekolah / Perguruan Tinggi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dapatkan akses penuh ke fitur eksklusif termasuk Pencocokan Silabus Kurikulum & Rekomendasi Mitra Industri AI.
          </p>
        </div>

        <UpgradePremiumSection schoolId={schoolId} isSchool={true} />
      </div>
    );
  }

  if (role === "student") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paket Siswa / Mahasiswa</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upgrade Paket Langganan Premium
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Akses fitur CV Pintar AI, rekomendasi lowongan prioritas, dan analitik karir.
          </p>
        </div>

        <UpgradePremiumSection studentId={studentId} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manajemen Akses Tier</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Paket Langganan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola dan ubah tingkat langganan akun (Free / Premium) secara manual.
          </p>
        </div>

        <button
          onClick={() => fetchAccounts()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800">
        <button
          onClick={() => {
            setActiveTab("student");
            setPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-colors cursor-pointer ${
            activeTab === "student"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Siswa & Mahasiswa</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("company");
            setPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-colors cursor-pointer ${
            activeTab === "company"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Perusahaan (Industri)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("school");
            setPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-colors cursor-pointer ${
            activeTab === "school"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <School className="w-4 h-4" />
          <span>Sekolah / Kampus</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "company"
                ? "Cari nama perusahaan atau email..."
                : activeTab === "school"
                ? "Cari nama sekolah, NPSN, atau email..."
                : "Cari nama siswa/mahasiswa..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Paket:</span>
          </div>
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-gray-900 dark:text-white"
          >
            <option value="">Semua Paket</option>
            <option value="free">Hanya Free</option>
            <option value="premium">Hanya Premium</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">
                  {activeTab === "company"
                    ? "Nama Perusahaan"
                    : activeTab === "school"
                    ? "Nama Sekolah / Kampus"
                    : "Nama Akun"}
                </th>
                <th className="px-6 py-4">
                  {activeTab === "company"
                    ? "Sektor Industri"
                    : activeTab === "school"
                    ? "Tipe Institusi"
                    : "Tipe Akun"}
                </th>
                <th className="px-6 py-4">
                  {activeTab === "company" || activeTab === "school"
                    ? "Email Kontak"
                    : "Sekolah / PT"}
                </th>
                <th className="px-6 py-4">Tier Langganan</th>
                <th className="px-6 py-4">Berakhir Pada</th>
                <th className="px-6 py-4 text-center">Aksi / Toggle Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded-xl mx-auto" />
                    </td>
                  </tr>
                ))
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Tidak ada data ditemukan</p>
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {acc.name}
                    </td>
                    <td className="px-6 py-4 capitalize text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-800 font-medium">
                        {activeTab === "company"
                          ? acc.school || "Industri"
                          : activeTab === "school"
                          ? acc.school || "Sekolah / Kampus"
                          : acc.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {activeTab === "company" || activeTab === "school" ? acc.email || "—" : acc.school || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          acc.status_subscription === "premium"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {acc.status_subscription === "premium" && (
                          <Sparkles className="w-3 h-3 text-amber-500" />
                        )}
                        <span>{acc.status_subscription}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {acc.subscription_end_date
                        ? new Date(acc.subscription_end_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        disabled={updatingId === acc.id}
                        value={acc.status_subscription}
                        onChange={(e) =>
                          handleToggleTier(
                            acc.id,
                            acc.name,
                            acc.status_subscription,
                            e.target.value as "free" | "premium"
                          )
                        }
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            Total <span className="font-semibold text-gray-800 dark:text-gray-200">{totalCount}</span> akun
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Halaman {page} dari {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
