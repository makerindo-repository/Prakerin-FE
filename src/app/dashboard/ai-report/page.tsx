"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Download,
  Copy
} from "lucide-react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import { alertError, alertSuccess } from "@/libs/alert";

interface AiReportData {
  summary: string;
  insights: string[];
  recommendations: string[];
}

export default function AiReportPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AiReportData | null>(null);

  const generateReport = async () => {
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

        {report && (
          <div className="flex gap-2.5">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              Salin Laporan
            </button>
          </div>
        )}
      </div>

      {/* ─── GENERATE TRIGGER PANEL ─── */}
      {!report && !loading && (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Summary Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#035a70]" />
                Ringkasan Analisis Eksekutif
              </h3>
              <div className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
                {report.summary}
              </div>
            </div>
          </div>

          {/* Sidebar Insights & Recommendations */}
          <div className="space-y-6">
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
            
            <button
              onClick={generateReport}
              className="w-full py-3.5 bg-gradient-to-r from-[#035a70] to-[#04829e] hover:opacity-90 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Perbarui Laporan (AI)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
