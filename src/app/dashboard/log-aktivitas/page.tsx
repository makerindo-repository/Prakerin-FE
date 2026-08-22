"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import {
  Activity,
  Search,
  Filter,
  Users,
  Key,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { alertConfirm, alertSuccess, alertError } from "@/libs/alert";

interface ActivityLogData {
  id: string;
  user: { username: string; email: string };
  action: "login" | "logout" | "create" | "update" | "delete" | "download" | "upload";
  resource_type: string;
  resource_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  description: string | null;
  created_at: string;
}

interface StatsData {
  total_today: number;
  total_week: number;
  total_month: number;
  most_active_user: { username: string; count: number } | null;
  most_logged_action: { action: string; count: number } | null;
  most_modified_resource: { resource_type: string; count: number } | null;
  logins_today: number;
}

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState<ActivityLogData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [usersList, setUsersList] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const res = await createApiCall({ url: "/users?limit=100", headers });
      setUsersList(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (userId) params.user_id = userId;
      if (action) params.action = action;
      if (resourceType) params.resource_type = resourceType;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const queryString = new URLSearchParams(params).toString();
      const res = await createApiCall({
        url: `/activity-logs?${queryString}`,
        headers
      });

      setLogs(res?.data || []);
      setTotalPages(res?.last_page || 1);

      const statsRes = await createApiCall({
        url: "/activity-logs/stats",
        headers
      });
      setStats(statsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, search, userId, action, resourceType, startDate, endDate]);

  const handleExportCSV = () => {
    // Generate simple CSV content of visible logs
    const headersCSV = ["User", "Action", "Resource Type", "Resource Name", "IP Address", "Timestamp", "Description"];
    const rows = logs.map((log) => [
      log.user?.username || "System",
      log.action,
      log.resource_type,
      log.resource_name || "-",
      log.ip_address || "-",
      new Date(log.created_at).toLocaleString("id-ID"),
      log.description || "-"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headersCSV.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activity_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearLogs = async () => {
    const confirm = await alertConfirm(
      "Apakah Anda yakin ingin menghapus seluruh log aktivitas?",
      "Tindakan ini akan membersihkan data riwayat aktivitas dan tidak dapat dibatalkan."
    );
    if (!confirm) return;

    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const res = await createApiCall({
        url: "/activity-logs/clear?type=general",
        method: "DELETE",
        headers,
      });

      await alertSuccess(res?.message || "Log aktivitas berhasil dibersihkan!");
      setPage(1);
      fetchLogs();
    } catch (err: any) {
      console.error(err);
      await alertError(err?.response?.data?.message || "Gagal membersihkan log aktivitas.");
    }
  };

  const getActionBadgeColor = (act: string) => {
    switch (act) {
      case "login":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "logout":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "create":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "update":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "delete":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-[#035a70] w-7 h-7" />
            Audit Log & Aktivitas
          </h1>
          <p className="text-gray-500 text-sm">
            Riwayat log sistem untuk melacak login dan manipulasi data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Ekspor CSV
          </button>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            Bersihkan Log
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 text-sm font-semibold">
              <span>Aksi Hari Ini</span>
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded"><Activity className="w-4 h-4" /></span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{stats.total_today}</h2>
            <div className="text-[10px] text-gray-400 mt-1">Minggu ini: {stats.total_week}</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 text-sm font-semibold">
              <span>Logins Hari Ini</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded"><Key className="w-4 h-4" /></span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{stats.logins_today}</h2>
            <div className="text-[10px] text-gray-400 mt-1">Otentikasi berhasil</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 text-sm font-semibold">
              <span>User Paling Aktif</span>
              <span className="p-1.5 bg-yellow-50 text-yellow-600 rounded"><Users className="w-4 h-4" /></span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-2 truncate">
              {stats.most_active_user ? stats.most_active_user.username : "-"}
            </h2>
            <div className="text-[10px] text-gray-400 mt-1">
              {stats.most_active_user ? `${stats.most_active_user.count} aksi dilakukan` : ""}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 text-sm font-semibold">
              <span>Sumber Terpopuler</span>
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded"><FileText className="w-4 h-4" /></span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-2 truncate">
              {stats.most_modified_resource ? stats.most_modified_resource.resource_type : "-"}
            </h2>
            <div className="text-[10px] text-gray-400 mt-1">
              {stats.most_modified_resource ? `${stats.most_modified_resource.count} kali dimodifikasi` : ""}
            </div>
          </div>
        </div>
      )}

      {/* Filters and List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1 relative">
            <label className="text-xs font-semibold text-gray-500">Cari Resource</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nama resource/user..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-[#035a70]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Pengguna</label>
            <select
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
            >
              <option value="">Semua User</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Tindakan (Action)</label>
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
            >
              <option value="">Semua Aksi</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create (Buat)</option>
              <option value="update">Update (Ubah)</option>
              <option value="delete">Delete (Hapus)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Tipe Resource</label>
            <select
              value={resourceType}
              onChange={(e) => { setResourceType(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
            >
              <option value="">Semua Tipe</option>
              <option value="User">User</option>
              <option value="Student">Student (Siswa)</option>
              <option value="Company">Company (Industri)</option>
              <option value="Internship">Internship (Magang)</option>
              <option value="Award">Award (Penghargaan)</option>
              <option value="PreInternshipClass">PreInternshipClass (Kelas)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Mulai Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
            />
          </div>
        </div>

        {/* Table List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 text-[#035a70] animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <th className="py-3 px-6 font-bold">User</th>
                    <th className="py-3 px-6 font-bold text-center">Tindakan</th>
                    <th className="py-3 px-6 font-bold">Jenis Resource</th>
                    <th className="py-3 px-6 font-bold">Nama Resource</th>
                    <th className="py-3 px-6 font-bold">IP & Browser</th>
                    <th className="py-3 px-6 font-bold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/30">
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-gray-700 block">{log.user?.username || "System"}</span>
                          <span className="text-[10px] text-gray-400">{log.user?.email || "-"}</span>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-gray-600 font-medium">
                          {log.resource_type}
                        </td>
                        <td className="py-3.5 px-6 text-gray-700 font-semibold truncate max-w-xs">
                          {log.resource_name || "-"}
                        </td>
                        <td className="py-3.5 px-6 text-gray-500">
                          <span className="block font-medium text-xs">{log.ip_address || "-"}</span>
                          <span className="text-[9px] block text-gray-400 max-w-[150px] truncate" title={log.user_agent || ""}>
                            {log.user_agent || "-"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-gray-500 text-xs">
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        Tidak ada log aktivitas ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">Halaman {page} dari {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
