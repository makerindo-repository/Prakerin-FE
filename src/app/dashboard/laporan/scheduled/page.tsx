"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import {
  Clock,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface ScheduledReportData {
  id: string;
  type: "internship_stats" | "student_progress" | "company_performance";
  frequency: "daily" | "weekly" | "monthly";
  email_recipients: string[];
  last_sent_at: string | null;
  is_active: boolean;
}

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"internship_stats" | "student_progress" | "company_performance">("internship_stats");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [recipientsInput, setRecipientsInput] = useState("");

  const fetchScheduledReports = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const res = await createApiCall({
        url: "/scheduled-reports",
        headers
      });
      setReports(res?.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat daftar jadwal laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    // Validate email addresses
    const emails = recipientsInput
      .split(",")
      .map((em) => em.trim())
      .filter((em) => em !== "");

    if (emails.length === 0) {
      setError("Masukkan setidaknya satu email penerima.");
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmail = emails.find((em) => !emailRegex.test(em));
    if (invalidEmail) {
      setError(`Format email tidak valid: ${invalidEmail}`);
      setSubmitting(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: "/scheduled-reports",
        method: "POST",
        headers,
        data: {
          type: reportType,
          frequency,
          email_recipients: emails
        }
      });

      setMessage("Jadwal laporan otomatis berhasil dibuat!");
      setIsModalOpen(false);
      setRecipientsInput("");
      fetchScheduledReports();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal membuat jadwal laporan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: `/scheduled-reports/${id}`,
        method: "PATCH",
        headers,
        data: {
          is_active: !currentStatus
        }
      });
      fetchScheduledReports();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal laporan ini?")) return;
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: `/scheduled-reports/${id}`,
        method: "DELETE",
        headers
      });
      fetchScheduledReports();
    } catch (err) {
      console.error("Failed to delete scheduled report", err);
    }
  };

  const handleRunNow = async (id: string) => {
    setMessage(null);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const res = await createApiCall({
        url: `/scheduled-reports/${id}/run-now`,
        method: "POST",
        headers
      });
      setMessage("Laporan berhasil dipicu dan dikirim sekarang!");
      fetchScheduledReports();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memicu laporan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/laporan" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="text-[#035a70] w-7 h-7" />
              Laporan Terjadwal
            </h1>
            <p className="text-gray-500 text-sm">
              Atur pengiriman statistik prakerin otomatis ke email rekan kerja atau pimpinan.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Jadwal Baru
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* List Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <RefreshCw className="w-8 h-8 text-[#035a70] animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-6 font-bold">Jenis Laporan</th>
                  <th className="py-3.5 px-6 font-bold">Frekuensi</th>
                  <th className="py-3.5 px-6 font-bold">Penerima Email</th>
                  <th className="py-3.5 px-6 font-bold">Terakhir Dikirim</th>
                  <th className="py-3.5 px-6 font-bold text-center">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-6 font-semibold text-gray-700">
                        {report.type === "internship_stats"
                          ? "Statistik Magang"
                          : report.type === "student_progress"
                          ? "Progress Siswa"
                          : "Kinerja Perusahaan"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                          {report.frequency}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">
                        <div className="flex flex-wrap gap-1">
                          {report.email_recipients.map((email, index) => (
                            <span key={index} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {email}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {report.last_sent_at
                          ? new Date(report.last_sent_at).toLocaleString("id-ID")
                          : "Belum pernah"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleStatus(report.id, report.is_active)}
                          className="focus:outline-none transition-colors"
                        >
                          {report.is_active ? (
                            <ToggleRight className="w-10 h-6 text-[#035a70] cursor-pointer" />
                          ) : (
                            <ToggleLeft className="w-10 h-6 text-gray-300 cursor-pointer" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleRunNow(report.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg transition-all"
                          title="Kirim Sekarang"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Kirim
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      Belum ada jadwal laporan otomatis yang dibuat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-zoomIn">
            <div className="bg-[#035a70] text-white p-5">
              <h3 className="text-lg font-bold">Buat Jadwal Laporan Otomatis</h3>
              <p className="text-white/80 text-xs mt-1">Laporan akan dibuat dan dikirim berkala.</p>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Jenis Laporan</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                >
                  <option value="internship_stats">Statistik Magang (Internship Stats)</option>
                  <option value="student_progress">Progress Siswa (Student Progress)</option>
                  <option value="company_performance">Kinerja Perusahaan (Company Performance)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Frekuensi Pengiriman</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                >
                  <option value="daily">Setiap Hari (Daily)</option>
                  <option value="weekly">Setiap Minggu (Weekly)</option>
                  <option value="monthly">Setiap Bulan (Monthly)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Penerima Email</label>
                <textarea
                  placeholder="Contoh: bos@prakerin.id, admin@prakerin.id"
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm h-24 resize-none focus:outline-none focus:border-[#035a70]"
                  required
                />
                <span className="text-[10px] text-gray-400">Pisahkan beberapa email dengan tanda koma ( , )</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#035a70] text-white hover:bg-[#035a70]/90 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
