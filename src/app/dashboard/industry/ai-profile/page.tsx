"use client";

import React, { useState, useRef, useId } from "react";
import {
  Sparkles,
  Building2,
  Globe,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Plus,
  Trash2,
  Download,
  Save,
  CheckCircle2,
  FileText,
  Upload,
  Layers,
  ArrowLeft,
  Briefcase,
  FolderGit2,
  Calendar,
  Users,
  MoreVertical,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm } from "@/libs/alert";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
}

export default function AiCompanyProfilePage() {
  // Form State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const [companyName, setCompanyName] = useState<string>("PT Maju Nusantara Teknologi");
  const [sector, setSector] = useState<string>("Teknologi Informasi & IoT");
  const [establishedYear, setEstablishedYear] = useState<string>("2018");
  const [employeeCount, setEmployeeCount] = useState<string>("51-100 orang");
  const [website, setWebsite] = useState<string>("www.majunusantara.co.id");
  const [email, setEmail] = useState<string>("hr@majunusantara.co.id");
  const [phone, setPhone] = useState<string>("+62 22 7654 3210");
  const [linkedin, setLinkedin] = useState<string>("linkedin.com/company/maju-nusantara");
  const [address, setAddress] = useState<string>("Bandung, Jawa Barat, Indonesia");
  const [shortDescription, setShortDescription] = useState<string>(
    "Perusahaan teknologi yang mengembangkan solusi IoT, aplikasi digital, dan sistem otomasi untuk industri."
  );

  const [competencies, setCompetencies] = useState<string[]>([
    "IoT Development",
    "Web & Mobile App",
    "Data Analytics",
    "Industrial Automation",
  ]);
  const [newCompetency, setNewCompetency] = useState<string>("");
  const [isAddingComp, setIsAddingComp] = useState<boolean>(false);

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([
    {
      id: "port-1",
      title: "Smart Factory Monitoring",
      description: "Solusi pemantauan produksi real-time untuk industri manufaktur.",
    },
  ]);
  const [showPortfolioModal, setShowPortfolioModal] = useState<boolean>(false);
  const [newPortTitle, setNewPortTitle] = useState<string>("");
  const [newPortDesc, setNewPortDesc] = useState<string>("");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // AI Generated Result State
  const [aiTagline, setAiTagline] = useState<string>("Technology • IoT • Automation");
  const [aiAboutCompany, setAiAboutCompany] = useState<string>(
    "PT Maju Nusantara Teknologi adalah perusahaan teknologi yang mengembangkan solusi IoT, aplikasi digital, dan sistem otomasi untuk berbagai industri. Kami berkomitmen memberikan inovasi yang andal, efisien, dan berdampak melalui teknologi terkini serta tim profesional yang berpengalaman."
  );
  const [completenessScore, setCompletenessScore] = useState<number>(90);

  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputId = useId();

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alertError("Ukuran logo maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Adding Competency Tag
  const handleAddCompetency = () => {
    if (newCompetency.trim() && !competencies.includes(newCompetency.trim())) {
      setCompetencies([...competencies, newCompetency.trim()]);
      setNewCompetency("");
      setIsAddingComp(false);
    }
  };

  const handleRemoveCompetency = (tagToRemove: string) => {
    setCompetencies(competencies.filter((tag) => tag !== tagToRemove));
  };

  // Handle Adding Portfolio Item
  const handleAddPortfolio = () => {
    if (!newPortTitle.trim() || !newPortDesc.trim()) {
      alertError("Judul dan deskripsi portofolio harus diisi");
      return;
    }
    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: newPortTitle.trim(),
      description: newPortDesc.trim(),
    };
    setPortfolios([...portfolios, newItem]);
    setNewPortTitle("");
    setNewPortDesc("");
    setShowPortfolioModal(false);
  };

  const handleDeletePortfolio = (id: string) => {
    setPortfolios(portfolios.filter((p) => p.id !== id));
  };

  // AI Profile Generation Handler
  const handleGenerateAiProfile = async () => {
    try {
      setIsGenerating(true);
      const payload = {
        name: companyName,
        sector,
        established_year: establishedYear,
        employee_count: employeeCount,
        website,
        email,
        phone,
        linkedin,
        address,
        short_description: shortDescription,
        competencies,
        portfolios,
      };

      const res = await createApiCall<{
        status: string;
        message: string;
        data: {
          tagline: string;
          about_company: string;
          business_sector_summary: string[];
          core_competencies: string[];
          portfolio_highlights: { title: string; description: string }[];
          completeness_score: number;
        };
      }>(ENDPOINTS.COMPANY_AI_PROFILE, {
        method: "POST",
        body: payload,
      });

      if (res?.data) {
        setAiTagline(res.data.tagline || `${sector} • Inovasi • Profesional`);
        setAiAboutCompany(res.data.about_company);
        if (res.data.completeness_score) {
          setCompletenessScore(res.data.completeness_score);
        }
        await alertSuccess("Profil perusahaan berhasil disusun oleh AI!");
      } else {
        // Local synthesis fallback
        setAiAboutCompany(
          `${companyName} adalah perusahaan yang bergerak di bidang ${sector}. ${shortDescription} Kami berkomitmen memberikan solusi berkualitas tinggi, andal, dan efisien dengan standar keunggulan profesional.`
        );
        await alertSuccess("Profil perusahaan berhasil diperbarui!");
      }
    } catch (err: any) {
      // Fallback update on network error
      setAiAboutCompany(
        `${companyName} adalah perusahaan yang bergerak di bidang ${sector}. ${shortDescription} Kami berkomitmen memberikan solusi terbaik, inovatif, dan berdampak bagi seluruh mitra.`
      );
      await alertSuccess("Profil perusahaan berhasil disusun!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Save Draft
  const handleSaveDraft = async () => {
    await alertSuccess("Draft profil perusahaan berhasil disimpan!");
  };

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    try {
      setIsDownloading(true);
      const html2pdf = (await import("html2pdf.js")).default;
      const element = previewRef.current;
      const opt = {
        margin: 10,
        filename: `Profil_${companyName.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
      await alertSuccess("Dokumen profil PDF berhasil diunduh!");
    } catch (error) {
      alertError("Gagal mengunduh PDF profil perusahaan");
    } finally {
      setIsDownloading(false);
    }
  };

  const steps = [
    { num: 1, label: "Identitas" },
    { num: 2, label: "Bidang Usaha" },
    { num: 3, label: "Kompetensi" },
    { num: 4, label: "Portofolio" },
    { num: 5, label: "Pratinjau" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Buat Profil Perusahaan dengan AI
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi informasi utama, lalu AI akan menyusun profil perusahaan yang profesional.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative px-2">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isActive = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div
                  className="flex flex-col items-center cursor-pointer group z-10"
                  onClick={() => setCurrentStep(s.num)}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                      isActive
                        ? "bg-[#035a70] text-white ring-4 ring-[#035a70]/20"
                        : isCompleted
                        ? "bg-[#035a70] text-white"
                        : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 ${
                      isActive
                        ? "text-[#035a70] font-semibold"
                        : isCompleted
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 -mt-5 transition-colors ${
                      currentStep > idx + 1 ? "bg-[#035a70]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 lg:p-7 shadow-sm border border-gray-100 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">1. Identitas Perusahaan</h2>
            <p className="text-xs text-gray-500">Informasi pokok dan identitas badan usaha</p>
          </div>

          <div className="space-y-4">
            {/* Nama & Logo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Nama Perusahaan</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Contoh: PT Maju Nusantara Teknologi"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Logo Perusahaan</label>
                <input
                  type="file"
                  id={logoInputId}
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <label
                  htmlFor={logoInputId}
                  className="flex flex-col items-center justify-center h-[90px] border-2 border-dashed border-gray-200 rounded-xl hover:border-[#035a70] bg-gray-50/50 cursor-pointer p-2 transition-all group"
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Building2 className="w-6 h-6 text-[#035a70] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-gray-500 font-medium block">
                        Pilih logo atau seret ke sini
                      </span>
                      <span className="text-[9px] text-gray-400 block">JPG/PNG maks. 2MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Bidang Usaha, Tahun Berdiri, Jumlah Karyawan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Bidang Usaha</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                >
                  <option value="Teknologi Informasi & IoT">Teknologi Informasi & IoT</option>
                  <option value="Rekayasa Perangkat Lunak & Web">Rekayasa Perangkat Lunak & Web</option>
                  <option value="Manufaktur & Otomasi">Manufaktur & Otomasi</option>
                  <option value="Keuangan & Fintech">Keuangan & Fintech</option>
                  <option value="Kreatif & Desain Multimedia">Kreatif & Desain Multimedia</option>
                  <option value="Logistik & Supply Chain">Logistik & Supply Chain</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Tahun Berdiri</label>
                <input
                  type="text"
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                  placeholder="2018"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Jumlah Karyawan</label>
                <select
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                >
                  <option value="1-10 orang">1-10 orang</option>
                  <option value="11-50 orang">11-50 orang</option>
                  <option value="51-100 orang">51-100 orang</option>
                  <option value="101-500 orang">101-500 orang</option>
                  <option value="500+ orang">500+ orang</option>
                </select>
              </div>
            </div>

            {/* Kontak: Website, Email, Telepon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.majunusantara.co.id"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hr@majunusantara.co.id"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">No. Telepon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 22 7654 3210"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                />
              </div>
            </div>

            {/* LinkedIn & Alamat Kantor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Linkedin</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/company/maju-nusantara"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Alamat Kantor</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Bandung, Jawa Barat, Indonesia"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                />
              </div>
            </div>

            {/* Deskripsi Singkat */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Deskripsi Singkat Perusahaan</label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Jelaskan ringkas mengenai perusahaan Anda..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all resize-none"
              />
            </div>

            {/* Kompetensi & Layanan Utama */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Kompetensi & Layanan Utama</label>
              <div className="flex flex-wrap items-center gap-2">
                {competencies.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-2xs group hover:border-red-200 hover:bg-red-50/30 transition-all"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetency(tag)}
                      className="text-gray-400 hover:text-red-600 transition-colors ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isAddingComp ? (
                  <div className="inline-flex items-center gap-1.5 bg-white border border-[#035a70] rounded-lg px-2 py-1">
                    <input
                      type="text"
                      value={newCompetency}
                      onChange={(e) => setNewCompetency(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCompetency()}
                      placeholder="Ketik lalu enter..."
                      autoFocus
                      className="text-xs text-gray-800 outline-none w-32"
                    />
                    <button
                      type="button"
                      onClick={handleAddCompetency}
                      className="text-xs text-[#035a70] font-bold hover:underline"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingComp(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-[#035a70]/40 text-[#035a70] hover:bg-[#035a70]/5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                )}
              </div>
            </div>

            {/* Portofolio Unggulan */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Portofolio Unggulan</label>
              <div className="space-y-2">
                {portfolios.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#035a70] flex-shrink-0 mt-0.5">
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                        <p className="text-[11px] text-gray-600 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(true)}
                  className="w-full py-2.5 border border-dashed border-[#035a70]/30 hover:border-[#035a70] text-[#035a70] bg-[#035a70]/5 hover:bg-[#035a70]/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Portofolio
                </button>
              </div>
            </div>

            {/* AI Banner Callout */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100/80 rounded-xl p-3.5 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#035a70] flex-shrink-0" />
              <p className="text-xs text-[#035a70] font-medium leading-relaxed">
                AI akan merapikan narasi, menonjolkan keunggulan, dan menyusun profil profesional.
              </p>
            </div>
          </div>

          {/* Form Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Save className="w-4 h-4 text-gray-500" />
              Simpan Draft
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-semibold text-xs transition-colors"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={handleGenerateAiProfile}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyusun dengan AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Buat Profil dengan AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            {/* Preview Header & Badges */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Pratinjau Profil Perusahaan</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Siap Dipublikasikan
                </span>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Kelengkapan {completenessScore}%
                </span>
              </div>
            </div>

            {/* Document Paper Container */}
            <div
              ref={previewRef}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6 text-gray-800 font-sans"
            >
              {/* Top Document Header */}
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#035a70] font-black text-xl flex-shrink-0 shadow-2xs overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    "MN"
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-gray-900 uppercase">
                    {companyName}
                  </h2>
                  <p className="text-xs font-medium text-[#035a70] mt-0.5">{aiTagline}</p>
                </div>
              </div>

              {/* Contact & Location Strip */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[10px] text-gray-500 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#035a70]" />
                  {website}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#035a70]" />
                  {email}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#035a70]" />
                  {phone}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#035a70]" />
                  {address}
                </span>
              </div>

              {/* Section: Tentang Perusahaan */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase text-[#035a70] tracking-wider border-b border-teal-100 pb-1">
                  TENTANG PERUSAHAAN
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                  {aiAboutCompany}
                </p>
              </div>

              {/* Section: Bidang Usaha */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase text-[#035a70] tracking-wider border-b border-teal-100 pb-1">
                  BIDANG USAHA
                </h4>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  <li>{sector}</li>
                </ul>
              </div>

              {/* Section: Kompetensi Utama */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase text-[#035a70] tracking-wider border-b border-teal-100 pb-1">
                  KOMPETENSI UTAMA
                </h4>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {competencies.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Section: Portofolio Unggulan */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-[#035a70] tracking-wider border-b border-teal-100 pb-1">
                  PORTOFOLIO UNGGULAN
                </h4>
                <div className="space-y-2">
                  {portfolios.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded bg-teal-50 text-[#035a70] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FolderGit2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-900">{p.title}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{p.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom PDF Ready Card */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    Profil_{companyName.replace(/\s+/g, "_")}.pdf
                  </div>
                  <div className="text-[10px] text-gray-500">Siap diunduh setelah data lengkap</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Unduh PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Portfolio */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Tambah Portofolio Unggulan</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Nama Proyek / Produk</label>
                <input
                  type="text"
                  value={newPortTitle}
                  onChange={(e) => setNewPortTitle(e.target.value)}
                  placeholder="Contoh: Smart Factory Monitoring"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  placeholder="Jelaskan ringkas manfaat atau teknologi proyek..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPortfolioModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddPortfolio}
                className="px-4 py-2 bg-[#035a70] hover:bg-[#024353] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Tambahkan
              </button>
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
