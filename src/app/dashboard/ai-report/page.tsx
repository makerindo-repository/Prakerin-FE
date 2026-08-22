"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Copy,
  Lock,
  ClipboardList,
  ClipboardCheck,
} from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { createApiCall } from "@/utils/config";
import { alertError, alertSuccess, alertInfo } from "@/libs/alert";
import { useAuthStore } from "@/stores/authStore";
import { LockedFeature } from "@/components/LockedFeature";

interface AiReportData {
  summary: string;
  insights: string[];
  recommendations: string[];
}

function AiReportPageInner() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AiReportData | null>(null);
  const role = useAuthStore((s) => s.role);
  const [checkingTasks, setCheckingTasks] = useState(true);
  const [completedTasksCount, setCompletedTasksCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        const token = Cookies.get("userToken");
        if (!token) return;
        const res = await createApiCall({
          url: "/tasks?status=completed&limit=1",
          headers: { Authorization: `Bearer ${token}` },
        });
        const total = typeof res?.total === "number" ? res.total : (Array.isArray(res?.data) ? res.data.length : 0);
        setCompletedTasksCount(total);
      } catch (err) {
        console.error("Failed to check completed tasks:", err);
        setCompletedTasksCount(0);
      } finally {
        setCheckingTasks(false);
      }
    };

    fetchTaskStatus();
  }, []);

  const generateReport = async () => {
    if (completedTasksCount === 0) {
      alertInfo("Fitur AI Report Dinonaktifkan: Anda harus menyelesaikan minimal 1 tugas magang terlebih dahulu.");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const response = await createApiCall({
        url: "/reports/ai-summary",
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      if (response && response.success && response.data) {
        setReport(response.data);
        alertSuccess("Laporan AI berhasil dibuat!");
      } else {
        if (response && response.message) {
          alertError(response.message);
        }
      }
    } catch (err: any) {
      console.error(err);
      alertError(err?.response?.data?.message || "Terjadi kesalahan saat memproses laporan AI.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    const text = `
LAPORAN ANALISIS SISTEM PRAKERIN.ID (AI GENERATED)
==================================================

RINGKASAN:
${report.summary}

INSIGHTS/WAWASAN UTAMA:
${report.insights.map((ins, idx) => `${idx + 1}. ${ins}`).join("\n")}

REKOMENDASI:
${report.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join("\n")}
    `;
    navigator.clipboard.writeText(text);
    alertSuccess("Laporan berhasil disalin ke clipboard!");
  };

  const formatSummaryHtml = (text: string) => {
    if (!text) return "";
    return text
      .split(/\n\s*\n/)
      .map((p) => `<p style="margin-bottom: 16px; line-height: 1.6;">${p.trim().replace(/\n/g, "<br/>")}</p>`)
      .join("");
  };

  const printPdf = () => {
    if (!report) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan AI - Prakerin.id</title>
        <style>
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #1f2937; }
          .header { display: flex; align-items: center; border-bottom: 2px solid #035a70; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #035a70; }
          .subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
          h1 { font-size: 20px; font-weight: 800; color: #111827; margin-top: 0; }
          h2 { font-size: 16px; font-weight: 700; color: #035a70; margin-top: 30px; margin-bottom: 12px; }
          p { font-size: 14px; margin-bottom: 16px; white-space: pre-line; }
          ul { margin: 0 0 20px 20px; padding: 0; }
          li { font-size: 14px; margin-bottom: 8px; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Prakerin.id AI Core</div>
            <div class="subtitle">Laporan Analisis Eksekutif Otomatis • ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        
        <h2>Ringkasan Eksekutif & Format Laporan</h2>
        <div>${formatSummaryHtml(report.summary)}</div>
        
        <h2>Wawasan Utama (Insights)</h2>
        <ul>
          ${report.insights.map(ins => `<li>${ins}</li>`).join('')}
        </ul>
        
        <h2>Rekomendasi Tindakan</h2>
        <ul>
          ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
        
        <div class="footer">
          Dihasilkan secara otomatis oleh sistem Prakerin.id menggunakan Google Gemini AI.
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-xs sm:text-sm text-gray-400 font-medium tracking-wider uppercase">AI Core</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="p-2.5 bg-gradient-to-tr from-[#035a70] to-[#04829e] rounded-xl text-white shadow-md shadow-[#035a70]/10">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                AI Report
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Hasilkan laporan eksekutif otomatis berdasarkan log aktivitas dan data interaksi pengguna di sistem.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TASK CHECK LOADING STATE ─── */}
      {checkingTasks && (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#035a70] mx-auto" />
          <p className="text-sm text-gray-500">Memeriksa kelayakan data magang...</p>
        </div>
      )}

      {/* ─── DISABLED STATE: 0 COMPLETED TASKS ─── */}
      {!checkingTasks && completedTasksCount === 0 && (
        <div className="bg-white border border-amber-200 rounded-3xl p-10 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Fitur Dinonaktifkan Sementara</span>
            </div>
            <h3 className="text-xl font-black text-gray-800">Belum Ada Tugas yang Selesai</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Fitur AI Report memerlukan data dari tugas magang yang telah Anda selesaikan untuk menghasilkan analisis evaluasi performa. Saat ini Anda memiliki <strong className="text-gray-900">0 tugas yang selesai</strong>.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/dashboard/tasklist"
              className="px-6 py-3 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              Buka Daftar Tugas
            </Link>
          </div>
        </div>
      )}

      {/* ─── GENERATE TRIGGER PANEL ─── */}
      {!checkingTasks && completedTasksCount !== 0 && !report && !loading && (
        <div className="bg-white border border-gray-150 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#035a70]/10 to-[#04829e]/10 text-[#035a70] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-800">Hasilkan Laporan Analitik AI Baru</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Tekan tombol di bawah untuk meminta Gemini AI menganalisis riwayat aktivitas sistem, melacak performa magang, dan merangkum kendala sistem secara otomatis.
            </p>
          </div>
          <button
            onClick={generateReport}
            className="px-6 py-3 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-xl text-sm font-extrabold transition-all hover:shadow-lg hover:shadow-[#035a70]/15 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Hasilkan Sekarang
          </button>
        </div>
      )}

      {/* ─── LOADING STATE ─── */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-14 h-14 animate-spin text-[#035a70]" />
            <FileText className="w-6 h-6 text-[#035a70] absolute animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-800">Sedang Menganalisis Log Sistem...</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Membaca log aktivitas terbaru, melacak event CRUD, dan mengagregasikan metrik keaktifan siswa. Proses ini memerlukan waktu beberapa detik.
            </p>
          </div>
        </div>
      )}

      {/* ─── REPORT OUTPUT DISPLAY ─── */}
      {report && (
        <div className="space-y-8">
          {/* 1: Summary Card (Full Width) */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#035a70]" />
              Ringkasan Analisis Eksekutif & Format Laporan
            </h3>
            <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap space-y-4">
              {report.summary}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-50 border border-gray-150 rounded-2xl p-4 shadow-sm">
            <button
              onClick={copyToClipboard}
              className="px-5 py-2.5 bg-white border border-gray-250 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Copy className="w-4 h-4" />
              Salin Laporan
            </button>
            <button
              onClick={printPdf}
              className="px-5 py-2.5 bg-white border border-gray-250 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Cetak / PDF
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
            <button
              onClick={generateReport}
              className="px-6 py-2.5 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              Perbarui Laporan (AI)
            </button>
          </div>

          {/* 1/1: Side by side columns for Insights and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Insights Panel */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Wawasan Utama (Insights)
              </h3>
              <div className="space-y-3">
                {report.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-gray-700 leading-normal">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations Panel */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
                <AlertCircle className="w-4 h-4 text-[#035a70]" />
                Rekomendasi Tindakan
              </h3>
              <div className="space-y-3">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-teal-50/30 rounded-xl border border-teal-100/50">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-gray-700 leading-normal">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AiReportPage() {
  const studentId = useAuthStore((s) => s.studentId);
  return (
    <LockedFeature featureName="AI Report" studentId={studentId}>
      <AiReportPageInner />
    </LockedFeature>
  );
}