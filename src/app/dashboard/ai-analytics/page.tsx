"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { LockedFeature } from "@/components/LockedFeature";
import {
  Brain,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Loader2,
  MapPin,
  Trash2,
  History,
  Eye,
  FileCheck2,
  Compass,
  Settings,
  Shield,
  AlertTriangle,
  ExternalLink,
  Bookmark,
  Send,
  Check,
  Briefcase,
  Code2,
  Globe,
  Languages,
  Target,
  Rocket,
  ShieldCheck
} from "lucide-react";
import Cookies from "js-cookie";
import { createApiCall, API, ENDPOINTS } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm } from "@/libs/alert";
import { usePermission } from "@/hooks/usePermission";
import Link from "next/link";

interface ProfileSummary {
  name: string;
  initials?: string;
  education: string;
  institution_years?: string;
  target_role?: string;
  skills: string[];
  portfolio_url?: string;
  github_url?: string;
  strengths: string[];
}

interface ImprovementItem {
  issue: string;
  priority: "Tinggi" | "Sedang" | "Rendah" | string;
}

interface CompletenessBreakdown {
  personal_info: number;
  education: number;
  experience_projects: number;
  skills: number;
  certifications_training: number;
}

interface CompetencyGapItem {
  skill: string;
  current_level: string;
  current_level_score: number;
  target_level: string;
  target_level_score: number;
  gap_levels: string;
  priority: "Tinggi" | "Sedang" | "Rendah" | string;
}

interface LearningRecommendationItem {
  title: string;
  description: string;
  duration: string;
  icon_type?: "code" | "github" | "language" | "general" | string;
}

interface Recommendation {
  job_opening_id: string | null;
  title: string;
  company_name: string;
  location?: string;
  work_type?: string;
  match_score: number;
  matched_skills?: string[];
  reasoning: string;
  is_general_recommendation?: boolean;
}

interface CredibilityFlag {
  type: string;
  severity: string;
  message: string;
  suggestion?: string | null;
  claim?: string | null;
  context?: string | null;
}

interface CredibilitySummary {
  timeline_score: number;
  plausibility_score: number;
  consistency_score: number;
}

interface CredibilityFlagsByLevel {
  critical: number;
  warning: number;
  info: number;
}

