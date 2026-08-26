"use client";

import React, { useState, useEffect, useRef, useId, useMemo, useCallback } from "react";
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
  CheckCircle2,
  FileText,
  Upload,
  Layers,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FolderGit2,
  Loader2,
  Check,
  History,
  Eye,
  Search,
  Calendar,
  Clock,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { createApiCall, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm } from "@/libs/alert";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
}

interface SectorOption {
  id: string;
  name: string;
}

const isUuid = (val: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val?.trim() || "");

export interface ProfileHistoryItem {
  id: string;
  company_name: string;
  tagline: string | null;
  about_company: string | null;
  sector: string | null;
  established_year: string | null;
  employee_count: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  address: string | null;
  vision: string | null;
  mission: string | null;
  competencies: string[] | null;
  portfolios: PortfolioItem[] | null;
  completeness_score: number;
  created_at: string;
}

export default function AiCompanyProfilePage() {
  // Main View Tab: "editor" | "history"
  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor");

  // History State
  const [histories, setHistories] = useState<ProfileHistoryItem[]>([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string>("");

  // Form Stepper State (1: Identitas, 2: Bidang Usaha, 3: Kompetensi, 4: Portofolio, 5: Pratinjau)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Form Fields (Dynamic - loaded from logged in company profile)
  const [companyName, setCompanyName] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [sectorsList, setSectorsList] = useState<SectorOption[]>([]);
  const [establishedYear, setEstablishedYear] = useState<string>("");
  const [employeeCount, setEmployeeCount] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [vision, setVision] = useState<string>("");
  const [mission, setMission] = useState<string>("");

  // Competencies & Portfolios
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState<string>("");
  const [isAddingComp, setIsAddingComp] = useState<boolean>(false);

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState<boolean>(false);
  const [newPortTitle, setNewPortTitle] = useState<string>("");
  const [newPortDesc, setNewPortDesc] = useState<string>("");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // AI Generated Result State
  const [aiTagline, setAiTagline] = useState<string>("");
  const [aiAboutCompany, setAiAboutCompany] = useState<string>("");

  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputId = useId();

  // ── Fetch Generation Histories ─────────────────────────────────────────
  const fetchHistories = useCallback(async () => {
    try {
      setIsLoadingHistories(true);
      const res = await createApiCall<{
        status: string;
        data: ProfileHistoryItem[];
      }>(ENDPOINTS.COMPANY_AI_PROFILE_HISTORIES);

      if (res && Array.isArray(res.data)) {
        setHistories(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch profile histories:", err);
    } finally {
      setIsLoadingHistories(false);
    }
  }, []);

  // ── 1. Fetch Logged In Company Account Profile & Master Data ───────────────
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setIsLoadingProfile(true);

        // Fetch Histories in parallel
        fetchHistories();

        // 1. Fetch Master Sectors first
        let fetchedSectors: SectorOption[] = [
          { id: "1", name: "Teknologi Informasi & Komunikasi" },
          { id: "2", name: "Manufaktur & Rekayasa Mesin" },
          { id: "3", name: "Otomotif & Transportasi" },
          { id: "4", name: "Keuangan & Perbankan" },
          { id: "5", name: "Kreatif, Desain & Multimedia" },
          { id: "6", name: "Kesehatan & Farmasi" },
          { id: "7", name: "Pendidikan & Pelatihan" },
          { id: "8", name: "Konstruksi & Properti" },
        ];

        try {
          const sectorRes: any = await createApiCall("/sectors");
          const secData = sectorRes?.data || sectorRes;
          if (Array.isArray(secData) && secData.length > 0) {
            fetchedSectors = secData;
          }
        } catch {
          // fallback to default
        }

        if (isMounted) {
          setSectorsList(fetchedSectors);
        }

        // 2. Fetch User Profile
        const userRes: any = await createApiCall("/users/profile");
        const user = userRes?.data || userRes;
        const comp = user?.company;

        if (isMounted && user) {
          if (comp?.name || user.name) {
            setCompanyName(comp?.name || user.name || "");
          }
          if (comp?.sector?.name) {
            setSector(comp.sector.name);
          } else if (comp?.sector_id || comp?.sector) {
            const rawSector = comp.sector_id || (typeof comp.sector === "string" ? comp.sector : "");
            if (rawSector) {
              const matched = fetchedSectors.find(
                (s) => s.id === rawSector || s.name.toLowerCase() === rawSector.toLowerCase()
              );
              if (matched) {
                setSector(matched.name);
              } else if (!isUuid(rawSector)) {
                setSector(rawSector);
              }
            }
          }
          if (user.email || comp?.email) {
            setEmail(user.email || comp?.email || "");
          }
          if (comp?.phone_number || user.phone_number) {
            setPhone(comp?.phone_number || user.phone_number || "");
          }
          if (comp?.website) {
            setWebsite(comp.website);
          }
          if (comp?.address) {
            setAddress(comp.address);
          }
          if (comp?.photo_profile || user.photo_profile) {
            const rawPhoto = comp?.photo_profile || user.photo_profile;
            setLogoPreview(getPhotoProfileUrl(rawPhoto) || rawPhoto);
          }

          // Handle description / object data
          if (comp?.description) {
            if (typeof comp.description === "string") {
              setShortDescription(comp.description);
            } else if (typeof comp.description === "object") {
              if (comp.description.overview) setShortDescription(comp.description.overview);
              if (comp.description.about) setAiAboutCompany(comp.description.about);
              if (comp.description.tagline) setAiTagline(comp.description.tagline);
              if (comp.description.vision) setVision(comp.description.vision);
              if (comp.description.mission) setMission(comp.description.mission);
              if (Array.isArray(comp.description.competencies) && comp.description.competencies.length > 0) {
                setCompetencies(comp.description.competencies);
              }
              if (Array.isArray(comp.description.portfolios) && comp.description.portfolios.length > 0) {
                setPortfolios(comp.description.portfolios);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not load company profile data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [fetchHistories]);

  // ── 2. Calculate Dynamic Completeness Score ────────────────────────────────
  const completenessScore = useMemo(() => {
    let filledCount = 0;
    const totalFields = 8;

    if (companyName.trim()) filledCount++;
    if (sector.trim()) filledCount++;
    if (email.trim() || phone.trim()) filledCount++;
    if (address.trim()) filledCount++;
    if (shortDescription.trim() || aiAboutCompany.trim()) filledCount++;
    if (website.trim() || linkedin.trim()) filledCount++;
    if (competencies.length > 0) filledCount++;
    if (portfolios.length > 0) filledCount++;

    return Math.min(100, Math.round((filledCount / totalFields) * 100));
  }, [companyName, sector, email, phone, address, shortDescription, aiAboutCompany, website, linkedin, competencies, portfolios]);

  // ── 3. Step Configuration ──────────────────────────────────────────────────
  const stepItems = [
    {
      num: 1,
      label: "Identitas",
      desc: "Nama & Kontak",
      isCompleted: Boolean(companyName && (email || phone)),
    },
    {
      num: 2,
      label: "Bidang Usaha",
      desc: "Sektor & Operasional",
      isCompleted: Boolean(sector && (shortDescription || vision)),
    },
    {
      num: 3,
      label: "Kompetensi",
      desc: "Keahlian Dibutuhkan",
      isCompleted: competencies.length > 0,
    },
    {
      num: 4,
      label: "Portofolio",
      desc: "Proyek & Pencapaian",
      isCompleted: portfolios.length > 0,
    },
    {
      num: 5,
      label: "Pratinjau",
      desc: "Proses AI & Cetak",
      isCompleted: completenessScore >= 80,
    },
  ];

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

  // AI Profile Generation / Polish Handler
  const handleGenerateAiProfile = async () => {
    if (!companyName.trim()) {
      alertError("Mohon isi Nama Perusahaan terlebih dahulu.");
      setCurrentStep(1);
      return;
    }

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
        vision,
        mission,
        competencies,
        portfolios,
      };

      const res = await createApiCall<{
        status: string;
        message: string;
        data: {
          tagline: string;
          about_company: string;
          core_competencies?: string[];
          portfolio_highlights?: PortfolioItem[];
          history_id?: string;
        };
      }>(ENDPOINTS.COMPANY_AI_PROFILE, {
        method: "POST",
        data: payload,
      });

      if (res?.data) {
        if (res.data.tagline) setAiTagline(res.data.tagline);
        if (res.data.about_company) setAiAboutCompany(res.data.about_company);
        if (res.data.core_competencies && res.data.core_competencies.length > 0 && competencies.length === 0) {
          setCompetencies(res.data.core_competencies);
        }
        await alertSuccess("Profil perusahaan berhasil diproses dan disimpan ke riwayat!");
        setCurrentStep(5);
        // Refresh history list
        fetchHistories();
      }
    } catch (err: any) {
      console.warn("AI generation fallback:", err);
      const fallbackTag = `${sector || "Industri"} • Inovasi & Keunggulan Profesional`;
      const fallbackAbout = `${companyName || "Perusahaan kami"} adalah entitas yang berfokus pada bidang ${sector || "teknologi dan industri"}. ${shortDescription || "Kami berkomitmen menghadirkan layanan dan produk berstandar tinggi serta membuka peluang kolaborasi bagi talenta muda berprestasi."}`;
      setAiTagline(fallbackTag);
      setAiAboutCompany(fallbackAbout);
      await alertSuccess("Profil perusahaan berhasil disusun.");
      setCurrentStep(5);
      fetchHistories();
    } finally {
      setIsGenerating(false);
    }
  };

  // ── History Handlers ───────────────────────────────────────────────────────
  const handleRestoreHistory = (item: ProfileHistoryItem) => {
    if (item.company_name) setCompanyName(item.company_name);
    if (item.tagline) setAiTagline(item.tagline);
    if (item.about_company) {
      setAiAboutCompany(item.about_company);
      setShortDescription(item.about_company);
    }
    if (item.sector) {
      const matched = sectorsList.find(
        (s) => s.id === item.sector || s.name.toLowerCase() === item.sector?.toLowerCase()
      );
      if (matched) {
        setSector(matched.name);
      } else if (!isUuid(item.sector)) {
        setSector(item.sector);
      }
    }
    if (item.established_year) setEstablishedYear(item.established_year);
    if (item.employee_count) setEmployeeCount(item.employee_count);
    if (item.website) setWebsite(item.website);
    if (item.email) setEmail(item.email);
    if (item.phone) setPhone(item.phone);
    if (item.linkedin) setLinkedin(item.linkedin);
    if (item.address) setAddress(item.address);
    if (item.vision) setVision(item.vision);
    if (item.mission) setMission(item.mission);
    if (Array.isArray(item.competencies)) setCompetencies(item.competencies);
    if (Array.isArray(item.portfolios)) setPortfolios(item.portfolios);

    setActiveTab("editor");
    setCurrentStep(5);
    alertSuccess("Riwayat profil AI berhasil dimuat ke editor & pratinjau.");
  };

  const handleDeleteHistory = async (id: string) => {
    const confirmed = await alertConfirm(
      "Apakah Anda yakin ingin menghapus catatan riwayat generasi ini?",
      "Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return;

    try {
      await createApiCall(`${ENDPOINTS.COMPANY_AI_PROFILE_HISTORIES}/${id}`, {
        method: "DELETE",
      });
      setHistories((prev) => prev.filter((h) => h.id !== id));
      alertSuccess("Catatan riwayat berhasil dihapus.");
    } catch (err) {
      console.error("Failed to delete history:", err);
      alertError("Gagal menghapus riwayat.");
    }
  };

  const handleDownloadHistoryPDF = (item: ProfileHistoryItem) => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alertError("Gagal membuka jendela cetak. Mohon izinkan popup di browser Anda.");
        return;
      }

      const compList = item.competencies || [];
      const portList = item.portfolios || [];

      const competenciesHtml =
        compList.length > 0
          ? compList
              .map(
                (c) =>
                  `<span style="display:inline-block; padding:4px 10px; margin:3px; background:#f0fdfa; border:1px solid #ccfbf1; color:#035a70; border-radius:6px; font-size:11px; font-weight:600;">${c}</span>`
              )
              .join(" ")
          : `<p style="color:#9ca3af; font-style:italic; font-size:12px; margin:0;">Belum ada data kompetensi</p>`;

      const portfoliosHtml =
        portList.length > 0
          ? portList
              .map(
                (p) => `
              <div style="margin-bottom:10px; padding:10px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
                <div style="font-weight:700; font-size:12.5px; color:#111827;">${p.title}</div>
                <div style="font-size:11.5px; color:#4b5563; margin-top:2px;">${p.description}</div>
              </div>`
              )
              .join("")
          : `<p style="color:#9ca3af; font-style:italic; font-size:12px; margin:0;">Belum ada data portofolio</p>`;

      const visionMissionHtml =
        item.vision || item.mission
          ? `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin: 16px 0; padding:12px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            ${item.vision ? `<div><strong style="color:#035a70; display:block; font-size:11px; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Visi</strong><p style="font-size:11.5px; color:#334155; margin:0; line-height:1.5;">${item.vision}</p></div>` : ""}
            ${item.mission ? `<div><strong style="color:#035a70; display:block; font-size:11px; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Misi</strong><p style="font-size:11.5px; color:#334155; margin:0; line-height:1.5;">${item.mission}</p></div>` : ""}
          </div>`
          : "";

      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Company Profile - ${item.company_name || "Perusahaan"}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5; padding: 24px; margin: 0; }
            .header-box { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #035a70; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; }
            .tagline { font-size: 13px; font-weight: 600; color: #035a70; margin-top: 4px; }
            .meta { font-size: 11px; color: #6b7280; margin-top: 4px; }
            .section-title { font-size: 12px; font-weight: 800; color: #035a70; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 20px; margin-bottom: 8px; }
            .about-text { font-size: 12px; color: #374151; line-height: 1.6; text-align: justify; }
            .contacts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 24px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #4b5563; }
            .footer-note { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 30px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <h1 class="title">${item.company_name || "Nama Perusahaan"}</h1>
              <div class="tagline">${item.tagline || item.sector || "Sektor Industri & Solusi Bisnis"}</div>
              <div class="meta">${item.established_year ? `Didirikan: ${item.established_year}` : ""} ${item.established_year && item.employee_count ? "•" : ""} ${item.employee_count ? `Skala: ${item.employee_count}` : ""}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800; color:#035a70; font-size:16px;">PRAKERIN.ID</div>
              <div style="font-size:10px; color:#9ca3af; margin-top:2px;">Profil Industri Terverifikasi</div>
            </div>
          </div>

          <div class="section-title">Tentang Perusahaan</div>
          <div class="about-text">${(item.about_company || "Belum ada ringkasan deskripsi perusahaan.").replace(/\n/g, "<br/>")}</div>

          ${visionMissionHtml}

          <div class="section-title">Kompetensi & Keahlian Utama</div>
          <div style="margin-top:6px;">${competenciesHtml}</div>

          ${portList.length > 0 ? `<div class="section-title">Portofolio & Proyek Unggulan</div><div style="margin-top:6px;">${portfoliosHtml}</div>` : ""}

          <div class="contacts">
            ${item.email ? `<div><strong>Email:</strong> ${item.email}</div>` : ""}
            ${item.phone ? `<div><strong>Telepon:</strong> ${item.phone}</div>` : ""}
            ${item.website ? `<div><strong>Website:</strong> ${item.website}</div>` : ""}
            ${item.linkedin ? `<div><strong>LinkedIn:</strong> ${item.linkedin}</div>` : ""}
            ${item.address ? `<div style="grid-column: span 2;"><strong>Alamat:</strong> ${item.address}</div>` : ""}
          </div>

          <div class="footer-note">
            Dokumen Profil Resmi Perusahaan • Dihasilkan melalui Platform Prakerin.ID (${new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })})
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
    } catch (err) {
      console.error("PDF generation failed:", err);
      alertError("Gagal mencetak PDF.");
    }
  };

  // Export to PDF / Print Handler
  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alertError("Gagal membuka jendela cetak. Mohon izinkan popup di browser Anda.");
        setIsDownloading(false);
        return;
      }

      const competenciesHtml =
        competencies.length > 0
          ? competencies
              .map(
                (c) =>
                  `<span style="display:inline-block; padding:4px 10px; margin:3px; background:#f0fdfa; border:1px solid #ccfbf1; color:#035a70; border-radius:6px; font-size:11px; font-weight:600;">${c}</span>`
              )
              .join(" ")
          : `<p style="color:#9ca3af; font-style:italic; font-size:12px; margin:0;">Belum ada data kompetensi</p>`;

      const portfoliosHtml =
        portfolios.length > 0
          ? portfolios
              .map(
                (p) => `
              <div style="margin-bottom:10px; padding:10px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
                <div style="font-weight:700; font-size:12.5px; color:#111827;">${p.title}</div>
                <div style="font-size:11.5px; color:#4b5563; margin-top:2px;">${p.description}</div>
              </div>`
              )
              .join("")
          : `<p style="color:#9ca3af; font-style:italic; font-size:12px; margin:0;">Belum ada data portofolio</p>`;

      const visionMissionHtml =
        vision || mission
          ? `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin: 16px 0; padding:12px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            ${vision ? `<div><strong style="color:#035a70; display:block; font-size:11px; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Visi</strong><p style="font-size:11.5px; color:#334155; margin:0; line-height:1.5;">${vision}</p></div>` : ""}
            ${mission ? `<div><strong style="color:#035a70; display:block; font-size:11px; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Misi</strong><p style="font-size:11.5px; color:#334155; margin:0; line-height:1.5;">${mission}</p></div>` : ""}
          </div>`
          : "";

      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Company Profile - ${companyName || "Perusahaan"}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5; padding: 24px; margin: 0; }
            .header-box { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #035a70; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; }
            .tagline { font-size: 13px; font-weight: 600; color: #035a70; margin-top: 4px; }
            .meta { font-size: 11px; color: #6b7280; margin-top: 4px; }
            .section-title { font-size: 12px; font-weight: 800; color: #035a70; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 20px; margin-bottom: 8px; }
            .about-text { font-size: 12px; color: #374151; line-height: 1.6; text-align: justify; }
            .contacts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 24px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #4b5563; }
            .footer-note { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 30px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <h1 class="title">${companyName || "Nama Perusahaan"}</h1>
              <div class="tagline">${aiTagline || sector || "Sektor Industri & Solusi Bisnis"}</div>
              <div class="meta">${establishedYear ? `Didirikan: ${establishedYear}` : ""} ${establishedYear && employeeCount ? "•" : ""} ${employeeCount ? `Skala: ${employeeCount}` : ""}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800; color:#035a70; font-size:16px;">PRAKERIN.ID</div>
              <div style="font-size:10px; color:#9ca3af; margin-top:2px;">Profil Industri Terverifikasi</div>
            </div>
          </div>

          <div class="section-title">Tentang Perusahaan</div>
          <div class="about-text">${(aiAboutCompany || shortDescription || "Belum ada ringkasan deskripsi perusahaan.").replace(/\n/g, "<br/>")}</div>

          ${visionMissionHtml}

          <div class="section-title">Kompetensi & Keahlian Utama</div>
          <div style="margin-top:6px;">${competenciesHtml}</div>

          ${portfolios.length > 0 ? `<div class="section-title">Portofolio & Proyek Unggulan</div><div style="margin-top:6px;">${portfoliosHtml}</div>` : ""}

          <div class="contacts">
            ${email ? `<div><strong>Email:</strong> ${email}</div>` : ""}
            ${phone ? `<div><strong>Telepon:</strong> ${phone}</div>` : ""}
            ${website ? `<div><strong>Website:</strong> ${website}</div>` : ""}
            ${linkedin ? `<div><strong>LinkedIn:</strong> ${linkedin}</div>` : ""}
            ${address ? `<div style="grid-column: span 2;"><strong>Alamat:</strong> ${address}</div>` : ""}
          </div>

          <div class="footer-note">
            Dokumen Profil Resmi Perusahaan • Dihasilkan melalui Platform Prakerin.ID (${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })})
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
        setIsDownloading(false);
      }, 500);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alertError("Gagal mencetak PDF.");
      setIsDownloading(false);
    }
  };

  // ── 4. Filtered Histories Memo ──────────────────────────────────────────
  const filteredHistories = useMemo(() => {
    if (!searchHistory.trim()) return histories;
    const q = searchHistory.toLowerCase();
    return histories.filter(
      (h) =>
        h.company_name?.toLowerCase().includes(q) ||
        h.tagline?.toLowerCase().includes(q) ||
        h.sector?.toLowerCase().includes(q) ||
        h.about_company?.toLowerCase().includes(q)
    );
  }, [histories, searchHistory]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
          <p className="text-xs text-gray-500 font-medium">Memuat data profil akun perusahaan Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Buat Profil Perusahaan AI
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#035a70] border border-teal-200">
              <Sparkles className="w-3.5 h-3.5" />
              Fitur Gratis
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Data otomatis diambil dari profil akun Anda. Lengkapi formulir dan biarkan AI menyusun narasi company profile yang profesional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Mode Tabs */}
          <div className="flex items-center p-1 bg-gray-200/60 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "editor"
                  ? "bg-white text-[#035a70] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Penyusun Profil
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("history");
                fetchHistories();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-white text-[#035a70] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Riwayat Generasi
              {histories.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-teal-100 text-[#035a70] rounded-full">
                  {histories.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── TAB: RIWAYAT GENERASI AI ────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* History Toolbar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder="Cari nama perusahaan, tagline, atau sektor industri..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchHistories}
                disabled={isLoadingHistories}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistories ? "animate-spin" : ""}`} />
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className="px-4 py-2 bg-[#035a70] hover:bg-[#024353] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat Profil Baru
              </button>
            </div>
          </div>

          {/* History Cards / List */}
          {isLoadingHistories ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-2xl p-12 border border-gray-100 shadow-sm gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
              <p className="text-xs text-gray-500 font-medium">Memuat riwayat profil AI...</p>
            </div>
          ) : filteredHistories.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4 text-[#035a70]">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {searchHistory.trim() ? "Riwayat Tidak Ditemukan" : "Belum Ada Riwayat Generasi AI"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mb-6">
                {searchHistory.trim()
                  ? "Tidak ada data riwayat yang cocok dengan kata kunci pencarian Anda."
                  : "Setiap profil perusahaan yang Anda buat atau proses menggunakan AI akan tersimpan di sini secara otomatis."}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className="px-5 py-2.5 bg-[#035a70] hover:bg-[#024353] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mulai Buat Profil AI Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHistories.map((item) => {
                const dateFormatted = new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3.5">
                      {/* Top Header info */}
                      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                            <Clock className="w-3 h-3" />
                            {dateFormatted}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#035a70] transition-colors line-clamp-1">
                            {item.company_name}
                          </h4>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-[#035a70] border border-teal-100 shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-teal-600" />
                          {item.completeness_score || 85}%
                        </span>
                      </div>

                      {/* Tagline Badge */}
                      {item.tagline && (
                        <div className="px-2.5 py-1 bg-teal-50/70 border border-teal-100 rounded-lg text-[11px] font-semibold text-[#035a70] line-clamp-1">
                          {item.tagline}
                        </div>
                      )}

                      {/* About snippet */}
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {item.about_company || "Ringkasan profil perusahaan hasil generasi AI."}
                      </p>

                      {/* Sektor & Meta */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                        <div>
                          <span className="block text-[10px] text-gray-400 font-semibold">Sektor</span>
                          <span className="font-bold text-gray-800 line-clamp-1">{item.sector || "Industri & Bisnis"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400 font-semibold">Portofolio</span>
                          <span className="font-bold text-gray-800">
                            {item.portfolios && item.portfolios.length > 0 ? `${item.portfolios.length} Proyek` : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Competencies Chips */}
                      {item.competencies && item.competencies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.competencies.slice(0, 3).map((comp, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium"
                            >
                              {comp}
                            </span>
                          ))}
                          {item.competencies.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md text-[10px] font-medium">
                              +{item.competencies.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleRestoreHistory(item)}
                        className="flex-1 px-3 py-2 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Buka di Editor
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadHistoryPDF(item)}
                        title="Unduh PDF Profil Ini"
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(item.id)}
                        title="Hapus Riwayat Ini"
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: PENYUSUN PROFIL (EDITOR) ──────────────────────────────────── */}
      {activeTab === "editor" && (
        <>
          {/* ─── INTERACTIVE PROGRESS STEPPER BAR ───────────────────────────── */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700">Kelengkapan Profil:</span>
                <div className="w-36 sm:w-52 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/80">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-[#035a70] h-full rounded-full transition-all duration-500"
                    style={{ width: `${completenessScore}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-[#035a70]">{completenessScore}%</span>
              </div>

              <div className="text-[11px] text-gray-400 font-medium">
                Langkah {currentStep} dari 5: <span className="font-semibold text-gray-700">{stepItems[currentStep - 1]?.label}</span>
              </div>
            </div>

            {/* Clickable Step Circles */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 relative px-2">
              {stepItems.map((step) => {
                const isActive = currentStep === step.num;
                const isDone = step.isCompleted;

                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex flex-col items-center text-center p-2 rounded-xl transition-all group ${
                      isActive
                        ? "bg-teal-50/60 border border-teal-200 shadow-2xs"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all mb-1.5 shadow-2xs ${
                        isActive
                          ? "bg-[#035a70] text-white ring-4 ring-[#035a70]/15"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      }`}
                    >
                      {isDone && !isActive ? <Check className="w-4 h-4" /> : step.num}
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs font-bold line-clamp-1 ${
                        isActive ? "text-[#035a70]" : "text-gray-700"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="hidden md:block text-[10px] text-gray-400 mt-0.5">
                      {step.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

      {/* ─── MAIN 2-COLUMN WORKSPACE: FORM & LIVE PAPER PREVIEW ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Form Steps (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          {/* STEP 1: IDENTITAS PERUSAHAAN */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#035a70]" />
                  Langkah 1: Identitas & Kontak Perusahaan
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Informasi dasar mengenai nama entitas, logo, serta saluran komunikasi resmi.
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Logo Perusahaan
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id={logoInputId}
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <label
                      htmlFor={logoInputId}
                      className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                      Pilih Logo
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, maks. 2MB</p>
                  </div>
                </div>
              </div>

              {/* Nama Perusahaan */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="mis. PT Solusi Digital Nusantara"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@perusahaan.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
                  />
                </div>
              </div>

              {/* Website & LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Website Perusahaan
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.perusahaan.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/company/nama-perusahaan"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
                  />
                </div>
              </div>

              {/* Alamat Kantor */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Alamat Kantor / Lokasi
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Merdeka No. 10, Bandung, Jawa Barat"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium resize-none"
                />
              </div>

              {/* Navigation button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  Lanjut ke Bidang Usaha
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BIDANG USAHA & OPERASIONAL */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#035a70]" />
                  Langkah 2: Bidang Usaha & Ringkasan Bisnis
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tentukan sektor industri, ukuran perusahaan, dan ringkasan visi-misi Anda.
                </p>
              </div>

              {/* Sector Selection (Data Selector) */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Sektor Industri / Bidang Usaha <span className="text-red-500">*</span>
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium text-gray-800"
                >
                  <option value="">-- Pilih Sektor Industri --</option>
                  {sectorsList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  {sector && !sectorsList.some((s) => s.name === sector) && !isUuid(sector) && (
                    <option value={sector}>{sector}</option>
                  )}
                </select>
              </div>

              {/* Tahun Berdiri & Jumlah Karyawan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Tahun Berdiri
                  </label>
                  <input
                    type="text"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    placeholder="mis. 2018"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Skala / Jumlah Karyawan
                  </label>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium text-gray-800"
                  >
                    <option value="">-- Pilih Jumlah Karyawan --</option>
                    <option value="1-10 orang">1 - 10 orang</option>
                    <option value="11-50 orang">11 - 50 orang</option>
                    <option value="51-100 orang">51 - 100 orang</option>
                    <option value="101-500 orang">101 - 500 orang</option>
                    <option value="> 500 orang">&gt; 500 orang</option>
                  </select>
                </div>
              </div>

              {/* Ringkasan Tentang Perusahaan */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Deskripsi Singkat / Profil Perusahaan
                </label>
                <textarea
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Tuliskan fokus bisnis, produk, atau layanan utama perusahaan Anda..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium resize-none"
                />
              </div>

              {/* Visi & Misi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Visi Perusahaan
                  </label>
                  <textarea
                    rows={2}
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    placeholder="Menjadi penyedia solusi teknologi terdepan..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Misi Perusahaan
                  </label>
                  <textarea
                    rows={2}
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    placeholder="Memberikan layanan inovatif dan terpercaya..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium resize-none"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  Lanjut ke Kompetensi
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: KOMPETENSI & KEAHLIAN */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#035a70]" />
                  Langkah 3: Kompetensi & Keahlian Utama
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tambahkan keahlian teknis atau spesialisasi yang relevan dengan perusahaan Anda.
                </p>
              </div>

              {/* Competency Tags Manager */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Daftar Kompetensi Dibutuhkan ({competencies.length})
                  </label>
                  {!isAddingComp && (
                    <button
                      type="button"
                      onClick={() => setIsAddingComp(true)}
                      className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Tag
                    </button>
                  )}
                </div>

                {isAddingComp && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-teal-200">
                    <input
                      type="text"
                      value={newCompetency}
                      onChange={(e) => setNewCompetency(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCompetency();
                        }
                      }}
                      placeholder="mis. Web Developer, IoT, Data Science"
                      className="flex-1 px-2.5 py-1.5 text-xs focus:outline-none font-medium"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCompetency}
                      className="px-3 py-1.5 bg-[#035a70] text-white text-xs font-bold rounded-lg shadow-2xs"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewCompetency("");
                        setIsAddingComp(false);
                      }}
                      className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {/* Tags List */}
                {competencies.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    Belum ada tag kompetensi ditambahkan. Klik <strong>+ Tambah Tag</strong> di atas.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {competencies.map((comp) => (
                      <span
                        key={comp}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-medium shadow-2xs group"
                      >
                        <span>{comp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCompetency(comp)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  Lanjut ke Portofolio
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PORTOFOLIO & PROYEK */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-[#035a70]" />
                    Langkah 4: Portofolio & Proyek Unggulan
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tampilkan produk, proyek sukses, atau inovasi yang telah diselesaikan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(true)}
                  className="px-3 py-1.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Proyek
                </button>
              </div>

              {/* Portfolios List */}
              {portfolios.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-2">
                  <FolderGit2 className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">Belum ada portofolio ditambahkan.</p>
                  <button
                    type="button"
                    onClick={() => setShowPortfolioModal(true)}
                    className="px-3.5 py-1.5 bg-teal-50 text-[#035a70] border border-teal-200 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Portofolio Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {portfolios.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-900">{p.title}</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed">{p.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePortfolio(p.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  Lihat Pratinjau & Buat Profil AI
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PRATINJAU & PUBLIKASI */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#035a70]" />
                  Langkah 5: Pratinjau & Narasi AI
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tinjau profil Anda dan gunakan AI untuk menyusun narasi promosi perusahaan secara profesional.
                </p>
              </div>

              {/* AI Tagline Field */}
              <div>
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#035a70]" />
                  Tagline Perusahaan (AI Generated)
                </label>
                <input
                  type="text"
                  value={aiTagline}
                  onChange={(e) => setAiTagline(e.target.value)}
                  placeholder="mis. Inovasi Tanpa Batas • Solusi Terpercaya"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#035a70]/20"
                />
              </div>

              {/* AI About Narration Field */}
              <div>
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#035a70]" />
                  Narasi Profil Perusahaan (Hasil AI)
                </label>
                <textarea
                  rows={5}
                  value={aiAboutCompany}
                  onChange={(e) => setAiAboutCompany(e.target.value)}
                  placeholder="Klik 'Buat dengan AI' di bawah untuk menyusun narasi profil secara otomatis..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 resize-none"
                />
              </div>

              {/* Navigation buttons */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Edit Form Portofolio
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAiProfile}
                    disabled={isGenerating}
                    className="px-4 py-2.5 bg-[#035a70] hover:bg-[#024353] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Buat dengan AI
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Paper Preview (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#035a70]" />
              <h3 className="text-sm font-bold text-gray-900">Pratinjau Profil</h3>
            </div>
            <span className="text-[11px] font-bold text-[#035a70] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              Live Preview
            </span>
          </div>

          {/* Paper Document Representation */}
          <div
            ref={previewRef}
            className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-5 text-gray-800"
          >
            {/* Header: Logo & Title */}
            <div className="flex items-start gap-4 border-b border-gray-100 pb-4">
              <div className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 relative">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Building2 className="w-7 h-7 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-gray-900 truncate">
                  {companyName || "Nama Perusahaan Anda"}
                </h2>
                <p className="text-xs font-semibold text-[#035a70] mt-0.5">
                  {aiTagline || sector || "Sektor Industri & Bidang Usaha"}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                  {establishedYear && <span>Est. {establishedYear}</span>}
                  {establishedYear && employeeCount && <span>•</span>}
                  {employeeCount && <span>{employeeCount}</span>}
                </div>
              </div>
            </div>

            {/* Tentang Perusahaan */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-gray-900 text-[11px] uppercase tracking-wider text-gray-400">
                Tentang Perusahaan
              </h4>
              <p className="text-gray-700 leading-relaxed text-[11px]">
                {aiAboutCompany ||
                  shortDescription ||
                  "Belum ada deskripsi profil perusahaan. Isi pada formulir di sebelah kiri atau klik Buat dengan AI."}
              </p>
            </div>

            {/* Visi & Misi jika ada */}
            {(vision || mission) && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-xl text-[10px]">
                {vision && (
                  <div>
                    <span className="font-bold text-gray-900 block mb-0.5">Visi</span>
                    <span className="text-gray-600">{vision}</span>
                  </div>
                )}
                {mission && (
                  <div>
                    <span className="font-bold text-gray-900 block mb-0.5">Misi</span>
                    <span className="text-gray-600">{mission}</span>
                  </div>
                )}
              </div>
            )}

            {/* Kompetensi & Spesialisasi */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-[11px] uppercase tracking-wider text-gray-400">
                Kompetensi & Keahlian Dibutuhkan
              </h4>
              {competencies.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">Belum ada kompetensi dipilih</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {competencies.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-[#035a70] rounded-md font-medium text-[10px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Portofolio Ringkas */}
            {portfolios.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-[11px] uppercase tracking-wider text-gray-400">
                  Portofolio & Proyek
                </h4>
                <div className="space-y-1.5">
                  {portfolios.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-2 bg-gray-50 rounded-lg text-[10px] space-y-0.5">
                      <div className="font-bold text-gray-900">{p.title}</div>
                      <div className="text-gray-600 line-clamp-1">{p.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Kontak */}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
              {email && (
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-[#035a70] shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-[#035a70] shrink-0" />
                  <span className="truncate">{phone}</span>
                </div>
              )}
              {website && (
                <div className="flex items-center gap-1.5 truncate">
                  <Globe className="w-3 h-3 text-[#035a70] shrink-0" />
                  <span className="truncate">{website}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-1.5 truncate col-span-2">
                  <MapPin className="w-3 h-3 text-[#035a70] shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )}

      {/* Modal: Tambah Portofolio */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#035a70]" />
                Tambah Portofolio / Proyek
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Nama Proyek / Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPortTitle}
                  onChange={(e) => setNewPortTitle(e.target.value)}
                  placeholder="mis. Smart Factory Monitoring System"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Deskripsi Singkat Proyek <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  placeholder="Jelaskan ruang lingkup, teknologi yang dipakai, atau dampak yang dihasilkan..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 font-medium resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewPortTitle("");
                  setNewPortDesc("");
                  setShowPortfolioModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddPortfolio}
                className="px-4 py-2 bg-[#035a70] hover:bg-[#024353] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan Proyek
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
