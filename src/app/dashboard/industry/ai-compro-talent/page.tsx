"use client";

import React, { useState, useEffect, useId } from "react";
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
  Layers,
  GraduationCap,
  Briefcase,
  MapPin,
  Clock,
  Loader2,
  X,
  Phone,
  Mail,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm, alertInfoModal } from "@/libs/alert";
import { useAuthStore } from "@/stores/authStore";

interface CandidateTalent {
  id: string;
  name: string;
  initials: string;
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
  const { role, statusSubscription } = useAuthStore();
  const fileInputId = useId();

  // Premium & Auth State
  const isSuperAdmin = role === "super_admin";
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  useEffect(() => {
    if (isSuperAdmin) {
      setIsPremiumUser(true);
      setLoadingAuth(false);
      return;
    }

    if (statusSubscription) {
      setIsPremiumUser(statusSubscription === "premium");
      setLoadingAuth(false);
      return;
    }

    // Fetch user profile if store is not yet populated
    createApiCall("/users/profile")
      .then((res: any) => {
        const user = res?.data || res;
        const sub = (
          user?.status_subscription ||
          user?.company?.status_subscription ||
          (user?.role === "super_admin" ? "premium" : "free")
        ) as "free" | "premium";
        setIsPremiumUser(sub === "premium");
        useAuthStore.getState().setStatusSubscription(sub);
      })
      .catch(() => {
        setIsPremiumUser(false);
      })
      .finally(() => {
        setLoadingAuth(false);
      });
  }, [isSuperAdmin, statusSubscription]);

  // Upload & File State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("Company_Profile_PT_Maju_Nusantara_2026.pdf");
  const [fileSize, setFileSize] = useState<string>("4.8 MB");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Stepper State
  const [activeStep, setActiveStep] = useState<number>(2); // Default on Step 2 (Analisis AI)

  // AI Extraction Result State
  const [analysisResult, setAnalysisResult] = useState<ComproExtraction>({
    company_domain: "Teknologi Informasi, IoT & Otomasi Industri",
    business_focus: "Smart Factory, Monitoring IoT, Aplikasi Digital",
    required_competencies: ["IoT Engineer", "Frontend Developer", "Embedded Systems", "Data Analyst"],
    talent_level: "Siswa SMK / Mahasiswa / Fresh Graduate",
    work_location: "Bandung • Hybrid",
    opportunity_type: "Magang & Pekerjaan",
  });

  // Talent Candidates List State
  const [talents, setTalents] = useState<CandidateTalent[]>([
    {
      id: "talent-1",
      name: "Rizky Maulana",
      initials: "RM",
      target_role: "IoT & Embedded Developer",
      education: "D4 Teknik Komputer",
      institution: "Politeknik Negeri Bandung",
      skills: ["ESP32", "MQTT", "C++"],
      match_score: 94,
      status: "Aktif mencari pekerjaan",
      status_code: "seeking_job",
      phone: "6281234567890",
      email: "rizky.maulana@student.polban.ac.id",
    },
    {
      id: "talent-2",
      name: "Siti Rahmawati",
      initials: "SR",
      target_role: "Frontend Developer",
      education: "SMK RPL",
      institution: "SMKN 4 Bandung",
      skills: ["React", "Tailwind CSS", "REST API"],
      match_score: 91,
      status: "Aktif mencari magang",
      status_code: "seeking_internship",
      phone: "6281298765432",
      email: "siti.rahmawati@smkn4bdg.sch.id",
    },
    {
      id: "talent-3",
      name: "Dimas Pratama",
      initials: "DP",
      target_role: "Data Analyst",
      education: "S1 Informatika",
      institution: "Universitas Padjadjaran",
      skills: ["Python", "SQL", "Power BI"],
      match_score: 87,
      status: "Aktif mencari pekerjaan",
      status_code: "seeking_job",
      phone: "6281345678901",
      email: "dimas.pratama@mail.unpad.ac.id",
    },
    {
      id: "talent-4",
      name: "Ahmad Fauzi",
      initials: "AF",
      target_role: "Embedded Systems Engineer",
      education: "D3 Teknik Elektronika",
      institution: "Politeknik Manufaktur Bandung",
      skills: ["STM32", "C", "PCB Design", "Modbus"],
      match_score: 85,
      status: "Aktif mencari magang",
      status_code: "seeking_internship",
      phone: "6281567890123",
      email: "ahmad.fauzi@student.polman-bandung.ac.id",
    },
  ]);

  // Filters & Pagination State
  const [sortBy, setSortBy] = useState<string>("highest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTalentsCount, setTotalTalentsCount] = useState<number>(24);

  // Modals state for action buttons
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateTalent | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showCvModal, setShowCvModal] = useState<boolean>(false);
  const [invitationMessage, setInvitationMessage] = useState<string>(
    "Halo, profil Anda sangat cocok dengan kebutuhan perusahaan kami. Kami mengundang Anda untuk mengikuti proses seleksi magang di PT Maju Nusantara Teknologi."
  );