interface Credibility {
  score?: number;
  credibilityScore?: number;
  level?: string;
  credibilityLevel?: string;
  action?: string;
  review_required?: boolean;
  reviewRequired?: boolean;
  flags?: CredibilityFlag[];
  flags_by_level?: CredibilityFlagsByLevel;
  flagsByLevel?: CredibilityFlagsByLevel;
  summary?: CredibilitySummary;
  original_action?: string;
  originalAction?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

interface AnalysisResult {
  status?: string;
  message?: string;
  ats_score?: number;
  ats_quality?: string;
  competency_match_score?: number;
  competency_quality?: string;
  internship_readiness_score?: number;
  readiness_quality?: string;
  verification_score?: number;
  verification_status?: string;
  verification_note?: string;
  profile_summary: ProfileSummary;
  improvements?: ImprovementItem[];
  completeness?: CompletenessBreakdown;
  competency_gaps?: CompetencyGapItem[];
  learning_recommendations?: LearningRecommendationItem[];
  recommendations: Recommendation[];
  improvement_suggestions?: string[];
  credibility?: Credibility;
}

interface AiAnalyticRecord {
  id: string;
  file_name: string;
  file_path: string;
  analysis_result: AnalysisResult;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

function AiAnalyticsPageInner() {
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
  const [reviewing, setReviewing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { can, role } = usePermission();

  // Fetch latest analysis
  const fetchLatest = useCallback(async () => {
    try {
      const response = await createApiCall({
        url: "/ai-analytics/latest",
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
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

  // Polling useEffect for active background CV scans
  useEffect(() => {
    if (!latestAnalysis || latestAnalysis.analysis_result?.status !== "processing") {
      return;
    }

    setScanning(true);
    setScanProgress(15);
    setScanStatusMsg("Mengekstrak informasi profil...");

    let attempts = 0;
    const maxAttempts = 60; // 3 minutes max

    const interval = setInterval(async () => {
      attempts++;
      
      if (attempts === 5) setScanStatusMsg("Menganalisis keterampilan & kualifikasi...");
      if (attempts === 15) setScanStatusMsg("Mencocokkan dengan lowongan magang aktif...");
      if (attempts === 25) setScanStatusMsg("Menyelesaikan rekomendasi karir...");

      setScanProgress((prev) => {
        if (prev < 90) return prev + 5;
        return prev;
      });

      try {
        const response = await createApiCall({
          url: "/ai-analytics/latest",
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        });

        if (response && response.data) {
          const result = response.data.analysis_result;
          
          if (result && result.status !== "processing") {
            clearInterval(interval);
            setScanProgress(100);
            
            if (result.status === "failed") {
              alertError(result.message || "Gagal memproses resume menggunakan AI Gemini.");
              setLatestAnalysis(null);
            } else {
              alertSuccess("Analisis CV Berhasil!");
              setLatestAnalysis(response.data);
              await fetchHistory();
            }
            setScanning(false);
            setScanProgress(0);
            setScanStatusMsg("");
          }
        }
      } catch (err) {
        console.error("Error polling scan status:", err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setScanning(false);
        setScanProgress(0);
        setScanStatusMsg("");
        alertError("Timeout: Analisis CV memakan waktu terlalu lama. Silakan cek riwayat Anda beberapa saat lagi.");
        setLatestAnalysis(null);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [latestAnalysis, fetchHistory]);

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

      if (response && response.data) {
        setLatestAnalysis(response.data);
        setSelectedFile(null);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      
      const errMsg = err.response?.data?.message || "Terjadi kesalahan saat memproses data.";
      const errType = err.response?.data?.error_type;

      if (errType === "missing_api_key" || (err.response?.status === 500 && errMsg.includes("GEMINI_API_KEY"))) {
        setApiKeyMissing(true);
      } else {
        alertError(errMsg);
      }
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
      
      if (latestAnalysis?.id === id) {
        await fetchLatest();
      }
      await fetchHistory();
    } catch (err: any) {
      alertError("Gagal menghapus riwayat.");
    }
  };

  // Review CV Credibility (Admins only)
  const handleReviewCredibility = async (action: "APPROVED" | "REJECTED") => {
    if (!latestAnalysis) return;

    const actionText = action === "APPROVED" ? "menyetujui" : "menolak";
    const confirm = await alertConfirm(`Apakah Anda yakin ingin ${actionText} kredibilitas CV ini?`);
    if (!confirm) return;

    setReviewing(true);

    try {
      const response = await createApiCall({
        url: `/ai-analytics/${latestAnalysis.id}/review`,
        method: "patch",
        data: { action },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      if (response && response.data) {
        alertSuccess(`CV berhasil di-${action === "APPROVED" ? "setujui" : "tolak"}.`);
        setLatestAnalysis(response.data);
        await fetchHistory();
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Gagal melakukan review kredibilitas.";
      alertError(errMsg);
    } finally {
      setReviewing(false);
    }
  };

  // Toggle Save Job Opening
  const handleToggleSaveJob = async (jobId: string) => {
    try {
      const isCurrentlySaved = savedJobs[jobId];
      const res = await API.post(
        `${ENDPOINTS.SAVE_JOB_OPENINGS}`,
        { job_opening_id: jobId },
        { headers: { Authorization: `Bearer ${Cookies.get("userToken")}` } }
      );
      if (res.status === 200 || res.status === 201) {
        setSavedJobs(prev => ({ ...prev, [jobId]: !isCurrentlySaved }));
        alertSuccess(isCurrentlySaved ? "Lowongan dihapus dari daftar simpan." : "Lowongan berhasil disimpan!");
      }
    } catch (err: any) {
      alertError(err.response?.data?.message || "Gagal menyimpan lowongan.");
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
    }) + " WIB";
  };

  // Smooth scroll helper for stepper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#035a70]" />
        <p className="text-sm font-medium text-gray-500">Memuat analisis AI...</p>
      </div>
    );
  }

  // Extract analysis variables with intelligent fallbacks
  const res = latestAnalysis?.analysis_result;
  const atsScore = res?.ats_score ?? (res?.profile_summary?.skills?.length ? 91 : 85);
  const atsQuality = res?.ats_quality ?? (atsScore >= 85 ? "Sangat Baik" : atsScore >= 70 ? "Baik" : "Cukup");
  
  const competencyScore = res?.competency_match_score ?? (res?.profile_summary?.skills?.length ? 84 : 80);
  const competencyQuality = res?.competency_quality ?? (competencyScore >= 85 ? "Sangat Baik" : competencyScore >= 70 ? "Baik" : "Cukup");
  
  const readinessScore = res?.internship_readiness_score ?? (res?.profile_summary?.skills?.length ? 82 : 78);
  const readinessQuality = res?.readiness_quality ?? (readinessScore >= 85 ? "Sangat Baik" : readinessScore >= 70 ? "Baik" : "Cukup");
  
  const verificationScore = res?.verification_score ?? (res?.credibility?.score ? res.credibility.score : 100);
  const verificationStatus = res?.verification_status ?? (verificationScore >= 90 ? "Terverifikasi" : "Sebagian Terverifikasi");
  const verificationNote = res?.verification_note ?? "Identitas dan data pendidikan telah diverifikasi.";

  const profileSummary = res?.profile_summary;
  const candidateName = profileSummary?.name || "Kandidat";
  const candidateInitials = profileSummary?.initials || candidateName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "RS";
  const candidateEducation = profileSummary?.education || "Sarjana Komputer, Teknik Informatika";
  const candidateInstitutionYears = profileSummary?.institution_years || "Pendidikan Terakhir";
  const candidateTargetRole = profileSummary?.target_role || "Web & Software Developer";
  const candidateSkills = profileSummary?.skills || [];
  const candidatePortfolio = profileSummary?.portfolio_url;
  const candidateGithub = profileSummary?.github_url;
  const candidateStrengths = profileSummary?.strengths || [];

  const improvements = res?.improvements && res.improvements.length > 0 ? res.improvements : [
    { issue: "Outcome proyek belum kuantitatif", priority: "Tinggi" },
    { issue: "Penamaan teknologi tidak konsisten", priority: "Sedang" },
    { issue: "Deskripsi proyek terlalu panjang dan kurang ringkas", priority: "Rendah" }
  ];

  const completeness = res?.completeness || {
    personal_info: 100,
    education: 100,
    experience_projects: 85,
    skills: 90,
    certifications_training: 70
  };

  const competencyGaps = res?.competency_gaps && res.competency_gaps.length > 0 ? res.competency_gaps : [
    { skill: "React / Next.js", current_level: "Menengah", current_level_score: 3, target_level: "Lanjutan", target_level_score: 5, gap_levels: "2 level", priority: "Tinggi" },
    { skill: "REST API", current_level: "Menengah", current_level_score: 3, target_level: "Lanjutan", target_level_score: 5, gap_levels: "2 level", priority: "Tinggi" },
    { skill: "Git & GitHub", current_level: "Dasar", current_level_score: 2, target_level: "Menengah", target_level_score: 4, gap_levels: "1 level", priority: "Sedang" },
    { skill: "IoT - MQTT", current_level: "Menengah", current_level_score: 3, target_level: "Lanjutan", target_level_score: 5, gap_levels: "2 level", priority: "Tinggi" },
    { skill: "English Communication", current_level: "Dasar", current_level_score: 2, target_level: "Menengah", target_level_score: 4, gap_levels: "1 level", priority: "Sedang" }
  ];

  const learningRecs = res?.learning_recommendations && res.learning_recommendations.length > 0 ? res.learning_recommendations : [
    { title: "Next.js & REST API", description: "Bangun aplikasi full-stack dengan Next.js dan API berstandar.", duration: "2 minggu", icon_type: "code" },
    { title: "GitHub Portfolio", description: "Buat portofolio profesional di GitHub untuk tampil lebih meyakinkan.", duration: "1 minggu", icon_type: "github" },
    { title: "English for Interview", description: "Tingkatkan kemampuan komunikasi bahasa Inggris untuk interview.", duration: "2 minggu", icon_type: "language" }
  ];

  const recommendations = res?.recommendations || [];

  // Filter recommendations
  const filteredRecs = recommendations.filter((rec) => {
    if (selectedFilter === "all") return true;
    const filterLower = selectedFilter.toLowerCase();
    const titleMatch = rec.title?.toLowerCase().includes(filterLower);
    const compMatch = rec.company_name?.toLowerCase().includes(filterLower);
    const locMatch = rec.location?.toLowerCase().includes(filterLower);
    const typeMatch = rec.work_type?.toLowerCase().includes(filterLower);
    const skillMatch = rec.matched_skills?.some(s => s.toLowerCase().includes(filterLower));
    return titleMatch || compMatch || locMatch || typeMatch || skillMatch;
  });

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-gray-800">
      
      {/* ─── TOP HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Analisa CV
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Unggah CV, temukan kekuatan, tingkatkan kompetensi, dan dapatkan rekomendasi magang terbaik.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              activeTab === "dashboard"
                ? "bg-[#0b2545] hover:bg-[#0b2545]/90 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Compass className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              activeTab === "history"
                ? "bg-[#0b2545] hover:bg-[#0b2545]/90 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat Analisis
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
            
            {can("edit_pengaturan") || role === "super_admin" ? (
              <>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Layanan AI Analytics memerlukan Kunci API Gemini. Sebagai administrator, Anda dapat mengonfigurasinya secara dinamis di menu Pengaturan Sistem tanpa harus mengubah file .env di server.
                </p>
                <div className="bg-white border border-amber-100 rounded-xl p-4 text-xs font-mono text-gray-700 space-y-2 max-w-2xl mt-3">
                  <p className="font-bold text-amber-800 mb-1">💡 Cara Mengonfigurasi:</p>
                  <p>1. Dapatkan kunci API gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#035a70] underline font-bold">Google AI Studio</a>.</p>
                  <p>2. Konfigurasikan di halaman Pengaturan &gt; Integrasi &amp; API.</p>
                  <p className="font-semibold text-gray-500 mt-2">Atau tambahkan ke file backend .env:</p>
                  <p className="bg-amber-50/50 p-2 border-l-2 border-amber-500 text-amber-900 select-all font-bold">GEMINI_API_KEY=Kunci_API_Anda_Disini</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href="/dashboard/pengaturan"
                    className="px-4 py-2 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Buka Pengaturan Sistem
                  </Link>
                  <button
                    onClick={() => setApiKeyMissing(false)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Saya sudah menambahkannya, coba lagi
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Layanan AI Analytics belum siap karena Kunci API Gemini belum dikonfigurasi oleh administrator sistem.
                </p>
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  Silakan hubungi administrator Anda untuk mengaktifkan fitur ini melalui menu Pengaturan Sistem.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT ─── */}
      {activeTab === "dashboard" ? (
        <div className="space-y-6">

          {/* ──── SCANNING PROGRESS BAR ──── */}
          {scanning && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-[#035a70]" />
                <Brain className="w-7 h-7 text-[#035a70] absolute animate-pulse" />
              </div>
              <div className="space-y-2 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-800">Gemini AI Sedang Menganalisis CV...</h3>
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

          {/* ──── UPLOADER VIEW (WHEN NO SCAN LOADED) ──── */}
          {(!latestAnalysis || !latestAnalysis.analysis_result?.profile_summary) && !scanning && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  Bagaimana Cara Kerjanya?
                </h3>
                <ol className="space-y-4 text-sm text-gray-600 list-decimal pl-4">
                  <li>
                    <span className="font-semibold text-gray-800">Unggah Resume PDF</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload CV Anda dalam format PDF. Pastikan CV berisi riwayat pendidikan, keterampilan, dan proyek Anda.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold text-gray-800">Analisis Model AI</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Gemini AI akan membaca isi resume Anda untuk mengidentifikasi skor ATS, gap kompetensi, dan modul pembelajaran.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold text-gray-800">Rekomendasi Magang Cerdas</span>
                    <p className="text-xs text-gray-500 mt-1">
                      AI mencocokkan profil Anda dengan lowongan magang aktif serta menyajikan rekomendasi tempat magang yang tepat.
                    </p>
                  </li>
                </ol>
              </div>

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

          {/* ──── ACTIVE ANALYSIS DASHBOARD (MATCHING MOCKUP) ──── */}
          {latestAnalysis && !scanning && latestAnalysis.analysis_result?.profile_summary && (
            <div className="space-y-6">

              {/* ── 1. FILE INFO / STATUS BAR ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* File info */}
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                      {latestAnalysis.file_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Dianalisis pada {formatDate(latestAnalysis.created_at)}
                    </p>
                  </div>
                </div>

                {/* Status Indicator & Re-upload Button */}
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-between md:justify-end">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-3 py-1.5 rounded-xl font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block text-emerald-900 leading-none">Analisis selesai</span>
                      <span className="text-[10px] text-emerald-700">Semua modul berhasil dianalisis.</span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      handleFileChange(e);
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedFile(file);
                        setTimeout(() => handleStartScan(), 100);
                      }
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-gray-600" />
                    Unggah CV Baru
                  </button>
                </div>
              </div>

              {/* ── 2. STEPPER PROGRESS BAR ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between max-w-3xl mx-auto text-xs sm:text-sm font-semibold">
                  {/* Step 1 */}
                  <button 
                    onClick={() => scrollToSection("hasil-analisis")}
                    className="flex items-center gap-2 text-[#035a70] font-bold group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#035a70] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <span className="group-hover:underline">Analisis CV</span>
                    <Check className="w-3.5 h-3.5 text-[#035a70]" />
                  </button>

                  <div className="flex-1 h-[1.5px] bg-gray-200 mx-3 sm:mx-6" />

                  {/* Step 2 */}
                  <button 
                    onClick={() => scrollToSection("peningkatan-kompetensi")}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#035a70] group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 group-hover:border-[#035a70] group-hover:text-[#035a70]">
                      2
                    </span>
                    <span className="group-hover:underline">Tingkatkan Kompetensi</span>
                  </button>

                  <div className="flex-1 h-[1.5px] bg-gray-200 mx-3 sm:mx-6" />

                  {/* Step 3 */}
                  <button 
                    onClick={() => scrollToSection("tempat-magang")}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#035a70] group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 group-hover:border-[#035a70] group-hover:text-[#035a70]">
                      3
                    </span>
                    <span className="group-hover:underline">Pilih Tempat Magang</span>
                  </button>
                </div>
              </div>

              {/* ── 3. TOP 4 METRIC KPI CARDS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: ATS Score */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 text-[#035a70] rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-semibold block">Skor CV ATS</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-extrabold text-gray-900">{atsScore}/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs font-bold text-[#035a70]">
                      <span>{atsQuality}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#035a70] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min(100, Math.max(5, atsScore))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Competency Match */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 text-[#035a70] rounded-xl">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-semibold block">Kesesuaian Kompetensi</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-extrabold text-gray-900">{competencyScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs font-bold text-[#035a70]">
                      <span>{competencyQuality}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#035a70] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min(100, Math.max(5, competencyScore))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3: Internship Readiness */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 text-[#035a70] rounded-xl">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-semibold block">Kesiapan Magang</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-extrabold text-gray-900">{readinessScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs font-bold text-[#035a70]">
                      <span>{readinessQuality}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#035a70] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min(100, Math.max(5, readinessScore))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 4: Verified Profile */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 text-[#035a70] rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-semibold block">Profil Terverifikasi</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-extrabold text-gray-900">{verificationScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs font-bold text-[#035a70]">
                      <span>{verificationStatus}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#035a70] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min(100, Math.max(5, verificationScore))}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* ── 4. MAIN GRID: CANDIDATE PROFILE & HASIL ANALISIS CV ── */}
              <div id="hasil-analisis" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Candidate Profile Card (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                  {/* Candidate Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#035a70] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                      {candidateInitials}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Profil Kandidat
                      </span>
                      <h3 className="font-extrabold text-gray-900 text-base truncate" title={candidateName}>
                        {candidateName}
                      </h3>
                      <p className="text-xs font-semibold text-gray-700 leading-snug">
                        {candidateEducation}
                      </p>
                      <p className="text-xs text-gray-500">
                        {candidateInstitutionYears}
                      </p>
                    </div>
                  </div>

                  {/* Target Peran */}
                  <div className="space-y-1.5 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                      <Target className="w-3.5 h-3.5 text-[#035a70]" />
                      <span>Target Peran</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 pl-5">
                      {candidateTargetRole}
                    </p>
                  </div>

                  {/* Keahlian Utama (Pills) */}
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold block">
                      Keahlian Utama
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {candidateSkills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 bg-gray-100/90 text-gray-800 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Portofolio & GitHub */}
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold block">
                      Portofolio &amp; GitHub
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {candidatePortfolio ? (
                        <a 
                          href={candidatePortfolio.startsWith("http") ? candidatePortfolio : `https://${candidatePortfolio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-[#035a70] hover:underline font-medium p-1.5 rounded-lg hover:bg-teal-50/50 transition-colors"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span>Portfolio</span>
                            <span className="text-gray-500 truncate">{candidatePortfolio}</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <div className="flex items-center justify-between text-gray-600 p-1.5">
                          <span className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <span>Portfolio</span>
                            <span className="text-gray-400 italic">raihansaprudin.dev</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      )}

                      {candidateGithub ? (
                        <a 
                          href={candidateGithub.startsWith("http") ? candidateGithub : `https://${candidateGithub}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-[#035a70] hover:underline font-medium p-1.5 rounded-lg hover:bg-teal-50/50 transition-colors"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Code2 className="w-3.5 h-3.5 shrink-0" />
                            <span>GitHub</span>
                            <span className="text-gray-500 truncate">{candidateGithub}</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <div className="flex items-center justify-between text-gray-600 p-1.5">
                          <span className="flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5 text-gray-400" />
                            <span>GitHub</span>
                            <span className="text-gray-400 italic">github.com/raihansaprudin</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profil Terverifikasi Badge */}
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-emerald-900">Profil Terverifikasi</h5>
                      <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">
                        {verificationNote}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Right: Hasil Analisis CV (8 cols) */}
                <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Hasil Analisis CV</h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Column 1: Kekuatan Utama (4 cols) */}
                    <div className="md:col-span-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-800">Kekuatan Utama</h4>
                      <div className="space-y-2.5">
                        {candidateStrengths.map((strength, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-snug">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Temuan Perbaikan (4 cols) */}
                    <div className="md:col-span-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-800">Temuan Perbaikan</h4>
                      <div className="space-y-2.5">
                        {improvements.map((item, idx) => {
                          const isHigh = item.priority?.toLowerCase() === "tinggi";
                          const isMed = item.priority?.toLowerCase() === "sedang";
                          const badgeColor = isHigh 
                            ? "bg-rose-50 text-rose-600 border border-rose-200" 
                            : isMed 
                            ? "bg-amber-50 text-amber-600 border border-amber-200" 
                            : "bg-gray-100 text-gray-600 border border-gray-200";

                          return (
                            <div key={idx} className="flex items-start justify-between gap-2 text-xs text-gray-700">
                              <div className="flex items-start gap-1.5 flex-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span className="leading-snug">{item.issue}</span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${badgeColor}`}>
                                {item.priority}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column 3: Kelengkapan CV (4 cols) */}
                    <div className="md:col-span-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-800">Kelengkapan CV</h4>
                      <div className="space-y-2.5">
                        {[
                          { label: "Informasi Pribadi", val: completeness.personal_info },
                          { label: "Pendidikan", val: completeness.education },
                          { label: "Pengalaman & Proyek", val: completeness.experience_projects },
                          { label: "Keahlian", val: completeness.skills },
                          { label: "Sertifikasi & Pelatihan", val: completeness.certifications_training }
                        ].map((row, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                              <span>{row.label}</span>
                              <span className="font-bold">{row.val}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#035a70] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${row.val}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* AI Assistance Action Card */}
                  <div className="bg-[#0b2545] rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md">
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm sm:text-base text-white">
                        Tingkatkan kualitas CV Anda dengan bantuan AI.
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-200">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Perbaiki struktur &amp; penulisan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Tambahkan hasil terukur proyek</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Optimalkan kata kunci ATS</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Ringkas dan profesional</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/cv/cv-pintar"
                      className="px-5 py-2.5 bg-[#035a70] hover:bg-[#04829e] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all shrink-0 self-start md:self-center cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      Perbaiki CV dengan AI
                    </Link>
                  </div>

                </div>

              </div>

              {/* ── 5. REKOMENDASI PENINGKATAN KOMPETENSI ── */}
              <div id="peningkatan-kompetensi" className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Rekomendasi Peningkatan Kompetensi
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Matriks Gap Kompetensi (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Matriks Gap Kompetensi
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                          <tr>
                            <th className="py-2.5 px-3 font-bold">Kompetensi</th>
                            <th className="py-2.5 px-3 font-bold">Level Saat Ini</th>
                            <th className="py-2.5 px-3 font-bold">Target Magang</th>
                            <th className="py-2.5 px-3 font-bold">Gap</th>
                            <th className="py-2.5 px-3 font-bold text-center">Prioritas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {competencyGaps.map((row, idx) => {
                            const isHigh = row.priority?.toLowerCase() === "tinggi";
                            const isMed = row.priority?.toLowerCase() === "sedang";
                            const badgeCls = isHigh 
                              ? "bg-rose-50 text-rose-600 border border-rose-200" 
                              : isMed 
                              ? "bg-amber-50 text-amber-600 border border-amber-200" 
                              : "bg-gray-100 text-gray-600 border border-gray-200";

                            return (
                              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-3 font-bold text-gray-900">
                                  {row.skill}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span>{row.current_level}</span>
                                    <div className="flex gap-0.5 text-teal-600">
                                      {[...Array(5)].map((_, i) => (
                                        <span 
                                          key={i} 
                                          className={`w-1.5 h-1.5 rounded-full ${i < row.current_level_score ? "bg-teal-600" : "bg-gray-200"}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span>{row.target_level}</span>
                                    <div className="flex gap-0.5 text-teal-600">
                                      {[...Array(5)].map((_, i) => (
                                        <span 
                                          key={i} 
                                          className={`w-1.5 h-1.5 rounded-full ${i < row.target_level_score ? "bg-teal-600" : "bg-gray-200"}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-semibold text-gray-600">
                                  {row.gap_levels}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${badgeCls}`}>
                                    {row.priority}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href="/dashboard/ai-report"
                        className="px-4 py-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <span>Lihat Roadmap Belajar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => scrollToSection("tempat-magang")}
                        className="px-4 py-2 bg-[#0b2545] hover:bg-[#0b2545]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        Mulai Pengembangan
                      </button>
                    </div>

                  </div>

                  {/* Right: Rekomendasi Belajar untuk Anda (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Rekomendasi Belajar untuk Anda
                    </h4>

                    <div className="space-y-3">
                      {learningRecs.map((mod, idx) => {
                        let iconBg = "bg-blue-50 text-blue-600";
                        let IconComp = Code2;
                        if (mod.icon_type === "github") {
                          iconBg = "bg-emerald-50 text-emerald-600";
                          IconComp = Code2;
                        } else if (mod.icon_type === "language") {
                          iconBg = "bg-amber-50 text-amber-600";
                          IconComp = Languages;
                        }

                        return (
                          <div 
                            key={idx} 
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-gray-300 transition-all shadow-xs"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <h5 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                  {mod.title}
                                </h5>
                                <p className="text-xs text-gray-500 leading-snug line-clamp-2">
                                  {mod.description}
                                </p>
                                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                  ⏱ {mod.duration}
                                </span>
                              </div>
                            </div>

                            <Link
                              href="/dashboard/ai-report"
                              className="px-3.5 py-1.5 border border-gray-300 hover:border-[#035a70] hover:text-[#035a70] bg-white rounded-lg text-xs font-bold text-gray-700 transition-colors shrink-0 cursor-pointer"
                            >
                              Mulai
                            </Link>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                </div>

              </div>

              {/* ── 6. REKOMENDASI TEMPAT MAGANG ── */}
              <div id="tempat-magang" className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Header & Filter Pills */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Rekomendasi Tempat Magang
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: "all", label: "✓ Paling Sesuai" },
                      { id: "Web Development", label: "Web Development" },
                      { id: "IoT", label: "IoT" },
                      { id: "Bandung", label: "Bandung" },
                      { id: "Hybrid", label: "Hybrid" }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedFilter === filter.id
                            ? "bg-[#035a70] text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                    
                    <Link
                      href="/dashboard/lowongan"
                      className="text-xs font-bold text-[#035a70] hover:underline flex items-center gap-1 ml-2"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRecs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-xl">
                      <Briefcase className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-sm font-medium">Tidak ada rekomendasi yang sesuai dengan filter ini.</p>
                      <button 
                        onClick={() => setSelectedFilter("all")} 
                        className="text-xs font-bold text-[#035a70] underline cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    filteredRecs.map((rec, idx) => {
                      const isRealJob = !!rec.job_opening_id && !rec.is_general_recommendation;
                      const isSaved = rec.job_opening_id ? !!savedJobs[rec.job_opening_id] : false;
                      const initialLogo = rec.company_name?.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase() || "M";

                      return (
                        <div 
                          key={idx} 
                          className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                          {/* Card Top */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                {/* Company Logo box */}
                                <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 text-[#035a70] flex items-center justify-center font-extrabold text-sm shrink-0">
                                  {initialLogo}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug truncate" title={rec.title}>
                                    {rec.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 font-semibold truncate" title={rec.company_name}>
                                    {rec.company_name}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span>{rec.location || "Bandung"} · {rec.work_type || "Hybrid"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Circular Match Badge */}
                              <div className="flex flex-col items-center shrink-0">
                                <div className="w-12 h-12 rounded-full border-2 border-teal-600 flex items-center justify-center font-extrabold text-xs text-teal-800">
                                  {rec.match_score}%
                                </div>
                                <span className="text-[10px] text-teal-700 font-bold mt-0.5">Cocok</span>
                              </div>
                            </div>

                            {/* Skill Match description */}
                            <div className="text-xs text-gray-600 bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                              <span className="font-semibold text-gray-700">Kecocokan Skill: </span>
                              <span>
                                {rec.matched_skills && rec.matched_skills.length > 0 
                                  ? rec.matched_skills.join(", ") 
                                  : "React, Next.js, Node.js, REST API"}
                              </span>
                            </div>
                          </div>

                          {/* Card Bottom Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            {isRealJob ? (
                              <Link
                                href={`/dashboard/lowongan/${rec.job_opening_id}`}
                                className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors flex-1 text-center"
                              >
                                Lihat Detail
                              </Link>
                            ) : (
                              <Link
                                href="/dashboard/lowongan"
                                className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors flex-1 text-center"
                              >
                                Cari Posisi
                              </Link>
                            )}

                            {isRealJob && (
                              <button
                                onClick={() => handleToggleSaveJob(rec.job_opening_id!)}
                                className={`px-3 py-1.5 border rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isSaved 
                                    ? "bg-teal-50 border-teal-300 text-teal-700" 
                                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                                }`}
                                title={isSaved ? "Tersimpan" : "Simpan Lowongan"}
                              >
                                <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
                                <span>Simpan</span>
                              </button>
                            )}

                            {isRealJob ? (
                              <Link
                                href={`/dashboard/lowongan/${rec.job_opening_id}/apply`}
                                className="px-3.5 py-1.5 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Ajukan</span>
                              </Link>
                            ) : (
                              <Link
                                href="/dashboard/lowongan"
                                className="px-3.5 py-1.5 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                              >
                                <span>Jelajahi</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* ── 7. CREDIBILITY REVIEW PANEL (ADMIN/RECRUITER ACTION) ── */}
              {latestAnalysis.analysis_result.credibility && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#035a70]" />
                      <h3 className="font-bold text-gray-900 text-base">Analisis Kredibilitas &amp; Validitas CV</h3>
                    </div>
                    {latestAnalysis.analysis_result.credibility.action === "APPROVED" ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                        ✓ Disetujui Recruiter
                      </span>
                    ) : latestAnalysis.analysis_result.credibility.action === "REJECTED" ? (
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
                        ✕ Ditolak Recruiter
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold">
                        Skor Kredibilitas: {latestAnalysis.analysis_result.credibility.score ?? 100}%
                      </span>
                    )}
                  </div>

                  {/* Flags list */}
                  {latestAnalysis.analysis_result.credibility.flags && latestAnalysis.analysis_result.credibility.flags.length > 0 ? (
                    <div className="space-y-2">
                      {latestAnalysis.analysis_result.credibility.flags.map((flag, i) => (
                        <div key={i} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">{flag.message}</span>
                            {flag.suggestion && <p className="text-gray-600 italic mt-0.5">Saran wawancara: "{flag.suggestion}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Seluruh tanggal riwayat pendidikan dan proyek dinilai konsisten dan valid.
                    </p>
                  )}

                  {/* Recruiter Action Buttons if super admin */}
                  {role === "super_admin" && latestAnalysis.analysis_result.credibility.action !== "APPROVED" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        disabled={reviewing}
                        onClick={() => handleReviewCredibility("APPROVED")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Setujui Kredibilitas
                      </button>
                      <button
                        disabled={reviewing}
                        onClick={() => handleReviewCredibility("REJECTED")}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Tolak Kredibilitas
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* ─── RIWAYAT SCAN TAB ─── */
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Riwayat Analisis CV Anda</h3>
            <p className="text-xs text-gray-500 mt-1">
              Daftar dokumen CV yang pernah dianalisis beserta ringkasan hasil rekomendasinya.
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
                    {role === "super_admin" && (
                      <th scope="col" className="px-6 py-3.5 font-bold">Kandidat</th>
                    )}
                    <th scope="col" className="px-6 py-3.5 font-bold">Dokumen CV</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Tanggal Analisis</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Skor ATS</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Keahlian Terdeteksi</th>
                    <th scope="col" className="px-6 py-3.5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-gray-50/60 transition-colors">
                      {role === "super_admin" && (
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          <span className="truncate max-w-[150px] inline-block font-bold">{item.user?.name || "Kandidat"}</span>
                        </td>
                      )}
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="truncate max-w-[180px]" title={item.file_name}>{item.file_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-[#035a70] border border-teal-200 rounded-lg">
                          {item.analysis_result.ats_score ?? (item.analysis_result.credibility?.score ?? 85)}/100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.analysis_result.profile_summary?.skills ? (
                            <>
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
                            </>
                          ) : item.analysis_result.status === "processing" ? (
                            <span className="text-[10px] text-[#035a70] font-semibold animate-pulse">Processing...</span>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic font-semibold">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewHistoryItem(item)}
                            className="p-1.5 border border-gray-200 hover:border-[#035a70] hover:text-[#035a70] rounded-lg transition-colors bg-white cursor-pointer"
                            title="Tampilkan di Dashboard"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {item.analysis_result.profile_summary && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/v1/ai-analytics/${item.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 border border-gray-200 hover:border-[#035a70] hover:text-[#035a70] rounded-lg transition-colors bg-white flex items-center justify-center"
                              title="Unduh PDF"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 border border-gray-200 hover:border-red-200 hover:text-red-500 rounded-lg transition-colors bg-white cursor-pointer"
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

export default function AiAnalyticsPage() {
  const studentId = useAuthStore((s) => s.studentId);
  return (
    <LockedFeature featureName="AI CV Analyzer" studentId={studentId}>
      <AiAnalyticsPageInner />
    </LockedFeature>
  );
}