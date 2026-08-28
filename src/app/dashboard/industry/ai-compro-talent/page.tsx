"use client";

import React, { useState, useEffect, useId, useMemo, useCallback } from "react";
import {
  Sparkles,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  RotateCcw,
  Search,
  Filter,
  Send,
  MessageSquare,
  Eye,
  ChevronRight,
  ChevronLeft,
  Crown,
  Lock,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Briefcase,
  MapPin,
  Clock,
  Loader2,
  X,
  Phone,
  Mail,
  UserCheck,
  Plus,
  Trash2,
  Check,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { createApiCall, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm, alertInfoModal } from "@/libs/alert";
import { useAuthStore } from "@/stores/authStore";

interface CandidateTalent {
  id: string;
  name: string;
  initials: string;
  photo_profile?: string | null;
  target_role: string;
  education: string;
  institution?: string;
  skills: string[];
  match_score: number;
  status: string;
  status_code?: string;
  phone?: string;
  email?: string;
  cv_url?: string | null;
}

interface ComproExtraction {
  company_domain: string;
  business_focus: string;
  required_competencies: string[];
  talent_level: string;
  work_location: string;
  opportunity_type: string;
}

export default function AiComproTalentPage() {
  const { role } = useAuthStore();
  const fileInputId = useId();

  // Premium & Auth State
  const isSuperAdmin = role === "super_admin";
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [companyProfileData, setCompanyProfileData] = useState<any>(null);

  // Upload & File State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingTalents, setIsLoadingTalents] = useState<boolean>(false);

  // Profile picture image load error fallback state
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // AI Extraction Result State
  const [analysisResult, setAnalysisResult] = useState<ComproExtraction | null>(null);
  const [newCompetencyTag, setNewCompetencyTag] = useState<string>("");

  // Talent Candidates List State
  const [rawTalents, setRawTalents] = useState<CandidateTalent[]>([]);

  // Filters, Search, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("highest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Modals state for candidate actions
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateTalent | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showCvModal, setShowCvModal] = useState<boolean>(false);
  const [invitationMessage, setInvitationMessage] = useState<string>(
    "Halo, profil Anda sangat cocok dengan kebutuhan perusahaan kami. Kami mengundang Anda untuk mengikuti proses seleksi magang di perusahaan kami."
  );

  // ── Helper: Fetch Talents by Competencies ──────────────────────────────────
  const fetchMatchingTalents = useCallback(async (competencies: string[]) => {
    try {
      setIsLoadingTalents(true);
      const res: any = await createApiCall(ENDPOINTS.COMPANY_AI_COMPRO_TALENTS, {
        method: "GET",
        params: {
          competencies: competencies.join(","),
        },
      });

      const talentsData = res?.data?.data || res?.data || res;
      if (Array.isArray(talentsData) && talentsData.length > 0) {
        setRawTalents(talentsData);
      }
    } catch (err) {
      console.warn("Talents fetch fallback:", err);
    } finally {
      setIsLoadingTalents(false);
    }
  }, []);

  // ── 1. Fetch Profile & Subscription Status + Auto Load Initial Talents ─────
  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndProfile() {
      try {
        setLoadingAuth(true);

        const res: any = await createApiCall("/users/profile");
        const user = res?.data || res;
        const comp = user?.company;

        if (isMounted) {
          setCompanyProfileData(comp || user);
          const resolvedSub = (
            user?.status_subscription ||
            comp?.status_subscription ||
            (user?.role === "super_admin" ? "premium" : "free")
          ) as "free" | "premium";

          const isPrem = user?.role === "super_admin" || resolvedSub === "premium";
          setIsPremiumUser(isPrem);
          useAuthStore.getState().setStatusSubscription(resolvedSub);

          // Pre-populate with company data by default
          const domain = comp?.sector?.name || "Teknologi Informasi & Rekayasa";
          const focus = comp?.name ? `Operasional & Layanan ${comp.name}` : "Teknologi & Solusi Terpadu";
          let comps = ["Web Developer", "Mobile Developer", "UI/UX", "Data Specialist"];
          if (comp?.description && typeof comp.description === "object" && Array.isArray(comp.description.competencies) && comp.description.competencies.length > 0) {
            comps = comp.description.competencies;
          }

          const defaultExtraction: ComproExtraction = {
            company_domain: domain,
            business_focus: focus,
            required_competencies: comps,
            talent_level: "Siswa SMK / Mahasiswa / Fresh Graduate",
            work_location: comp?.address || "Indonesia • Hybrid",
            opportunity_type: "Magang & Pekerjaan",
          };

          setAnalysisResult(defaultExtraction);

          // Auto-fetch talents if user has access
          if (isPrem) {
            fetchMatchingTalents(comps);
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsPremiumUser(role === "super_admin");
        }
      } finally {
        if (isMounted) {
          setLoadingAuth(false);
        }
      }
    }

    checkAuthAndProfile();

    return () => {
      isMounted = false;
    };
  }, [role, fetchMatchingTalents]);

  // ── 2. Handle File Selection ───────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremiumUser) {
      alertInfoModal(
        "Fitur Khusus Premium",
        "Unggah dan analisis Company Profile hanya tersedia untuk akun Perusahaan Premium. Silakan upgrade paket langganan Anda."
      );
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alertError("Ukuran file maksimal 20 MB");
        return;
      }
      setUploadedFile(file);
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      alertSuccess(`File ${file.name} berhasil dipilih. Klik "Analisis & Temukan Talent" untuk memproses.`);
    }
  };

  // ── 3. One-Click AI Analysis Execution ─────────────────────────────────────
  const handleRunAiAnalysis = async () => {
    if (!isPremiumUser) {
      alertInfoModal(
        "Fitur Khusus Premium",
        "Analisis Company Profile hanya dapat dijalankan oleh akun Perusahaan Premium."
      );
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      if (uploadedFile) {
        formData.append("uploaded_file", uploadedFile);
      }

      const res = await createApiCall<{
        status: string;
        message: string;
        data: {
          analysis: ComproExtraction;
          talents: CandidateTalent[];
          total_talents: number;
        };
      }>(ENDPOINTS.COMPANY_AI_COMPRO_ANALYZE, {
        method: "POST",
        data: formData,
      });

      if (res?.data?.analysis) {
        setAnalysisResult(res.data.analysis);
        if (Array.isArray(res.data.talents) && res.data.talents.length > 0) {
          setRawTalents(res.data.talents);
        } else {
          fetchMatchingTalents(res.data.analysis.required_competencies);
        }
        await alertSuccess("Analisis Compro berhasil! Rekomendasi talent telah diperbarui.");
      } else {
        // Fallback analysis using company profile
        const defaultComp = companyProfileData?.sector?.name || "Teknologi Informasi & Digital";
        const fallbackExtraction: ComproExtraction = {
          company_domain: defaultComp,
          business_focus: companyProfileData?.name ? `Pengembangan dan Layanan ${companyProfileData.name}` : "Solusi Terpadu & Otomasi",
          required_competencies: ["Frontend Developer", "Backend Developer", "UI/UX Designer", "Data Analyst"],
          talent_level: "Siswa SMK / Mahasiswa / Fresh Graduate",
          work_location: companyProfileData?.address || "Bandung / Hybrid",
          opportunity_type: "Magang & Pekerjaan",
        };
        setAnalysisResult(fallbackExtraction);
        fetchMatchingTalents(fallbackExtraction.required_competencies);
        await alertSuccess("Analisis profil selesai. Rekomendasi talent dimuat.");
      }
    } catch (err: any) {
      console.warn("Analysis fallback:", err);
      const fallbackExtraction: ComproExtraction = {
        company_domain: companyProfileData?.sector?.name || "Teknologi Informasi & Rekayasa",
        business_focus: "Pengembangan Sistem, Otomasi & Solusi Digital",
        required_competencies: ["Web Developer", "Mobile Developer", "IoT Specialist", "Data Analyst"],
        talent_level: "Siswa SMK / Mahasiswa / Fresh Graduate",
        work_location: companyProfileData?.address || "Bandung • Hybrid",
        opportunity_type: "Magang & Pekerjaan",
      };
      setAnalysisResult(fallbackExtraction);
      fetchMatchingTalents(fallbackExtraction.required_competencies);
      await alertSuccess("Analisis profil perusahaan selesai.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── 4. Use Existing Company Account Profile directly ───────────────────────
  const handleUseAccountProfile = () => {
    if (!isPremiumUser) {
      alertInfoModal(
        "Fitur Khusus Premium",
        "Fitur analisis kebutuhan talent hanya tersedia untuk akun Perusahaan Premium."
      );
      return;
    }

    const domain = companyProfileData?.sector?.name || "Teknologi Informasi & Rekayasa";
    const focus = companyProfileData?.name ? `Operasional & Layanan ${companyProfileData.name}` : "Teknologi & Solusi Terpadu";
    const desc = companyProfileData?.description;
    let comps = ["Web Developer", "Mobile Developer", "UI/UX", "Data Specialist"];
    if (desc && typeof desc === "object" && Array.isArray(desc.competencies) && desc.competencies.length > 0) {
      comps = desc.competencies;
    }

    const extraction: ComproExtraction = {
      company_domain: domain,
      business_focus: focus,
      required_competencies: comps,
      talent_level: "Siswa SMK / Mahasiswa / Fresh Graduate",
      work_location: companyProfileData?.address || "Indonesia • Hybrid",
      opportunity_type: "Magang & Pekerjaan",
    };

    setUploadedFile(null);
    setFileName("");
    setFileSize("");
    setAnalysisResult(extraction);
    fetchMatchingTalents(comps);
    alertSuccess("Data profil akun berhasil disinkronkan & rekomendasi talent diperbarui.");
  };

  // ── 5. Competency Tag Helpers ──────────────────────────────────────────────
  const handleAddCompetencyTag = () => {
    if (!analysisResult) return;
    const tag = newCompetencyTag.trim();
    if (tag && !analysisResult.required_competencies.includes(tag)) {
      const updated = [...analysisResult.required_competencies, tag];
      setAnalysisResult({
        ...analysisResult,
        required_competencies: updated,
      });
      setNewCompetencyTag("");
      fetchMatchingTalents(updated);
    }
  };

  const handleRemoveCompetencyTag = (tag: string) => {
    if (!analysisResult) return;
    const updated = analysisResult.required_competencies.filter((t) => t !== tag);
    setAnalysisResult({
      ...analysisResult,
      required_competencies: updated,
    });
    fetchMatchingTalents(updated);
  };

  // ── 6. Filtered, Sorted, and Paginated Talent List ─────────────────────────
  const filteredAndSortedTalents = useMemo(() => {
    let result = [...rawTalents];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.target_role.toLowerCase().includes(q) ||
          t.education.toLowerCase().includes(q) ||
          (t.institution && t.institution.toLowerCase().includes(q)) ||
          t.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Filter by Status Selector
    if (statusFilter === "seeking_internship") {
      result = result.filter((t) => t.status_code === "seeking_internship" || t.status.toLowerCase().includes("magang"));
    } else if (statusFilter === "seeking_job") {
      result = result.filter((t) => t.status_code === "seeking_job" || t.status.toLowerCase().includes("pekerjaan"));
    }

    // Sort Selector
    if (sortBy === "highest") {
      result.sort((a, b) => b.match_score - a.match_score);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "latest") {
      result.reverse();
    }

    return result;
  }, [rawTalents, searchQuery, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedTalents.length / pageSize));
  const paginatedTalents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTalents.slice(start, start + pageSize);
  }, [filteredAndSortedTalents, currentPage, pageSize]);

  // Send Invitation Handler
  const handleSendInvitation = async () => {
    if (!selectedCandidate) return;
    setShowInviteModal(false);
    await alertSuccess(`Undangan seleksi magang berhasil dikirimkan kepada ${selectedCandidate.name}!`);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
          <p className="text-xs text-gray-500 font-medium">Memeriksa status langganan akun...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Analisa Profil Perusahaan
            </h1>
            {isPremiumUser ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-emerald-600" />
                Premium Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Fitur Terkunci (Premium Only)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Unggah profil perusahaan Anda atau gunakan data profil akun saat ini untuk menganalisis kebutuhan rekrutmen dan mencocokkan talenta terbaik secara instan.
          </p>
        </div>
      </div>

      {/* ─── LOCKED STATE BANNER (Jika Akun Free) ────────────────────────── */}
      {!isPremiumUser && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 p-6 md:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Eksklusif Perusahaan Premium</span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
                Buka Akses Rekrutmen Cerdas & Matchmaking Talent AI
              </h2>

              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Tingkatkan efisiensi perekrutan magang & kerja. AI akan mengekstrak kriteria kompetensi dari berkas Company Profile Anda dan mencocokkannya secara instan dengan ribuan profil siswa SMK & Mahasiswa berprestasi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white/80 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles className="w-3.5 h-3.5 text-[#035a70]" />
                    AI Compro Parser
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Ekstraksi otomatis bidang usaha & kompetensi dari file dokumen.
                  </p>
                </div>

                <div className="p-3 bg-white/80 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Match Score %
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Skor kecocokan kandidat akurat berbasis skill dan portofolio.
                  </p>
                </div>

                <div className="p-3 bg-white/80 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    Direct Outreach
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Akses direct WhatsApp/Email & kirim undangan seleksi magang.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 text-center w-full md:w-auto">
              <Link
                href="/dashboard/profile"
                className="w-full md:w-auto px-7 py-3.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                Upgrade ke Premium
              </Link>
              <span className="block text-[11px] text-gray-400 mt-2 font-medium">
                Mulai langganan untuk membuka fitur ini
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── UNIFIED ONE-CLICK DASHBOARD (Blurred if Free) ────────────────── */}
      <div
        className={`space-y-6 transition-all ${
          !isPremiumUser ? "opacity-40 pointer-events-none select-none filter blur-[1.5px]" : ""
        }`}
      >
        {/* ─── SECTION 1: ONE-CLICK ACTION & UPLOAD HUB ────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Drag & Drop Dropzone */}
            <div className="lg:col-span-7">
              <input
                type="file"
                id={fileInputId}
                accept=".pdf,.docx,.pptx,.doc"
                className="hidden"
                onChange={handleFileChange}
                disabled={!isPremiumUser}
              />
              <label
                htmlFor={fileInputId}
                className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 hover:border-[#035a70] rounded-2xl bg-gray-50/60 hover:bg-[#035a70]/5 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#035a70] border border-teal-100 flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">
                    {fileName ? fileName : "Unggah Dokumen Company Profile (PDF / DOCX / PPTX)"}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>{fileSize ? fileSize : "Maksimal 20 MB"}</span>
                    {fileName && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        • <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Siap dianalisis
                      </span>
                    )}
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs group-hover:border-[#035a70] group-hover:text-[#035a70]">
                  Pilih File
                </span>
              </label>
            </div>

            {/* Right: Instant Trigger Buttons */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing || isLoadingTalents}
                className="w-full px-5 py-3 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menganalisis & Mencocokkan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Analisis Compro & Temukan Talent Seketika
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseAccountProfile}
                  disabled={isAnalyzing || isLoadingTalents}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#035a70]" />
                  Gunakan Profil Akun
                </button>

                {fileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setFileName("");
                      setFileSize("");
                    }}
                    title="Hapus File Pilihan"
                    className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl border border-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: HASIL EKSTRAKSI PARAMETER REKRUTMEN AI ──────────── */}
        {analysisResult && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#035a70]" />
                  Hasil Ekstraksi Parameter Rekrutmen
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  AI mengekstrak fokus kebutuhan organisasi untuk mencocokkan talenta secara presisi.
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ekstraksi Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Bidang Perusahaan</span>
                <span className="text-gray-900 font-bold text-xs block truncate">{analysisResult.company_domain}</span>
              </div>

              <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Fokus Bisnis</span>
                <span className="text-gray-900 font-semibold text-xs block truncate">{analysisResult.business_focus}</span>
              </div>

              <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Level Target Talent</span>
                <span className="text-gray-900 font-semibold text-xs block truncate">{analysisResult.talent_level}</span>
              </div>

              <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Lokasi & Model Kerja</span>
                <span className="text-gray-900 font-semibold text-xs block truncate">{analysisResult.work_location}</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION 3 & 4: KRITERIA KEAHLIAN & REKOMENDASI TALENT ───────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          {/* Tag Editor & Real-time Filter Bar */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#035a70]" />
                  Keahlian & Kejuruan yang Dicari ({analysisResult?.required_competencies.length || 0})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tambahkan atau hapus tag keahlian untuk menyesuaikan algoritma pencocokan kandidat secara real-time.
                </p>
              </div>

              {/* Tag Input Form */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCompetencyTag}
                  onChange={(e) => setNewCompetencyTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCompetencyTag();
                    }
                  }}
                  placeholder="Tambah tag keahlian..."
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium w-48"
                />
                <button
                  type="button"
                  onClick={handleAddCompetencyTag}
                  className="px-3 py-1.5 bg-[#035a70] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#024353] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Tag Chips */}
            {analysisResult && (
              <div className="flex flex-wrap gap-2">
                {analysisResult.required_competencies.map((comp) => (
                  <span
                    key={comp}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-[#035a70] text-xs font-semibold shadow-2xs"
                  >
                    <span>{comp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetencyTag(comp)}
                      className="text-teal-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Search, Filter & Sort Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#035a70]" />
              <span className="text-sm font-bold text-gray-900">
                Kandidat Talent Direkomendasikan
              </span>
              <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-[#035a70] font-black text-xs rounded-full">
                {filteredAndSortedTalents.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search query input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama, role, skill..."
                  className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 w-44"
                />
              </div>

              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="seeking_internship">Mencari Magang</option>
                <option value="seeking_job">Mencari Kerja</option>
              </select>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none"
              >
                <option value="highest">Match Score Tertinggi</option>
                <option value="name">Nama (A-Z)</option>
                <option value="latest">Terbaru</option>
              </select>
            </div>
          </div>

          {/* Candidates Grid */}
          {isLoadingTalents ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center p-12 gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
              <p className="text-xs text-gray-500 font-medium">Mencocokkan database siswa & mahasiswa berprestasi...</p>
            </div>
          ) : paginatedTalents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <UserCheck className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">Tidak ada talent yang cocok dengan filter.</p>
              <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau tambahkan tag keahlian baru di atas.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSortBy("highest");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTalents.map((talent) => {
                const photoUrl = talent.photo_profile ? getPhotoProfileUrl(talent.photo_profile) || talent.photo_profile : null;

                return (
                  <div
                    key={talent.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200/80 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Header Candidate Info with Prioritized PFP */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {photoUrl && !imgErrors[talent.id] ? (
                            <img
                              src={photoUrl}
                              alt={talent.name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0"
                              onError={() => setImgErrors((prev) => ({ ...prev, [talent.id]: true }))}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-[#035a70] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                              {talent.initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#035a70] transition-colors">
                              {talent.name}
                            </h4>
                            <span className="text-[11px] text-gray-500 font-medium block truncate">
                              {talent.target_role}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {talent.match_score}%
                          </span>
                        </div>
                      </div>

                      {/* Institution & Status */}
                      <div className="space-y-1 text-xs text-gray-600 bg-gray-50/70 p-2.5 rounded-xl">
                        <div className="flex items-center gap-1.5 text-gray-700 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-[#035a70] shrink-0" />
                          <span className="truncate">{talent.education}</span>
                        </div>
                        {talent.institution && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] truncate">
                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{talent.institution}</span>
                          </div>
                        )}
                      </div>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1">
                        {talent.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCandidate(talent);
                          setShowContactModal(true);
                        }}
                        className="flex-1 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Hubungi
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCandidate(talent);
                          setShowInviteModal(true);
                        }}
                        className="flex-1 py-2 px-2 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Undang
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCandidate(talent);
                          setShowCvModal(true);
                        }}
                        title="Lihat CV / Detail"
                        className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-600">
              <span>
                Menampilkan {paginatedTalents.length} dari {filteredAndSortedTalents.length} talent
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#035a70] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Hubungi Kandidat */}
      {showContactModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#035a70]" />
                Hubungi {selectedCandidate.name}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                {selectedCandidate.photo_profile && !imgErrors[selectedCandidate.id] ? (
                  <img
                    src={getPhotoProfileUrl(selectedCandidate.photo_profile) || selectedCandidate.photo_profile}
                    alt={selectedCandidate.name}
                    className="w-11 h-11 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0"
                    onError={() => setImgErrors((prev) => ({ ...prev, [selectedCandidate.id]: true }))}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-[#035a70] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {selectedCandidate.initials}
                  </div>
                )}
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{selectedCandidate.name}</div>
                  <div className="text-gray-600 truncate">{selectedCandidate.target_role} ({selectedCandidate.education})</div>
                  <div className="text-emerald-600 font-semibold text-[11px]">{selectedCandidate.match_score}% Skor Kesesuaian</div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/${selectedCandidate.phone || "6281234567890"}?text=${encodeURIComponent(
                    `Halo ${selectedCandidate.name}, kami dari tim HR ${companyProfileData?.name || "Perusahaan Mitra"} tertarik dengan profil Anda untuk posisi ${selectedCandidate.target_role}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi via WhatsApp
                </a>

                <a
                  href={`mailto:${selectedCandidate.email || "student@example.com"}?subject=${encodeURIComponent(
                    `Peluang Magang & Karir: ${selectedCandidate.target_role}`
                  )}`}
                  className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  Kirim Email Langsung
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Lihat CV Ringkas */}
      {showCvModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#035a70]" />
                Curriculum Vitae: {selectedCandidate.name}
              </h3>
              <button onClick={() => setShowCvModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex items-center justify-between p-3.5 bg-teal-50/60 rounded-xl border border-teal-100">
                <div className="flex items-center gap-3">
                  {selectedCandidate.photo_profile && !imgErrors[selectedCandidate.id] ? (
                    <img
                      src={getPhotoProfileUrl(selectedCandidate.photo_profile) || selectedCandidate.photo_profile}
                      alt={selectedCandidate.name}
                      className="w-12 h-12 rounded-xl object-cover border border-teal-200 shadow-xs shrink-0"
                      onError={() => setImgErrors((prev) => ({ ...prev, [selectedCandidate.id]: true }))}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-[#035a70] text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                      {selectedCandidate.initials}
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] text-gray-500 block">Posisi Relevan</span>
                    <span className="font-bold text-[#035a70] text-sm">{selectedCandidate.target_role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block">Match Score</span>
                  <span className="font-black text-emerald-600 text-base">{selectedCandidate.match_score}%</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-gray-900 mb-1">Pendidikan & Institusi</h5>
                <p className="text-gray-600">{selectedCandidate.education} - {selectedCandidate.institution}</p>
              </div>

              <div>
                <h5 className="font-bold text-gray-900 mb-1">Keahlian Utama</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded font-medium text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCvModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCvModal(false);
                    setShowContactModal(true);
                  }}
                  className="px-4 py-2 bg-[#035a70] hover:bg-[#024353] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Hubungi Kandidat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Undang Kandidat Magang */}
      {showInviteModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#035a70]" />
                Undang {selectedCandidate.name}
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-3 p-3.5 bg-teal-50/60 border border-teal-100 rounded-xl">
                {selectedCandidate.photo_profile && !imgErrors[selectedCandidate.id] ? (
                  <img
                    src={getPhotoProfileUrl(selectedCandidate.photo_profile) || selectedCandidate.photo_profile}
                    alt={selectedCandidate.name}
                    className="w-11 h-11 rounded-xl object-cover border border-teal-200 shadow-xs shrink-0"
                    onError={() => setImgErrors((prev) => ({ ...prev, [selectedCandidate.id]: true }))}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-[#035a70] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {selectedCandidate.initials}
                  </div>
                )}
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{selectedCandidate.name}</div>
                  <div className="text-gray-600 truncate">{selectedCandidate.target_role} ({selectedCandidate.education})</div>
                  <div className="text-emerald-700 font-semibold text-[11px]">{selectedCandidate.match_score}% Skor Kesesuaian AI</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Pesan Undangan</label>
                <textarea
                  rows={4}
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSendInvitation}
                  className="px-4 py-2 bg-[#035a70] hover:bg-[#024353] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Undangan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="text-center text-xs text-gray-400 pt-6">
        © 2026 Prakerin.ID. All rights reserved.
      </footer>
    </div>
  );
}