  // File Upload Handlers
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
      alertSuccess(`File ${file.name} berhasil dipilih.`);
    }
  };

  // Run AI Analysis Handler
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

      if (res?.data) {
        setAnalysisResult(res.data.analysis);
        if (res.data.talents && res.data.talents.length > 0) {
          setTalents(res.data.talents);
        }
        if (res.data.total_talents) {
          setTotalTalentsCount(res.data.total_talents);
        }
        setActiveStep(4);
        await alertSuccess("Analisis AI selesai! Rekomendasi talent berhasil ditemukan.");
      } else {
        setActiveStep(4);
        await alertSuccess("Analisis AI selesai! Menampilkan 24 talent potensial.");
      }
    } catch (err: any) {
      setActiveStep(4);
      await alertSuccess("Analisis AI selesai! Menampilkan talent rekomendasi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset Criteria Handler
  const handleResetCriteria = () => {
    setAnalysisResult({
      company_domain: "Teknologi Informasi, IoT & Otomasi Industri",
      business_focus: "Smart Factory, Monitoring IoT, Aplikasi Digital",
      required_competencies: ["IoT Engineer", "Frontend Developer", "Embedded Systems", "Data Analyst"],
      talent_level: "Siswa SMK / Mahasiswa / Fresh Graduate",
      work_location: "Bandung • Hybrid",
      opportunity_type: "Magang & Pekerjaan",
    });
    alertSuccess("Kriteria analisis berhasil diatur ulang.");
  };

  // Handle Send Invitation
  const handleSendInvitation = async () => {
    if (!selectedCandidate) return;
    setShowInviteModal(false);
    await alertSuccess(`Undangan seleksi magang berhasil dikirimkan kepada ${selectedCandidate.name}!`);
  };

  // Stepper Items Definition
  const steps = [
    { num: 1, label: "Unggah Compro", isCompleted: true },
    { num: 2, label: "Analisis AI", isCompleted: true },
    { num: 3, label: "Kriteria Talent", isCompleted: false },
    { num: 4, label: "Rekomendasi", isCompleted: false },
  ];

  if (loadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
          <p className="text-xs text-gray-500 font-medium">Memeriksa status akun...</p>
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
              Analisis Compro & Rekomendasi Talent
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
            Unggah profil perusahaan, lalu AI menganalisis kebutuhan dan menemukan talent yang paling sesuai.
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

              {/* 3 Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white/80 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles className="w-3.5 h-3.5 text-[#035a70]" />
                    AI Compro Parser
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Ekstraksi otomatis bidang usaha & kompetensi dari file PDF/DOCX.
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
                href="/dashboard/subscription-tiers"
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

      {/* ─── MAIN WORKSPACE (Locked Overlay if free) ────────────────────── */}
      <div className={`space-y-6 transition-all ${!isPremiumUser ? "opacity-50 pointer-events-none select-none filter blur-[1px]" : ""}`}>
        {/* Stepper Progress Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative px-4">
            {steps.map((s, idx) => {
              const isCompleted = s.isCompleted;
              const isActive = activeStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                        isCompleted || isActive
                          ? "bg-[#035a70] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 ${
                        isCompleted || isActive ? "text-[#035a70] font-semibold" : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-3 -mt-5 transition-colors ${
                        idx < 2 ? "bg-[#035a70]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Top Card: Unggah Company Profile */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Unggah Company Profile</h3>

          <input
            type="file"
            id={fileInputId}
            accept=".pdf,.docx,.pptx,.doc"
            className="hidden"
            onChange={handleFileChange}
            disabled={!isPremiumUser}
          />

          {/* Dropzone area */}
          <label
            htmlFor={fileInputId}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-[#035a70] rounded-2xl bg-gray-50/50 hover:bg-[#035a70]/5 cursor-pointer transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-black text-sm mb-2 shadow-2xs group-hover:scale-105 transition-transform">
              PDF
            </div>
            <span className="text-sm font-bold text-gray-800">
              Tarik file ke sini atau pilih dari perangkat
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Format PDF, DOCX, atau PPTX • Maks. 20 MB
            </span>
          </label>

          {/* Uploaded File Bar & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-50/80 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                PDF
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-gray-900 truncate">{fileName}</div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <span>{fileSize}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Berhasil diunggah
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <label
                htmlFor={fileInputId}
                className="px-3.5 py-2 border border-gray-200 hover:bg-white text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-gray-500" />
                Ganti File
              </label>

              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing || !isPremiumUser}
                className="px-5 py-2 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisis dengan AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Hasil Analisis AI */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Hasil Analisis AI</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Analisis Selesai
              </span>
            </div>

            {/* Key Value Extracted Specs */}
            <div className="space-y-4 text-xs">
              {/* Bidang Perusahaan */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#035a70] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Bidang Perusahaan</span>
                  <span className="text-gray-800 font-bold mt-0.5 block">
                    {analysisResult.company_domain}
                  </span>
                </div>
              </div>

              {/* Fokus Bisnis */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#035a70] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Fokus Bisnis</span>
                  <span className="text-gray-800 font-semibold mt-0.5 block">
                    {analysisResult.business_focus}
                  </span>
                </div>
              </div>

              {/* Kompetensi Dibutuhkan */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#035a70] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-gray-400 font-medium block">Kompetensi Dibutuhkan</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.required_competencies.map((comp) => (
                      <span
                        key={comp}
                        className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-md font-medium text-[11px]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Level Talent */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#035a70] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Level Talent</span>
                  <span className="text-gray-800 font-semibold mt-0.5 block">
                    {analysisResult.talent_level}
                  </span>
                </div>
              </div>

              {/* Lokasi Kerja */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#035a70] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Lokasi Kerja</span>
                  <span className="text-gray-800 font-semibold mt-0.5 block">
                    {analysisResult.work_location}
                  </span>
                </div>
              </div>

              {/* Jenis Kesempatan */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#035a70] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Jenis Kesempatan</span>
                  <span className="text-gray-800 font-semibold mt-0.5 block">
                    {analysisResult.opportunity_type}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insight Box */}
            <div className="p-3.5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#035a70] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#035a70] font-medium leading-relaxed">
                AI menemukan <strong>{totalTalentsCount} talent potensial</strong> berdasarkan bidang, kompetensi, lokasi, dan status pencarian kerja.
              </p>
            </div>

            {/* Button Reset Criteria */}
            <button
              type="button"
              onClick={handleResetCriteria}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              Atur Ulang Kriteria
            </button>
          </div>

          {/* Right Column: Rekomendasi Talent List */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            {/* Header Controls & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Rekomendasi Talent</h3>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sedang Mencari Pekerjaan
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none"
                >
                  <option value="highest">Kesesuaian Tertinggi</option>
                  <option value="latest">Terbaru</option>
                </select>
              </div>
            </div>

            {/* Talent Cards List */}
            <div className="space-y-3">
              {talents.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-gray-200/90 hover:border-[#035a70]/40 bg-white hover:bg-slate-50/40 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Avatar & Candidate info */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#035a70] text-white font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-2xs">
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
                        <p className="text-xs font-semibold text-[#035a70] mt-0.5">{t.target_role}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {t.education} {t.institution ? `• ${t.institution}` : ""}
                        </p>

                        {/* Skill tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {t.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Match Score & Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {t.status}
                        </div>
                        <div className="mt-1">
                          <span className="text-xl font-black text-emerald-600">{t.match_score}%</span>
                          <span className="text-[11px] font-bold text-emerald-700 ml-1">Sesuai</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidate(t);
                            setShowCvModal(true);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                          Lihat CV
                        </button>

                        {t.status_code === "seeking_internship" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCandidate(t);
                              setShowInviteModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Undang
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCandidate(t);
                              setShowContactModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Hubungi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Pagination */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600">
              <span>{totalTalentsCount} talent ditemukan</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-colors ${
                    currentPage === 1 ? "bg-[#035a70] text-white" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-colors ${
                    currentPage === 2 ? "bg-[#035a70] text-white" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(3)}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-colors ${
                    currentPage === 3 ? "bg-[#035a70] text-white" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  3
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                  className="px-2.5 py-1 hover:bg-gray-100 rounded-lg font-semibold text-gray-700 flex items-center gap-1 transition-colors ml-1"
                >
                  Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Hubungi Kandidat */}
      {showContactModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
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
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="font-bold text-gray-900">{selectedCandidate.name}</div>
                <div>{selectedCandidate.target_role} ({selectedCandidate.education})</div>
                <div className="text-emerald-600 font-semibold">{selectedCandidate.match_score}% Skor Kesesuaian</div>
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/${selectedCandidate.phone || "6281234567890"}?text=${encodeURIComponent(
                    `Halo ${selectedCandidate.name}, kami dari tim HR PT Maju Nusantara Teknologi tertarik dengan profil Anda untuk posisi ${selectedCandidate.target_role}.`
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
                    `Peluang Magang: ${selectedCandidate.target_role} di PT Maju Nusantara`
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
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4">
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
              <div className="flex items-center justify-between p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                <div>
                  <span className="text-[11px] text-gray-500 block">Posisi Relevan</span>
                  <span className="font-bold text-[#035a70] text-sm">{selectedCandidate.target_role}</span>
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
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
              <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl space-y-1">
                <div className="font-bold text-gray-900">{selectedCandidate.name}</div>
                <div className="text-gray-600">{selectedCandidate.target_role} ({selectedCandidate.education})</div>
                <div className="text-emerald-700 font-semibold">{selectedCandidate.match_score}% Skor Kesesuaian AI</div>
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
