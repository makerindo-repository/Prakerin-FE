"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import Swal from "sweetalert2";

interface RevenueMetrics {
  total_revenue: number;
  active_premium_accounts: number;
  pending_payments: number;
  this_month_revenue: number;
  revenue_by_tier: {
    monthly: number;
    yearly: number;
  };
}

interface RevenueRecord {
  id: number;
  user_id: string;
  user_name: string;
  user_type: "siswa" | "mahasiswa";
  amount: number;
  currency: string;
  payment_status: "paid" | "pending" | "failed";
  payment_date: string | null;
  period_start: string;
  period_end: string;
  payment_reference_id: string | null;
}

export default function RevenueDashboardPage() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch KPI metrics
      const metricsRes = await createApiCall<RevenueMetrics>(
        `${ENDPOINTS.ADMIN_REVENUE}/dashboard`,
        { method: "GET" }
      );
      if (metricsRes) setMetrics(metricsRes);

      // 2. Fetch revenue accounts list
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(userTypeFilter !== "all" && { user_type: userTypeFilter }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });

      const accountsRes = await createApiCall<{
        data: RevenueRecord[];
        meta: {
          total: number;
          current_page: number;
          last_page: number;
        };
      }>(`${ENDPOINTS.ADMIN_REVENUE}/accounts?${params.toString()}`, {
        method: "GET",
      });

      if (accountsRes && accountsRes.data) {
        setRecords(accountsRes.data);
        setTotalPages(accountsRes.meta.last_page || 1);
        setTotalCount(accountsRes.meta.total || 0);
      }
    } catch (error) {
      console.error("Gagal memuat data revenue", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, userTypeFilter, startDate, endDate]);

  const handleSync = async (id: number) => {
    try {
      setSyncingId(id);
      const res = await createApiCall<{ message: string }>(
        `${ENDPOINTS.ADMIN_REVENUE}/${id}/sync`,
        { method: "POST" }
      );
      alertSuccess(res?.message || "Status berhasil disinkronkan.");
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.errors || "Gagal sinkronkan status ke Midtrans.";
      alertError(msg);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (id: number, userName: string) => {
    const isConfirm = await alertConfirm(
      `Apakah Anda yakin ingin menghapus catatan log transaksi untuk "${userName}"? Data yang dihapus tidak dapat dikembalikan.`
    );
    if (!isConfirm) return;

    try {
      setDeletingId(id);
      const res = await createApiCall<{ message: string }>(
        `${ENDPOINTS.ADMIN_REVENUE}/${id}`,
        { method: "DELETE" }
      );
      alertSuccess(res?.message || "Catatan log transaksi berhasil dihapus.");
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.errors || error?.message || "Gagal menghapus catatan transaksi.";
      alertError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    setIsExporting(true);
    try {
      // Fetch all matching records without pagination limit
      const params = new URLSearchParams({
        page: "1",
        limit: "2000",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(userTypeFilter !== "all" && { user_type: userTypeFilter }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });

      const res = await createApiCall<{
        data: RevenueRecord[];
      }>(`${ENDPOINTS.ADMIN_REVENUE}/accounts?${params.toString()}`, {
        method: "GET",
      });

      const exportList = res?.data || records;

      if (!exportList || exportList.length === 0) {
        await alertError("Tidak ada data transaksi revenue untuk diunduh.");
        return;
      }

      const headers = [
        "No",
        "Nama Akun",
        "Tipe User",
        "Nominal (Rp)",
        "Periode Mulai",
        "Periode Selesai",
        "Status Pembayaran",
        "Tanggal Bayar",
        "Invoice ID / Reference",
      ];

      const todayStr = new Date().toISOString().slice(0, 10);
      const filename = `Laporan_Revenue_${todayStr}`;

      if (format === "csv") {
        const rows = exportList.map((item, index) => [
          index + 1,
          item.user_name || "-",
          item.user_type === "siswa" ? "Siswa (SMK)" : "Mahasiswa (PT)",
          item.amount || 0,
          item.period_start ? new Date(item.period_start).toLocaleDateString("id-ID") : "-",
          item.period_end ? new Date(item.period_end).toLocaleDateString("id-ID") : "-",
          (item.payment_status || "-").toUpperCase(),
          item.payment_date ? new Date(item.payment_date).toLocaleDateString("id-ID") : "-",
          item.payment_reference_id || "-",
        ]);

        const csvContent =
          "\uFEFF" +
          [
            headers.join(","),
            ...rows.map((row) =>
              row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
            ),
          ].join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Excel (.xls) format
        const rowsHtml = exportList
          .map(
            (item, index) => `
            <tr>
              <td style="text-align: center; border: 1px solid #cccccc; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #cccccc; padding: 8px;">${item.user_name || "-"}</td>
              <td style="border: 1px solid #cccccc; padding: 8px;">${item.user_type === "siswa" ? "Siswa (SMK)" : "Mahasiswa (PT)"}</td>
              <td style="border: 1px solid #cccccc; padding: 8px; text-align: right;">${(item.amount || 0).toLocaleString("id-ID")}</td>
              <td style="border: 1px solid #cccccc; padding: 8px;">${item.period_start ? new Date(item.period_start).toLocaleDateString("id-ID") : "-"}</td>
              <td style="border: 1px solid #cccccc; padding: 8px;">${item.period_end ? new Date(item.period_end).toLocaleDateString("id-ID") : "-"}</td>
              <td style="border: 1px solid #cccccc; padding: 8px; font-weight: bold;">${(item.payment_status || "-").toUpperCase()}</td>
              <td style="border: 1px solid #cccccc; padding: 8px;">${item.payment_date ? new Date(item.payment_date).toLocaleDateString("id-ID") : "-"}</td>
              <td style="border: 1px solid #cccccc; padding: 8px;">${item.payment_reference_id || "-"}</td>
            </tr>
          `
          )
          .join("");

        const excelTemplate = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
            <style>
              table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
              th { background-color: #0D9488; color: white; border: 1px solid #cccccc; padding: 10px; text-align: left; }
              td { border: 1px solid #cccccc; padding: 8px; }
            </style>
          </head>
          <body>
            <h2 style="font-family: Arial, sans-serif; color: #0D9488;">Laporan Transaksi Revenue Prakerin</h2>
            <p style="font-family: Arial, sans-serif; color: #666666; font-size: 12px;">Tanggal Unduh: ${new Date().toLocaleString("id-ID")}</p>
            <table>
              <thead>
                <tr>
                  ${headers.map((h) => `<th style="background-color: #0D9488; color: white; border: 1px solid #cccccc; padding: 10px;">${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
          </html>
        `;

        const blob = new Blob([excelTemplate], {
          type: "application/vnd.ms-excel;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${filename}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      await alertSuccess(`Berhasil mengunduh laporan revenue (${format.toUpperCase()})`);
    } catch (error: any) {
      console.error(error);
      await alertError(error?.message || "Gagal mengunduh laporan revenue.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadModal = async () => {
    const result = await Swal.fire({
      title: "Unduh Laporan Revenue",
      text: "Pilih format file laporan transaksi yang ingin Anda unduh:",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "📊 Unduh Excel (.xls)",
      denyButtonText: "📄 Unduh CSV (.csv)",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0D9488",
      denyButtonColor: "#3B82F6",
      cancelButtonColor: "#9CA3AF",
    });

    if (result.isConfirmed) {
      await handleExport("excel");
    } else if (result.isDenied) {
      await handleExport("csv");
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Laporan Keuangan</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revenue Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pantau total pendapatan, transaksi langganan, dan status pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadModal}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors text-sm font-medium shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Download className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} />
            <span>{isExporting ? "Mengunduh..." : "Unduh Laporan"}</span>
          </button>

          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(metrics?.total_revenue)}
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Semua akumulasi transaksi sukses</span>
          </p>
        </div>

        {/* Premium Accounts */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Akun Premium Aktif
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {metrics?.active_premium_accounts || 0}
          </div>
          <p className="text-xs text-gray-400 mt-1">Siswa & Mahasiswa pro</p>
        </div>

        {/* Pending Payments */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pending Payments
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {metrics?.pending_payments || 0}
          </div>
          <p className="text-xs text-gray-400 mt-1">Menunggu pembayaran QRIS</p>
        </div>

        {/* This Month Revenue */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(metrics?.this_month_revenue)}
          </div>
          <p className="text-xs text-gray-400 mt-1">Pendapatan bulan berjalan</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span>Filter Laporan:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="paid">Paid (Lunas)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed / Expired</option>
          </select>

          {/* User Type filter */}
          <select
            value={userTypeFilter}
            onChange={(e) => {
              setUserTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="all">Semua Tipe User</option>
            <option value="siswa">Siswa (SMK)</option>
            <option value="mahasiswa">Mahasiswa (PT)</option>
          </select>

          {/* Date range inputs */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Akun</th>
                <th className="px-6 py-4">Tipe User</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Periode Langganan</th>
                <th className="px-6 py-4">Status Pembayaran</th>
                <th className="px-6 py-4">Tanggal Bayar</th>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Aksi</th>
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
                      <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
                    </td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Belum ada riwayat transaksi revenue</p>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {r.user_name}
                    </td>
                    <td className="px-6 py-4 text-xs capitalize">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800">
                        {r.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(r.period_start).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      -{" "}
                      {new Date(r.period_end).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          r.payment_status === "paid"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : r.payment_status === "pending"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {r.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {r.payment_date
                        ? new Date(r.payment_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {r.payment_reference_id || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {r.payment_status === "pending" && (
                          <button
                            onClick={() => handleSync(r.id)}
                            disabled={syncingId === r.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Sync status dari Midtrans"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${syncingId === r.id ? "animate-spin" : ""}`}
                            />
                            <span>{syncingId === r.id ? "Cek..." : "Sync"}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(r.id, r.user_name)}
                          disabled={deletingId === r.id}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Hapus Log Transaksi"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === r.id ? "animate-spin" : ""}`} />
                        </button>
                      </div>
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
            Total <span className="font-semibold text-gray-800 dark:text-gray-200">{totalCount}</span> catatan
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Halaman {page} dari {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}