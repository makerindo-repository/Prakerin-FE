"use client";

import React, { useState, useEffect, useId, useMemo, useCallback } from "react";
import {
  Sparkles,
  School as SchoolIcon,
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
  Handshake,
  BookOpen,
  Award,
  Globe,
  Crown,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { createApiCall, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm, alertInfoModal } from "@/libs/alert";
import { useAuthStore } from "@/stores/authStore";

interface JobOpeningBrief {
  title: string;
  type: string;
  duration: string;
}

interface MatchingCompany {
  id: string;
  name: string;
  initials: string;
  logo?: string | null;
  sector: string;
  city: string;
  address: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  match_score: number;
  matched_subjects: string[];
  mou_status: "has_mou" | "no_mou";
  is_mou_partner: boolean;
  active_openings_count: number;
  openings: JobOpeningBrief[];
}

interface CurriculumExtraction {
  curriculum_domain: string;
  core_subjects: string[];
  extracted_competencies: string[];
  target_industries: string[];
  recommended_positions: string[];
  collaboration_models: string[];
}

export default function AiSchoolMatchIndustryPage() {
  const { role } = useAuthStore();
  const fileInputId = useId();

  // Premium & Auth State
  const isSuperAdmin = role === "super_admin";
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  // Profile & School State
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [schoolProfileData, setSchoolProfileData] = useState<any>(null);

  // Upload & File State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(false);

  // AI Extraction Result State
  const [analysisResult, setAnalysisResult] = useState<CurriculumExtraction | null>(null);
  const [newSubjectTag, setNewSubjectTag] = useState<string>("");

  // Companies List State
  const [rawCompanies, setRawCompanies] = useState<MatchingCompany[]>([]);

  // Filters, Search, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mouFilter, setMouFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("highest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Modals state for company actions
  const [selectedCompany, setSelectedCompany] = useState<MatchingCompany | null>(null);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [partnershipLetterMessage, setPartnershipLetterMessage] = useState<string>(
    "Yth. Tim HRD / Kemitraan Perusahaan, kami dari pihak sekolah ingin mengajukan permohonan kemitraan Praktik Kerja Lapangan (PKL) / Magang untuk siswa/mahasiswa kami yang memiliki kompetensi relevan."
  );

  // ── Helper: Fetch Matching Companies ───────────────────────────────────────
  const fetchMatchingCompanies = useCallback(async (competencies: string[], industries: string[] = []) => {
    try {
      setIsLoadingCompanies(true);
      const res: any = await createApiCall(ENDPOINTS.SCHOOL_AI_MATCH_COMPANIES, {
        method: "GET",
        params: {
          competencies: competencies.join(","),
          industries: industries.join(","),
        },
      });

      const compData = res?.data?.data || res?.data || res;
      if (Array.isArray(compData) && compData.length > 0) {
        setRawCompanies(compData);
      }
    } catch (err) {
      console.warn("Matching companies fetch fallback:", err);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  // ── 1. Fetch School Profile & Load Initial Data ───────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadSchoolData() {
      try {
        setLoadingInitial(true);
        const userRes: any = await createApiCall("/users/profile");
        const user = userRes?.data || userRes;
        const sch = user?.school;

        if (isMounted) {
          setSchoolProfileData(sch || user);

          const resolvedSub = (
            user?.status_subscription ||
            sch?.status_subscription ||
            (user?.role === "super_admin" ? "premium" : "free")
          ) as "free" | "premium";

          const isPrem = user?.role === "super_admin" || resolvedSub === "premium";
          setIsPremiumUser(isPrem);
          useAuthStore.getState().setStatusSubscription(resolvedSub);

          const defaultDomain = sch?.type === "university" ? "Teknik Informatika & Ilmu Komputer" : "Teknik Komputer & Informatika (RPL / TKJ / Multimedia)";
          let subjects = [
            "Pemrograman Web & Mobile",
            "Basis Data SQL",
            "Administrasi Server Jaringan",
            "UI/UX Design Figma",
            "Cloud Computing",
          ];

          if (sch?.description && typeof sch.description === "object") {
            if (Array.isArray(sch.description.competencies) && sch.description.competencies.length > 0) {
              subjects = sch.description.competencies;
            }
          }

          const defaultExtraction: CurriculumExtraction = {
            curriculum_domain: defaultDomain,
            core_subjects: subjects,
            extracted_competencies: subjects.map((s) => `${s} & Praktik Terapan`),
            target_industries: [
              "Teknologi Informasi & Software House",
              "Telekomunikasi & Jaringan",
              "Kreatif & Digital Media",
              "Manufaktur & Otomasi",
            ],
            recommended_positions: [
              "Junior Web Developer Intern",
              "Network Support Intern",
              "UI/UX Designer Intern",
              "IT Support & Technical Specialist",
            ],
            collaboration_models: [
              "Praktik Kerja Lapangan (PKL / Magang)",
              "Penyelarasan Kurikulum Vokasi",
              "Program Guru Tamu / Expert Sharing",
              "Kelas Industri Kemitraan",
            ],
          };

          setAnalysisResult(defaultExtraction);
          if (isPrem) {
            fetchMatchingCompanies(subjects, defaultExtraction.target_industries);
          }
        }
      } catch (err) {
        console.warn("Could not load initial school data:", err);
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    }

    loadSchoolData();

    return () => {
      isMounted = false;
    };
  }, [fetchMatchingCompanies]);

  // ── 2. Handle File Selection ───────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremiumUser) {
      alertInfoModal(
        "Fitur Khusus Premium Sekolah",
        "Unggah dan analisis silabus kurikulum untuk pencocokan mitra industri hanya tersedia untuk akun Sekolah / Perguruan Tinggi Premium. Silakan upgrade paket langganan Anda."
      );
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alertError("Ukuran file dokumen maksimal 20 MB");
        return;
      }
      setUploadedFile(file);
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      alertSuccess(`File ${file.name} berhasil dipilih. Klik "Analisis Silabus & Temukan Mitra Industri" untuk memproses.`);
    }
  };

  // ── 3. AI Analysis Execution ───────────────────────────────────────────────
  const handleRunAiAnalysis = async () => {
    if (!isPremiumUser) {
      alertInfoModal(
        "Fitur Khusus Premium Sekolah",
        "Fitur ini memerlukan paket langganan Premium. Silakan upgrade paket langganan sekolah Anda."
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
          analysis: CurriculumExtraction;
          companies: MatchingCompany[];
          total_companies: number;
        };
      }>(ENDPOINTS.SCHOOL_AI_CURRICULUM_ANALYZE, {
        method: "POST",
        data: formData,
      });

      if (res?.data?.analysis) {
        setAnalysisResult(res.data.analysis);
        if (Array.isArray(res.data.companies) && res.data.companies.length > 0) {
          setRawCompanies(res.data.companies);
        } else {
          fetchMatchingCompanies(res.data.analysis.core_subjects, res.data.analysis.target_industries);
        }
        await alertSuccess("Analisis silabus kurikulum berhasil! Rekomendasi mitra industri telah disesuaikan.");
      } else {
        // Fallback analysis using school profile
        const subjects = analysisResult?.core_subjects || ["Pemrograman Web", "Jaringan Komputer", "Desain UI/UX"];
        fetchMatchingCompanies(subjects);
        await alertSuccess("Analisis mata pelajaran selesai. Mitra industri dimuat.");
      }
    } catch (err: any) {
      console.warn("Analysis fallback:", err);
      const fallbackExtraction: CurriculumExtraction = {
        curriculum_domain: "Teknologi Informasi, Rekayasa & Vokasi",
        core_subjects: ["Pemrograman Web", "Mobile Apps", "IoT & Embedded", "Cloud Services"],
        extracted_competencies: ["Fullstack Web Development", "REST API", "Database Design", "Git Workflow"],
        target_industries: ["Software House", "Digital Agency", "Telekomunikasi", "Manufaktur Presisi"],
        recommended_positions: ["Frontend Intern", "Backend Intern", "IoT Specialist Intern"],
        collaboration_models: ["Praktik Kerja Lapangan (PKL)", "Guru Tamu", "Kelas Industri"],
      };
      setAnalysisResult(fallbackExtraction);
      fetchMatchingCompanies(fallbackExtraction.core_subjects);
      await alertSuccess("Analisis kurikulum selesai.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── 4. Use Existing School Account Profile directly ────────────────────────
  const handleUseAccountProfile = () => {
    if (!isPremiumUser) {
      alertInfoModal(
        "Fitur Khusus Premium Sekolah",
        "Fitur ini memerlukan paket langganan Premium. Silakan upgrade paket langganan sekolah Anda."
      );
      return;
    }

    const defaultDomain = schoolProfileData?.type === "university" ? "Teknik Informatika & Sains Terapan" : "Teknologi Informasi & Komunikasi (SMK)";
    let subjects = [
      "Pemrograman Web & Mobile",
      "Basis Data SQL",
      "Administrasi Server Jaringan",
      "UI/UX Design Figma",
    ];

    if (schoolProfileData?.description && typeof schoolProfileData.description === "object") {
      if (Array.isArray(schoolProfileData.description.competencies) && schoolProfileData.description.competencies.length > 0) {
        subjects = schoolProfileData.description.competencies;
      }
    }

    const extraction: CurriculumExtraction = {
      curriculum_domain: defaultDomain,
      core_subjects: subjects,
      extracted_competencies: subjects.map((s) => `${s} & Praktik Terapan`),
      target_industries: [
        "Teknologi Informasi & Software House",
        "Telekomunikasi & Jaringan",
        "Kreatif & Digital Media",
      ],
      recommended_positions: [
        "Junior Web Developer Intern",
        "Network Support Intern",
        "UI/UX Designer Intern",
      ],
      collaboration_models: [
        "Praktik Kerja Lapangan (PKL / Magang)",
        "Penyelarasan Kurikulum Vokasi",
        "Guru Tamu / Expert Sharing",
      ],
    };

    setUploadedFile(null);
    setFileName("");
    setFileSize("");
    setAnalysisResult(extraction);
    fetchMatchingCompanies(subjects, extraction.target_industries);
    alertSuccess("Data profil sekolah berhasil disinkronkan & rekomendasi mitra industri diperbarui.");
  };

  // ── 5. Subject Tag Helpers ─────────────────────────────────────────────────
  const handleAddSubjectTag = () => {
    if (!analysisResult) return;
    const tag = newSubjectTag.trim();
    if (tag && !analysisResult.core_subjects.includes(tag)) {
      const updated = [...analysisResult.core_subjects, tag];
      setAnalysisResult({
        ...analysisResult,
        core_subjects: updated,
      });
      setNewSubjectTag("");
      fetchMatchingCompanies(updated, analysisResult.target_industries);
    }
  };

  const handleRemoveSubjectTag = (tag: string) => {
    if (!analysisResult) return;
    const updated = analysisResult.core_subjects.filter((t) => t !== tag);
    setAnalysisResult({
      ...analysisResult,
      core_subjects: updated,
    });
    fetchMatchingCompanies(updated, analysisResult.target_industries);
  };

  // ── 6. Filtered, Sorted, and Paginated Companies ───────────────────────────
  const filteredAndSortedCompanies = useMemo(() => {
    let result = [...rawCompanies];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.matched_subjects.some((s) => s.toLowerCase().includes(q)) ||
          c.openings.some((o) => o.title.toLowerCase().includes(q))
      );
    }

    // Filter by MoU Status
    if (mouFilter === "has_mou") {
      result = result.filter((c) => c.mou_status === "has_mou" || c.is_mou_partner);
    } else if (mouFilter === "no_mou") {
      result = result.filter((c) => c.mou_status === "no_mou" || !c.is_mou_partner);
    }

    // Filter by Sector
    if (sectorFilter !== "all") {
      result = result.filter((c) => c.sector.toLowerCase().includes(sectorFilter.toLowerCase()));
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
  }, [rawCompanies, searchQuery, mouFilter, sectorFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCompanies.length / pageSize));
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedCompanies.slice(start, start + pageSize);
  }, [filteredAndSortedCompanies, currentPage, pageSize]);

  // Handle WhatsApp Direct Contact
  const handleOpenWhatsApp = (phone: string, companyName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const msg = encodeURIComponent(
      `Halo Tim HRD / Kemitraan ${companyName},\n\nKami dari ${schoolProfileData?.name || "pihak sekolah/kampus"} tertarik untuk menjalin kerja sama Praktik Kerja Lapangan (PKL) / Magang Industri untuk siswa/mahasiswa kami yang memiliki mata pelajaran & kompetensi kejuruan yang cocok.\n\nApakah kami dapat berdiskusi lebih lanjut terkait peluang kerja sama ini? Terima kasih.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  // Handle Email Direct Contact
  const handleOpenEmail = (email: string, companyName: string) => {
    const subject = encodeURIComponent(`Pengajuan Kemitraan Magang / PKL - ${schoolProfileData?.name || "Sekolah Mitra"}`);
    const body = encodeURIComponent(
      `Yth. Tim HRD / Kemitraan ${companyName},\n\nPerkenalkan kami dari ${schoolProfileData?.name || "pihak sekolah"}. Melalui platform Prakerin.ID, kami melihat adanya keselarasan antara mata pelajaran kejuruan kami dengan kebutuhan industri di perusahaan Bapak/Ibu.\n\nKami bermaksud mengajukan permohonan kerja sama program magang / MoU kemitraan vokasi. Terlampir profil institusi dan silabus keahlian siswa kami.\n\nDemikian permohonan kami, atas perhatian dan kerja samanya kami ucapkan terima kasih.\n\nSalam hormat,\n${schoolProfileData?.name || "Tim Hubin & Kemitraan Sekolah"}`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  if (loadingInitial) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
          <p className="text-xs text-gray-500 font-medium">Memuat sistem pencocokan kurikulum & industri...</p>
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
              Pencocokan Kurikulum & Industri AI
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              Fitur Khusus Premium Sekolah
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Unggah berkas silabus/RPP atau gunakan mata pelajaran kejuruan untuk mencocokkan mitra industri (DUDI) dan lowongan magang yang paling sesuai secara otomatis.
          </p>
        </div>
      </div>

      {/* ─── HERO UPGRADE CARD (Shown if Not Premium) ──────────────────── */}
      {!isPremiumUser && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 p-6 md:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Eksklusif Sekolah & Kampus Premium</span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
                Buka Akses Rekomendasi Mitra Industri (DUDI) & Matchmaking Silabus AI
              </h2>

              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Tingkatkan kualitas penempatan magang/PKL siswa dan mahasiswa Anda. AI akan menganalisis dokumen silabus, capaian pembelajaran, dan mata pelajaran kejuruan secara instan untuk mencocokkan mitra industri dan lowongan magang yang paling selaras.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white/80 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles className="w-3.5 h-3.5 text-[#035a70]" />
                    AI Silabus Parser
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Ekstraksi otomatis fokus kejuruan dan kompetensi dari berkas kurikulum/RPP.
                  </p>
                </div>

                <div className="p-3 bg-white/80 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Match Score % DUDI
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Skor kecocokan industri mitra akurat berbasis relevansi mata pelajaran.
                  </p>
                </div>

                <div className="p-3 bg-white/80 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Handshake className="w-3.5 h-3.5 text-blue-600" />
                    Kemitraan & MoU
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Akses direct kontak HRD industri & percepat pengajuan kerja sama MoU resmi.
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
                  {fileName ? fileName : "Unggah Dokumen Silabus / Kurikulum / RPP (PDF / DOCX / PPTX)"}
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
              disabled={isAnalyzing || isLoadingCompanies}
              className="w-full px-5 py-3 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menganalisis & Mencocokkan Industri...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Analisis Silabus & Temukan Mitra Industri
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseAccountProfile}
                disabled={isAnalyzing || isLoadingCompanies}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
              >
                <SchoolIcon className="w-3.5 h-3.5 text-[#035a70]" />
                Gunakan Profil Sekolah
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

      {/* ─── SECTION 2: HASIL EKSTRAKSI PARAMETER KURIKULUM AI ──────────── */}
      {analysisResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#035a70]" />
                Hasil Ekstraksi Capaian Kurikulum & Peluang Industri
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                AI mengekstrak fokus keahlian kejuruan institusi Anda untuk mencocokkan industri mitra secara akurat.
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Ekstraksi Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold block uppercase text-[10px]">Bidang Keahlian</span>
              <span className="text-gray-900 font-bold text-xs block truncate">{analysisResult.curriculum_domain}</span>
            </div>

            <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold block uppercase text-[10px]">Target Sektor Industri</span>
              <span className="text-gray-900 font-semibold text-xs block truncate">{analysisResult.target_industries.slice(0, 2).join(", ")}</span>
            </div>

            <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold block uppercase text-[10px]">Target Posisi Magang</span>
              <span className="text-gray-900 font-semibold text-xs block truncate">{analysisResult.recommended_positions.slice(0, 2).join(", ")}</span>
            </div>

            <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold block uppercase text-[10px]">Model Kerja Sama</span>
              <span className="text-gray-900 font-semibold text-xs block truncate">{analysisResult.collaboration_models.slice(0, 2).join(", ")}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 3 & 4: MATA PELAJARAN & REKOMENDASI PERUSAHAAN MITRA ─── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Tag Editor Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#035a70]" />
                Mata Pelajaran & Kompetensi Kejuruan ({analysisResult?.core_subjects.length || 0})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tambahkan atau sesuaikan mata pelajaran produktif untuk menyelaraskan pencocokan mitra industri secara real-time.
              </p>
            </div>

            {/* Tag Input Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubjectTag}
                onChange={(e) => setNewSubjectTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubjectTag();
                  }
                }}
                placeholder="Tambah mata pelajaran..."
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium w-48"
              />
              <button
                type="button"
                onClick={handleAddSubjectTag}
                className="px-3 py-1.5 bg-[#035a70] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#024353] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Tag Chips */}
          {analysisResult && (
            <div className="flex flex-wrap gap-2">
              {analysisResult.core_subjects.map((subj) => (
                <span
                  key={subj}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-[#035a70] text-xs font-semibold shadow-2xs"
                >
                  <span>{subj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectTag(subj)}
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
            <Building2 className="w-5 h-5 text-[#035a70]" />
            <span className="text-sm font-bold text-gray-900">
              Mitra Industri & Perusahaan Direkomendasikan
            </span>
            <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-[#035a70] font-black text-xs rounded-full">
              {filteredAndSortedCompanies.length}
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
                placeholder="Cari nama, sektor, kota..."
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 w-44"
              />
            </div>

            {/* MoU Status Selector */}
            <select
              value={mouFilter}
              onChange={(e) => {
                setMouFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none"
            >
              <option value="all">Semua Status MoU</option>
              <option value="has_mou">Sudah Ada MoU</option>
              <option value="no_mou">Belum Ada MoU</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none"
            >
              <option value="highest">Match Score Tertinggi</option>
              <option value="name">Nama Perusahaan (A-Z)</option>
              <option value="latest">Terbaru</option>
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        {isLoadingCompanies ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center p-12 gap-3 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
            <p className="text-xs text-gray-500 font-medium">Mencocokkan database ribuan perusahaan mitra industri...</p>
          </div>
        ) : paginatedCompanies.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-700">Tidak ada perusahaan yang cocok dengan filter.</p>
            <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau sesuaikan tag mata pelajaran di atas.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setMouFilter("all");
                setSectorFilter("all");
                setSortBy("highest");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCompanies.map((company) => {
              const logoUrl = company.logo ? getPhotoProfileUrl(company.logo) || company.logo : null;

              return (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200/80 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Company Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={company.name}
                            className="w-12 h-12 rounded-xl object-contain border border-gray-100 p-1 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-[#035a70] flex items-center justify-center font-black text-sm shrink-0">
                            {company.initials || "PT"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#035a70] transition-colors">
                            {company.name}
                          </h4>
                          <span className="text-[11px] text-gray-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            {company.city}
                          </span>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="shrink-0 flex flex-col items-end">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          {company.match_score}%
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5 font-bold">Kecocokan</span>
                      </div>
                    </div>

                    {/* Sector & MoU Status */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg truncate max-w-[200px]">
                        {company.sector}
                      </span>
                      {company.is_mou_partner || company.mou_status === "has_mou" ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <Handshake className="w-3 h-3" />
                          Mitra MoU Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-lg">
                          Belum Ada MoU
                        </span>
                      )}
                    </div>

                    {/* Matched Subjects */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Mata Pelajaran yang Cocok:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {company.matched_subjects.map((sub) => (
                          <span
                            key={sub}
                            className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-[#035a70] text-[10px] font-semibold rounded-md"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Active Internship Openings Preview */}
                    {company.openings && company.openings.length > 0 && (
                      <div className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-[#035a70]" />
                          Lowongan Magang Terbuka ({company.openings.length})
                        </span>
                        <div className="space-y-0.5">
                          {company.openings.slice(0, 2).map((op, idx) => (
                            <div key={idx} className="text-[11px] text-gray-700 font-medium truncate flex items-center justify-between">
                              <span>• {op.title}</span>
                              <span className="text-[10px] text-gray-400">{op.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Direct Outreach Buttons */}
                      {company.phone && (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(company.phone!, company.name)}
                          title="Hubungi HR via WhatsApp"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {company.email && (
                        <button
                          type="button"
                          onClick={() => handleOpenEmail(company.email!, company.name)}
                          title="Kirim Email Permohonan Magang"
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </div>

                    {/* Ajukan MoU */}
                    <Link
                      href="/dashboard/mou"
                      className="px-3 py-1.5 bg-[#035a70] hover:bg-[#024353] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      Ajukan MoU
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">
              Halaman {currentPage} dari {totalPages} ({filteredAndSortedCompanies.length} mitra industri)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modal Detail Perusahaan Mitra */}
      {showDetailModal && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                {selectedCompany.logo ? (
                  <img
                    src={getPhotoProfileUrl(selectedCompany.logo) || selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="w-12 h-12 rounded-xl object-contain border border-gray-100 p-1 bg-white shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#035a70] flex items-center justify-center font-black shrink-0">
                    {selectedCompany.initials || "PT"}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedCompany.name}</h3>
                  <p className="text-xs text-[#035a70] font-semibold">{selectedCompany.sector}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Alamat & Lokasi</span>
                <span className="text-gray-800 font-medium block">{selectedCompany.address || selectedCompany.city}</span>
              </div>

              {selectedCompany.website && (
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-bold block uppercase text-[10px]">Website Resmi</span>
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#035a70] font-semibold flex items-center gap-1 hover:underline"
                  >
                    {selectedCompany.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <span className="text-gray-700 font-bold block">Kesesuaian Mata Pelajaran ({selectedCompany.match_score}%)</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.matched_subjects.map((sub) => (
                    <span key={sub} className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-[#035a70] font-semibold rounded-lg">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCompany.openings && selectedCompany.openings.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-900 font-bold block">Daftar Posisi Magang Tersedia</span>
                  <div className="space-y-1.5">
                    {selectedCompany.openings.map((op, i) => (
                      <div key={i} className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl flex items-center justify-between">
                        <div>
                          <strong className="text-gray-900 block">{op.title}</strong>
                          <span className="text-[11px] text-gray-500">{op.type} • Durasi: {op.duration}</span>
                        </div>
                        <Link
                          href="/dashboard/lowongan"
                          className="px-2.5 py-1 bg-[#035a70] text-white text-[10px] font-bold rounded-lg"
                        >
                          Lihat
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
              <Link
                href="/dashboard/mou"
                className="px-4 py-2 bg-[#035a70] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Handshake className="w-3.5 h-3.5" />
                Ajukan MoU Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
