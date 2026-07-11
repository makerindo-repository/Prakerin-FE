"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Brain,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Award,
  FileText,
  Loader2,
  Building2,
  MapPin,
  Trash2,
  History,
  Eye,
  FileCheck2,
  Compass,
  ArrowLeft,
  Settings
} from "lucide-react";
import Cookies from "js-cookie";
import { createApiCall, API } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm } from "@/libs/alert";

interface ProfileSummary {
  name: string;
  education: string;
  skills: string[];
  strengths: string[];
}

interface Recommendation {
  job_opening_id: string | null;
  title: string;
  company_name: string;
  match_score: number;
  reasoning: string;
  is_general_recommendation: boolean;
}

interface AnalysisResult {
  profile_summary: ProfileSummary;
  recommendations: Recommendation[];
  improvement_suggestions: string[];
}

interface AiAnalyticRecord {
  id: string;
  file_name: string;
  file_path: string;
  analysis_result: AnalysisResult;
  created_at: string;
}

export default function AiAnalyticsPage() {
  const [latestAnalysis, setLatestAnalysis] = useState<AiAnalyticRecord | null>(null);
  const [history, setHistory] = useState<AiAnalyticRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMsg, setScanStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
  const [dragOver, setDragOver] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch latest analysis
  const fetchLatest = useCallback(async () => {
    try {
      const response = await createApiCall({
        url: "/ai-analytics/latest",
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      // Response structure: { data: AiAnalyticRecord }
      if (response && response.data) {
        setLatestAnalysis(response.data);
      } else {
        setLatestAnalysis(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch latest AI analysis", err);
    }
  }, []);

  // Fetch scan history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await createApiCall({
        url: "/ai-analytics",
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response && response.data) {
        setHistory(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch AI analysis history", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLatest();
      await fetchHistory();
      setLoading(false);
    };
    init();
  }, [fetchLatest, fetchHistory]);

  // Handle Drag Over & Leave
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Process selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        alertError("File harus berupa PDF!");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        alertError("File harus berupa PDF!");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Upload and scan resume
  const handleStartScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setScanProgress(5);
    setScanStatusMsg("Membaca file resume...");
    setApiKeyMissing(false);

    // Simulate progress while uploading/calling API
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 30) {
          setScanStatusMsg("Mengekstrak informasi profil...");
          return prev + 5;
        } else if (prev < 60) {
          setScanStatusMsg("Menganalisis keterampilan & kualifikasi...");
          return prev + 3;
        } else if (prev < 90) {
          setScanStatusMsg("Mencocokkan dengan lowongan magang aktif...");
          return prev + 2;
        } else {
          setScanStatusMsg("Menyelesaikan rekomendasi karir...");
          return prev;
        }
      });
    }, 1000);

    const formData = new FormData();
    formData.append("uploaded_file", selectedFile);

    try {
      const res = await API.post("/api/v1/ai-analytics", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const response = res.data;

      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStatusMsg("Analisis Selesai!");

      if (response && response.data) {
        alertSuccess("Analisis CV Berhasil!");
        setLatestAnalysis(response.data);
        setSelectedFile(null);
        await fetchHistory();
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      
      const errMsg = err.response?.data?.message || "Terjadi kesalahan saat memproses data.";
      const errType = err.response?.data?.error_type;

      if (errType === "missing_api_key" || err.response?.status === 500 && errMsg.includes("GEMINI_API_KEY")) {
        setApiKeyMissing(true);
      } else {
        alertError(errMsg);
      }
    } finally {
      setScanning(false);
      setScanProgress(0);
      setScanStatusMsg("");
    }
  };

  // Delete history item
  const handleDelete = async (id: string) => {
    const confirm = await alertConfirm("Apakah Anda yakin ingin menghapus riwayat analisis ini?");
    if (!confirm) return;

    try {
      await createApiCall({
        url: `/ai-analytics/${id}`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      alertSuccess("Riwayat berhasil dihapus.");
      
      // If we deleted the active view, fetch latest again
      if (latestAnalysis?.id === id) {
        await fetchLatest();
      }
      await fetchHistory();
    } catch (err: any) {
      alertError("Gagal menghapus riwayat.");
    }
  };

  // View historical scan
  const handleViewHistoryItem = (item: AiAnalyticRecord) => {
    setLatestAnalysis(item);
    setActiveTab("dashboard");
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#035a70]" />
        <p className="text-sm font-medium text-gray-500">Memuat analisis AI...</p>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xs sm:text-sm text-gray-400 font-medium tracking-wider uppercase">AI Core</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="p-2.5 bg-gradient-to-tr from-[#035a70] to-[#04829e] rounded-xl text-white shadow-md shadow-[#035a70]/10">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                AI Analytics & Rekomendasi Magang
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Unggah CV PDF Anda dan biarkan Gemini AI merekomendasikan lowongan magang yang paling sesuai untuk Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl shrink-0 self-start md:self-center">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-[#035a70] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Compass className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "history"
                ? "bg-[#035a70] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat Scan ({history.length})
          </button>
        </div>
      </div>

      {/* ─── API KEY MISSING WARNING ─── */}
      {apiKeyMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-5 items-start">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <Settings className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-amber-800">Gemini API Key Belum Dikonfigurasi</h3>
            <p className="text-sm text-amber-700 leading-relaxed">
              Layanan AI Analytics memerlukan API Key Gemini untuk membaca dan menganalisis file resume.
            </p>
            <div className="bg-white border border-amber-100 rounded-xl p-4 text-xs font-mono text-gray-700 space-y-2 max-w-2xl mt-3">
              <p className="font-bold text-amber-800 mb-1">💡 Cara Mengonfigurasi:</p>
              <p>1. Dapatkan kunci API gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#035a70] underline font-bold">Google AI Studio</a>.</p>
              <p>2. Buka file <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> di dalam folder backend proyek Anda (<code className="bg-gray-100 px-1 py-0.5 rounded">Prakerin-BE</code>).</p>
              <p>3. Tambahkan baris konfigurasi berikut dan simpan file:</p>
              <p className="bg-amber-50/50 p-2 border-l-2 border-amber-500 text-amber-900 select-all font-bold">GEMINI_API_KEY=Kunci_API_Anda_Disini</p>
            </div>
            <button
              onClick={() => setApiKeyMissing(false)}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Saya sudah menambahkannya, coba lagi
            </button>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ACCORDING TO TABS ─── */}
      {activeTab === "dashboard" ? (
        <div className="space-y-6">
          
          {/* ──── SCANNING STATE PROGRESS BAR ──── */}
          {scanning && (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-[#035a70]" />
                <Brain className="w-7 h-7 text-[#035a70] absolute animate-pulse" />
              </div>
              <div className="space-y-2 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-800">Gemini AI Sedang Menganalisis...</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{scanStatusMsg}</p>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3">
                  <div 
                    className="bg-[#035a70] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──── NO ANALYSIS EXIST OR START NEW SCAN (UPLOADER VIEW) ──── */}
          {!latestAnalysis && !scanning && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left description */}
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  Bagaimana Cara Kerjanya?
                </h3>
                <ol className="space-y-4 text-sm text-gray-600 list-decimal pl-4">
                  <li>
                    <span className="font-semibold text-gray-800">Unggah Resume PDF</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload CV Anda dalam format PDF. Pastikan CV berisi riwayat pendidikan, keterampilan, dan pengalaman Anda.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold text-gray-800">Analisis Model Gemini</span>
                    <p className="text-xs text-gray-500 mt-1">
                      AI Gemini akan membaca isi resume Anda secara mendalam untuk mengidentifikasi keterampilan teknis dan soft skills Anda.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold text-gray-800">Kesesuaian Otomatis</span>
                    <p className="text-xs text-gray-500 mt-1">
                      AI membandingkan profil Anda dengan semua lowongan magang yang aktif dan memberikan persentase kecocokan beserta argumen logisnya.
                    </p>
                  </li>
                </ol>
                <div className="bg-teal-50/50 p-4 border-l-2 border-[#035a70] rounded-r-xl">
                  <p className="text-xs text-[#035a70] font-medium leading-relaxed">
                    💡 <strong>Tips:</strong> Pastikan PDF Anda tidak dikunci dengan password dan teks di dalam PDF dapat disalin (bukan berupa gambar murni scan) agar hasil analisis maksimal.
                  </p>
                </div>
              </div>

              {/* Right Uploader */}
              <div className="lg:col-span-2 space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`bg-white border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] ${
                    dragOver 
                      ? "border-[#035a70] bg-[#035a70]/5" 
                      : selectedFile 
                      ? "border-emerald-500 bg-emerald-50/10" 
                      : "border-gray-300 hover:border-[#035a70]"
                  }`}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-100 text-emerald-700 rounded-full inline-block">
                        <FileCheck2 className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{selectedFile.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          File PDF terpilih • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Ganti File
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartScan();
                          }}
                          className="px-5 py-2 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-xl text-xs font-bold shadow-md shadow-[#035a70]/10 flex items-center gap-2 transition-colors"
                        >
                          <Brain className="w-4 h-4" />
                          Mulai Analisis
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 text-gray-400 rounded-full inline-block group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-10 h-10 text-[#035a70]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">Pilih atau Seret CV Anda Ke Sini</h4>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Hanya menerima dokumen berformat PDF (Maksimal 10MB)
                        </p>
                      </div>
                      <button
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Pilih File PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──── REPORT PANEL (ACTIVE ANALYSIS REPORT VIEW) ──── */}
          {latestAnalysis && !scanning && (
            <div className="space-y-6">
              
              {/* Resume Source Banner */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 px-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{latestAnalysis.file_name}</h4>
                    <p className="text-xs text-gray-400">Dianalisis pada {formatDate(latestAnalysis.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLatestAnalysis(null)}
                  className="px-4 py-2 border border-gray-300 hover:border-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold text-gray-600 transition-colors flex items-center gap-2 self-end sm:self-auto"
                >
                  <UploadCloud className="w-4 h-4" />
                  Ulangi Scan Baru
                </button>
              </div>

              {/* Analytics Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left column: Profile summary */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Candidate summary card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-gray-800 font-bold">
                      <GraduationCap className="w-5 h-5 text-[#035a70]" />
                      <h3>Ringkasan Profil Kandidat</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Nama Lengkap</span>
                        <p className="text-sm font-bold text-gray-800">{latestAnalysis.analysis_result.profile_summary.name || "Tidak Terdeteksi"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Pendidikan</span>
                        <p className="text-sm font-medium text-gray-700">{latestAnalysis.analysis_result.profile_summary.education || "Tidak Terdeteksi"}</p>
                      </div>
                    </div>

                    {/* Detected Skills */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Keahlian Utama (Skills)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {latestAnalysis.analysis_result.profile_summary.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Detected Strengths */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Kekuatan / Kompetensi</span>
                      <div className="space-y-1.5">
                        {latestAnalysis.analysis_result.profile_summary.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations tips / improvements suggestions */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-gray-800 font-bold">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h3>Rencana Pengembangan Diri</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {latestAnalysis.analysis_result.improvement_suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
                          <span className="h-5 w-5 bg-amber-50 rounded-full flex items-center justify-center font-bold text-[10px] text-amber-700 shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right column: Recommendation list */}
                <div className="lg:col-span-2 space-y-6">
                  
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="border-b border-gray-100 pb-4 mb-5">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        Rekomendasi Lowongan Magang
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Berikut adalah daftar lowongan magang yang paling sesuai dengan kualifikasi pada CV Anda.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {latestAnalysis.analysis_result.recommendations.map((rec, index) => {
                        const isMatchedVacancy = rec.job_opening_id && !rec.is_general_recommendation;

                        return (
                          <div 
                            key={index} 
                            className={`border rounded-xl p-5 hover:border-gray-300 transition-all ${
                              isMatchedVacancy ? "bg-white border-gray-200" : "bg-gray-50/50 border-gray-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              {/* Left details */}
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-extrabold text-gray-800 text-base leading-tight">
                                    {rec.title}
                                  </h4>
                                  {!isMatchedVacancy && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                      AI Tipe Umum
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {rec.company_name}
                                  </span>
                                  {isMatchedVacancy && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5" />
                                      Prakerin Database
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-gray-600 leading-relaxed pt-1.5">
                                  {rec.reasoning}
                                </p>
                              </div>

                              {/* Right Match Score Gauge */}
                              <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-5">
                                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                  {/* Score Ring SVG */}
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="26"
                                      className="stroke-gray-100 fill-none"
                                      strokeWidth="4"
                                    />
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="26"
                                      className="stroke-[#035a70] fill-none transition-all duration-1000"
                                      strokeWidth="4"
                                      strokeDasharray={2 * Math.PI * 26}
                                      strokeDashoffset={2 * Math.PI * 26 * (1 - rec.match_score / 100)}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <span className="absolute text-sm font-bold text-gray-800">{rec.match_score}%</span>
                                </div>

                                {isMatchedVacancy ? (
                                  <a 
                                    href={`/dashboard/lowongan/${rec.job_opening_id}`}
                                    className="px-4 py-1.5 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
                                  >
                                    Lamar
                                    <ArrowRight className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <a 
                                    href="/dashboard/lowongan"
                                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                                  >
                                    Cari Lowongan
                                    <ArrowRight className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      ) : (
        /* Riwayat Scan Tab */
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-5">
            <h3 className="text-lg font-bold text-gray-800">Riwayat Analisis CV Anda</h3>
            <p className="text-xs text-gray-500 mt-1">
              Semua dokumen CV yang pernah diunggah beserta hasil analisis rekomendasinya dapat dilihat kembali di bawah ini.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-16 space-y-3">
              <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-gray-700 text-base">Belum Ada Riwayat Analisis</h4>
              <p className="text-xs text-gray-500 max-w-sm">
                Mulai unggah CV Anda di tab Dashboard untuk mendapatkan rekomendasi karir cerdas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-bold">Dokumen CV</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Tanggal Analisis</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Keahlian Terdeteksi</th>
                    <th scope="col" className="px-6 py-3.5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="truncate max-w-[200px]" title={item.file_name}>{item.file_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.analysis_result.profile_summary.skills.slice(0, 3).map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                          {item.analysis_result.profile_summary.skills.length > 3 && (
                            <span className="text-[9px] text-gray-400 font-bold px-1 py-0.5">
                              +{item.analysis_result.profile_summary.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewHistoryItem(item)}
                            className="p-1.5 border border-gray-200 hover:border-[#035a70] hover:text-[#035a70] rounded-lg transition-colors bg-white"
                            title="Tampilkan di Dashboard"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/v1/ai-analytics/${item.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 border border-gray-200 hover:border-[#035a70] hover:text-[#035a70] rounded-lg transition-colors bg-white flex items-center justify-center"
                            title="Unduh PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 border border-gray-200 hover:border-red-200 hover:text-red-500 rounded-lg transition-colors bg-white"
                            title="Hapus Riwayat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
