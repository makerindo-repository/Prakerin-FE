"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import {
  Sparkles,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BrainCircuit
} from "lucide-react";
import useDebounce from "@/hooks/useDebounce";

interface ActivityLogData {
  id: string;
  user: { username: string; email: string };
  action: string;
  resource_type: string;
  resource_name: string | null;
  description: string | null;
  created_at: string;
}

const AI_RESOURCE_TYPES = [
  "CVGenerator",
  "AiAnalytic",
  "JobOpening", // from AI Search
  "TestScenarioAI",
  "ReportAI"
];

const getResourceName = (type: string) => {
  switch (type) {
    case "CVGenerator": return "AI Smart CV Generator";
    case "AiAnalytic": return "AI CV Analyzer";
    case "JobOpening": return "AI Job Search";
    case "TestScenarioAI": return "AI Test Scenario";
    case "ReportAI": return "AI Report Generator";
    default: return type;
  }
};

export default function AILogsPage() {
  const [logs, setLogs] = useState<ActivityLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      
      let url = `/activity-logs?page=${page}&limit=15`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      
      if (resourceTypeFilter) {
        url += `&resource_type=${resourceTypeFilter}`;
      } else {
        // Send array of resource types
        AI_RESOURCE_TYPES.forEach(type => {
          url += `&resource_type[]=${type}`;
        });
      }

      const res = await createApiCall({ url, headers });
      setLogs(res?.data || []);
      setTotalPages(res?.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, debouncedSearch, resourceTypeFilter, startDate, endDate]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <BrainCircuit size={28} className="animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas AI</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Pantau seluruh aktivitas penggunaan fitur Kecerdasan Buatan (AI) oleh pengguna.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-sm border border-indigo-200"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Segarkan Data
        </button>
      </div>

      {/* Filters section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cari Pengguna / Deskripsi</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Ketik kata kunci..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fitur AI</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={resourceTypeFilter}
              onChange={(e) => {
                setResourceTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="">Semua Fitur AI</option>
              {AI_RESOURCE_TYPES.map(type => (
                <option key={type} value={type}>{getResourceName(type)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-5 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-semibold">Nama Pengguna</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
                <th className="px-6 py-4 font-semibold">Fitur / Lokasi</th>
                <th className="px-6 py-4 font-semibold">Waktu</th>
                <th className="px-6 py-4 font-semibold">Info Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="animate-spin text-indigo-500" size={20} />
                      <span>Memuat data AI log...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Sparkles className="mx-auto mb-2 opacity-50" size={32} />
                    <p>Tidak ada log aktivitas AI yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {log.user?.username || "Sistem / User Tidak Diketahui"}
                      </div>
                      <div className="text-xs text-gray-500">{log.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-indigo-600 font-medium text-sm">
                        <BrainCircuit size={14} />
                        {getResourceName(log.resource_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs break-words">
                        {log.description || "-"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Halaman <span className="font-medium text-gray-800">{page}</span> dari <span className="font-medium text-gray-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
