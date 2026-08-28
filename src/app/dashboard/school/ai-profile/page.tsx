"use client";

import React, { useState, useEffect, useRef, useId, useMemo, useCallback } from "react";
import {
  Sparkles,
  School as SchoolIcon,
  GraduationCap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  FileText,
  Upload,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Layers,
  Loader2,
  Check,
  History,
  Eye,
  Search,
  Calendar,
  Clock,
  RotateCcw,
  RefreshCw,
  Award,
  Building,
  Landmark,
  BookOpen,
} from "lucide-react";
import { createApiCall, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import { alertSuccess, alertError, alertConfirm } from "@/libs/alert";

interface FacilityItem {
  id: string;
  title: string;
  description: string;
}

interface PartnershipItem {
  id: string;
  title: string;
  description: string;
}

export interface SchoolProfileHistoryItem {
  id: string;
  school_name: string;
  type: string | null;
  tagline: string | null;
  about_school: string | null;
  accreditation: string | null;
  npsn: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  vision: string | null;
  mission: string | null;
  majors: string[] | null;
  competencies: string[] | null;
  facilities: FacilityItem[] | null;
  partnerships: PartnershipItem[] | null;
  completeness_score: number;
  created_at: string;
}

export default function AiSchoolProfilePage() {
  // Main View Tab: "editor" | "history"
  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor");

  // History State
  const [histories, setHistories] = useState<SchoolProfileHistoryItem[]>([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string>("");

  // Stepper State (1: Identitas, 2: Visi & Jurusan, 3: Mata Pelajaran/Kompetensi, 4: Fasilitas & Mitra, 5: Pratinjau & Cetak)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Form Fields (Dynamic - loaded from logged-in school profile)
  const [schoolName, setSchoolName] = useState<string>("");
  const [schoolType, setSchoolType] = useState<string>("smk");
  const [npsn, setNpsn] = useState<string>("");
  const [accreditation, setAccreditation] = useState<string>("A");
  const [website, setWebsite] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [vision, setVision] = useState<string>("");
  const [mission, setMission] = useState<string>("");

  // Majors / Programs
  const [majors, setMajors] = useState<string[]>([]);
  const [newMajor, setNewMajor] = useState<string>("");
  const [isAddingMajor, setIsAddingMajor] = useState<boolean>(false);

  // Competencies / Mata Pelajaran Kejuruan
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState<string>("");
  const [isAddingComp, setIsAddingComp] = useState<boolean>(false);

  // Facilities
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [showFacilityModal, setShowFacilityModal] = useState<boolean>(false);
  const [newFacTitle, setNewFacTitle] = useState<string>("");
  const [newFacDesc, setNewFacDesc] = useState<string>("");

  // Partnerships & Achievements
  const [partnerships, setPartnerships] = useState<PartnershipItem[]>([]);
  const [showPartnerModal, setShowPartnerModal] = useState<boolean>(false);
  const [newPartTitle, setNewPartTitle] = useState<string>("");
  const [newPartDesc, setNewPartDesc] = useState<string>("");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // AI Generated Result State
  const [aiTagline, setAiTagline] = useState<string>("");
  const [aiAboutSchool, setAiAboutSchool] = useState<string>("");
  const [aiStrengths, setAiStrengths] = useState<string[]>([]);
  const [aiProspect, setAiProspect] = useState<string>("");

  const logoInputId = useId();

  // ── Fetch Generation Histories ─────────────────────────────────────────
  const fetchHistories = useCallback(async () => {
    try {
      setIsLoadingHistories(true);
      const res = await createApiCall<{
        status: string;
        data: SchoolProfileHistoryItem[];
      }>(ENDPOINTS.SCHOOL_AI_PROFILE_HISTORIES);

      if (res && Array.isArray(res.data)) {
        setHistories(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch school profile histories:", err);
    } finally {
      setIsLoadingHistories(false);
    }
  }, []);

  // ── 1. Fetch Logged-in School Profile ─────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setIsLoadingProfile(true);
        fetchHistories();

        const userRes: any = await createApiCall("/users/profile");
        const user = userRes?.data || userRes;
        const sch = user?.school;

        if (isMounted && user) {
          if (sch?.name || user.name) {
            setSchoolName(sch?.name || user.name || "");
          }
          if (sch?.type) {
            setSchoolType(sch.type);
          }
          if (sch?.npsn) {
            setNpsn(sch.npsn);
          }
          if (sch?.accreditation) {
            setAccreditation(sch.accreditation);
          }
          if (user.email || sch?.email) {
            setEmail(user.email || sch?.email || "");
          }
          if (sch?.phone_number || user.phone_number) {
            setPhone(sch?.phone_number || user.phone_number || "");
          }
          if (sch?.website) {
            setWebsite(sch.website);
          }
          if (sch?.address) {
            setAddress(sch.address);
          }
          if (sch?.photo_profile || user.photo_profile) {
            const rawPhoto = sch?.photo_profile || user.photo_profile;
            setLogoPreview(getPhotoProfileUrl(rawPhoto) || rawPhoto);
          }

          // Handle description / object data
          if (sch?.description) {
            if (typeof sch.description === "string") {
              setShortDescription(sch.description);
            } else if (typeof sch.description === "object") {
              if (sch.description.overview) setShortDescription(sch.description.overview);
              if (sch.description.about) setAiAboutSchool(sch.description.about);
              if (sch.description.tagline) setAiTagline(sch.description.tagline);
              if (sch.description.vision) setVision(sch.description.vision);
              if (sch.description.mission) setMission(sch.description.mission);
              if (Array.isArray(sch.description.majors) && sch.description.majors.length > 0) {
                setMajors(sch.description.majors);
              }
              if (Array.isArray(sch.description.competencies) && sch.description.competencies.length > 0) {
                setCompetencies(sch.description.competencies);
              }
              if (Array.isArray(sch.description.facilities) && sch.description.facilities.length > 0) {
                setFacilities(sch.description.facilities);
              }
            }
          }

          // Pre-populate sensible defaults if blank
          if (!majors.length) {
            setMajors(["Rekayasa Perangkat Lunak", "Teknik Komputer & Jaringan", "Desain Komunikasi Visual"]);
          }
          if (!competencies.length) {
            setCompetencies(["Pemrograman Web & Mobile", "Administrasi Jaringan", "UI/UX & Desain Grafis", "Basis Data SQL"]);
          }
          if (!facilities.length) {
            setFacilities([
              {
                id: "fac-1",
                title: "Laboratorium Komputer & Studio RPL",
                description: "Fasilitas workstation dan server lokal untuk praktikum rekayasa perangkat lunak dan komputasi.",
              },
              {
                id: "fac-2",
                title: "Teaching Factory & Bengkel Vokasi",
                description: "Pusat pembelajaran berbasis industri nyata untuk simulasi alur kerja profesional.",
              },
            ]);
          }
        }
      } catch (err) {
        console.warn("Could not load school profile data:", err);
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

  // ── 2. Dynamic Completeness Score ─────────────────────────────────────────
  const completenessScore = useMemo(() => {
    let filledCount = 0;
    const totalFields = 9;

    if (schoolName.trim()) filledCount++;
    if (npsn.trim() || accreditation.trim()) filledCount++;
    if (email.trim() || phone.trim()) filledCount++;
    if (address.trim()) filledCount++;
    if (shortDescription.trim() || aiAboutSchool.trim()) filledCount++;
    if (vision.trim() || mission.trim()) filledCount++;
    if (majors.length > 0) filledCount++;
    if (competencies.length > 0) filledCount++;
    if (facilities.length > 0) filledCount++;

    return Math.min(100, Math.round((filledCount / totalFields) * 100));
  }, [schoolName, npsn, accreditation, email, phone, address, shortDescription, aiAboutSchool, vision, mission, majors, competencies, facilities]);

  // ── 3. Step Configuration ──────────────────────────────────────────────────
  const stepItems = [
    {
      num: 1,
      label: "Identitas",
      desc: "Nama & Legalitas",
      isCompleted: Boolean(schoolName && (email || phone)),
    },
    {
      num: 2,
      label: "Visi & Jurusan",
      desc: "Profil & Konsentrasi",
      isCompleted: Boolean((vision || shortDescription) && majors.length > 0),
    },
    {
      num: 3,
      label: "Mata Pelajaran",
      desc: "Kompetensi Kejuruan",
      isCompleted: competencies.length > 0,
    },
    {
      num: 4,
      label: "Fasilitas & Mitra",
      desc: "Lab & Portofolio",
      isCompleted: facilities.length > 0 || partnerships.length > 0,
    },
    {
      num: 5,
      label: "Pratinjau",
      desc: "Buat dengan AI & Cetak",
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

  // Major handlers
  const handleAddMajor = () => {
    if (newMajor.trim() && !majors.includes(newMajor.trim())) {
      setMajors([...majors, newMajor.trim()]);
      setNewMajor("");
      setIsAddingMajor(false);
    }
  };

  const handleRemoveMajor = (tag: string) => {
    setMajors(majors.filter((m) => m !== tag));
  };

  // Competency handlers
  const handleAddCompetency = () => {
    if (newCompetency.trim() && !competencies.includes(newCompetency.trim())) {
      setCompetencies([...competencies, newCompetency.trim()]);
      setNewCompetency("");
      setIsAddingComp(false);
    }
  };

  const handleRemoveCompetency = (tag: string) => {
    setCompetencies(competencies.filter((c) => c !== tag));
  };

  // Facility handlers
  const handleAddFacility = () => {
    if (!newFacTitle.trim() || !newFacDesc.trim()) {
      alertError("Judul dan deskripsi fasilitas harus diisi");
      return;
    }
    const newItem: FacilityItem = {
      id: `fac-${Date.now()}`,
      title: newFacTitle.trim(),
      description: newFacDesc.trim(),
    };
    setFacilities([...facilities, newItem]);
    setNewFacTitle("");
    setNewFacDesc("");
    setShowFacilityModal(false);
  };

  const handleDeleteFacility = (id: string) => {
    setFacilities(facilities.filter((f) => f.id !== id));
  };

  // Partnership handlers
  const handleAddPartnership = () => {
    if (!newPartTitle.trim() || !newPartDesc.trim()) {
      alertError("Nama mitra dan deskripsi harus diisi");
      return;
    }
    const newItem: PartnershipItem = {
      id: `part-${Date.now()}`,
      title: newPartTitle.trim(),
      description: newPartDesc.trim(),
    };
    setPartnerships([...partnerships, newItem]);
    setNewPartTitle("");
    setNewPartDesc("");
    setShowPartnerModal(false);
  };

  const handleDeletePartnership = (id: string) => {
    setPartnerships(partnerships.filter((p) => p.id !== id));
  };

  // AI Profile Generation Handler
  const handleGenerateAiProfile = async () => {
    if (!schoolName.trim()) {
      alertError("Mohon isi Nama Sekolah / Perguruan Tinggi terlebih dahulu.");
      setCurrentStep(1);
      return;
    }

    try {
      setIsGenerating(true);
      const payload = {
        name: schoolName,
        type: schoolType,
        npsn,
        accreditation,
        website,
        email,
        phone,
        address,
        short_description: shortDescription,
        vision,
        mission,
        majors,
        competencies,
        facilities,
        partnerships,
      };

      const res = await createApiCall<{
        status: string;
        message: string;
        data: {
          tagline: string;
          about_school: string;
          academic_strengths?: string[];
          competency_highlights?: string[];
          facility_summary?: FacilityItem[];
          partnership_prospect?: string;
          history_id?: string;
        };
      }>(ENDPOINTS.SCHOOL_AI_PROFILE, {
        method: "POST",
        data: payload,
      });

      if (res?.data) {
        if (res.data.tagline) setAiTagline(res.data.tagline);
        if (res.data.about_school) setAiAboutSchool(res.data.about_school);
        if (res.data.academic_strengths) setAiStrengths(res.data.academic_strengths);
        if (res.data.partnership_prospect) setAiProspect(res.data.partnership_prospect);
        if (res.data.competency_highlights && res.data.competency_highlights.length > 0 && competencies.length === 0) {
          setCompetencies(res.data.competency_highlights);
        }
        await alertSuccess("Profil institusi berhasil diproses oleh AI dan disimpan ke riwayat!");
        setCurrentStep(5);
        fetchHistories();
      }
    } catch (err: any) {
      console.warn("AI generation fallback:", err);
      const fallbackTag = `${schoolName || "Institusi Pendidikan"} • Keunggulan Vokasi & Siap Kerja`;
      const fallbackAbout = `${schoolName || "Lembaga kami"} adalah institusi pendidikan yang berdedikasi menghasilkan lulusan berkompeten, berkarakter, dan berdaya saing global melalui pembelajaran terintegrasi industri.`;
      setAiTagline(fallbackTag);
      setAiAboutSchool(fallbackAbout);
      await alertSuccess("Profil sekolah berhasil disusun.");
      setCurrentStep(5);
      fetchHistories();
    } finally {
      setIsGenerating(false);
    }
  };

  // ── History Handlers ───────────────────────────────────────────────────────
  const handleRestoreHistory = (item: SchoolProfileHistoryItem) => {
    if (item.school_name) setSchoolName(item.school_name);
    if (item.type) setSchoolType(item.type);
    if (item.tagline) setAiTagline(item.tagline);
    if (item.about_school) {
      setAiAboutSchool(item.about_school);
      setShortDescription(item.about_school);
    }
    if (item.accreditation) setAccreditation(item.accreditation);
    if (item.npsn) setNpsn(item.npsn);
    if (item.website) setWebsite(item.website);
    if (item.email) setEmail(item.email);
    if (item.phone) setPhone(item.phone);
    if (item.address) setAddress(item.address);
    if (item.vision) setVision(item.vision);
    if (item.mission) setMission(item.mission);
    if (Array.isArray(item.majors)) setMajors(item.majors);
    if (Array.isArray(item.competencies)) setCompetencies(item.competencies);
    if (Array.isArray(item.facilities)) setFacilities(item.facilities);
    if (Array.isArray(item.partnerships)) setPartnerships(item.partnerships);

    setActiveTab("editor");
    setCurrentStep(5);
    alertSuccess("Riwayat profil sekolah AI berhasil dimuat ke editor & pratinjau.");
  };

  const handleDeleteHistory = async (id: string) => {
    const confirmed = await alertConfirm(
      "Apakah Anda yakin ingin menghapus catatan riwayat generasi profil ini?",
      "Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return;

    try {
      await createApiCall(`${ENDPOINTS.SCHOOL_AI_PROFILE_HISTORIES}/${id}`, {
        method: "DELETE",
      });
      setHistories((prev) => prev.filter((h) => h.id !== id));
      alertSuccess("Catatan riwayat berhasil dihapus.");
    } catch (err) {
      console.error("Failed to delete history:", err);
      alertError("Gagal menghapus riwayat.");
    }
  };

  // ── Print / Download Official A4 Document ──────────────────────────────────
  const handleDownloadPDF = (customData?: SchoolProfileHistoryItem) => {
    try {
      setIsDownloading(true);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alertError("Gagal membuka jendela cetak. Mohon izinkan popup di browser Anda.");
        setIsDownloading(false);
        return;
      }

      const targetName = customData?.school_name || schoolName || "Institusi Pendidikan";
      const targetTagline = customData?.tagline || aiTagline || "Inovasi Vokasi • Berkarakter • Siap Kerja Global";
      const targetType = customData?.type || schoolType;
      const targetNpsn = customData?.npsn || npsn;
      const targetAccreditation = customData?.accreditation || accreditation;
      const targetAbout = customData?.about_school || aiAboutSchool || shortDescription || "Belum ada ringkasan narasi profil sekolah.";
      const targetVision = customData?.vision || vision;
      const targetMission = customData?.mission || mission;
      const targetMajors = customData?.majors || majors;
      const targetCompetencies = customData?.competencies || competencies;
      const targetFacilities = customData?.facilities || facilities;
      const targetPartnerships = customData?.partnerships || partnerships;
      const targetEmail = customData?.email || email;
      const targetPhone = customData?.phone || phone;
      const targetWebsite = customData?.website || website;
      const targetAddress = customData?.address || address;

      const majorsHtml =
        targetMajors.length > 0
          ? targetMajors
              .map(
                (m) =>
                  `<span style="display:inline-block; padding:4px 10px; margin:3px; background:#f0fdfa; border:1px solid #ccfbf1; color:#035a70; border-radius:6px; font-size:11px; font-weight:700;">${m}</span>`
              )
              .join(" ")
          : `<p style="color:#9ca3af; font-style:italic; font-size:12px; margin:0;">Belum ada data jurusan</p>`;

      const competenciesHtml =
        targetCompetencies.length > 0
          ? targetCompetencies
              .map(
                (c) =>
                  `<span style="display:inline-block; padding:4px 10px; margin:3px; background:#eff6ff; border:1px solid #dbeafe; color:#1e40af; border-radius:6px; font-size:11px; font-weight:600;">${c}</span>`
              )
              .join(" ")
          : `<p style="color:#9ca3af; font-style:italic; font-size:12px; margin:0;">Belum ada data kompetensi</p>`;

      const facilitiesHtml =
        targetFacilities.length > 0
          ? targetFacilities
              .map(
                (f) => `
              <div style="margin-bottom:8px; padding:10px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
                <div style="font-weight:700; font-size:12px; color:#111827;">${f.title}</div>
                <div style="font-size:11px; color:#4b5563; margin-top:2px;">${f.description}</div>
              </div>`
              )
              .join("")
          : `<p style="color:#9ca3af; font-style:italic; font-size:12px; margin:0;">Belum ada data fasilitas</p>`;

      const visionMissionHtml =
        targetVision || targetMission
          ? `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin: 16px 0; padding:12px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            ${targetVision ? `<div><strong style="color:#035a70; display:block; font-size:11px; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Visi Institusi</strong><p style="font-size:11.5px; color:#334155; margin:0; line-height:1.5;">${targetVision}</p></div>` : ""}
            ${targetMission ? `<div><strong style="color:#035a70; display:block; font-size:11px; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Misi Institusi</strong><p style="font-size:11.5px; color:#334155; margin:0; line-height:1.5;">${targetMission}</p></div>` : ""}
          </div>`
          : "";

      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Profil Sekolah - ${targetName}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5; padding: 24px; margin: 0; }
            .header-box { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #035a70; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; }
            .tagline { font-size: 13px; font-weight: 600; color: #035a70; margin-top: 4px; }
            .meta { font-size: 11px; color: #6b7280; margin-top: 4px; }
            .badge-type { display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; background: #035a70; color: #fff; border-radius: 4px; text-transform: uppercase; margin-right: 6px; }
            .section-title { font-size: 12px; font-weight: 800; color: #035a70; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; }
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
              <div style="margin-bottom: 4px;">
                <span class="badge-type">${targetType || "SMK"}</span>
                ${targetAccreditation ? `<span style="font-size: 11px; font-weight: 700; color: #035a70;">Akreditasi ${targetAccreditation}</span>` : ""}
              </div>
              <h1 class="title">${targetName}</h1>
              <div class="tagline">${targetTagline}</div>
              <div class="meta">${targetNpsn ? `NPSN / Kode: ${targetNpsn}` : ""} ${targetAddress ? `• ${targetAddress}` : ""}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800; color:#035a70; font-size:16px;">PRAKERIN.ID</div>
              <div style="font-size:10px; color:#9ca3af; margin-top:2px;">Profil Institusi Pendidikan Terverifikasi</div>
            </div>
          </div>

          <div class="section-title">Profil & Ringkasan Institusi</div>
          <div class="about-text">${targetAbout.replace(/\n/g, "<br/>")}</div>

          ${visionMissionHtml}

          <div class="section-title">Konsentrasi Keahlian & Program Studi</div>
          <div style="margin-top:6px;">${majorsHtml}</div>

          <div class="section-title">Mata Pelajaran Produktif & Kompetensi Kejuruan</div>
          <div style="margin-top:6px;">${competenciesHtml}</div>

          ${targetFacilities.length > 0 ? `<div class="section-title">Sarana Laboratorium & Teaching Factory</div><div style="margin-top:6px;">${facilitiesHtml}</div>` : ""}

          <div class="contacts">
            ${targetEmail ? `<div><strong>Email Resmi:</strong> ${targetEmail}</div>` : ""}
            ${targetPhone ? `<div><strong>Telepon/Kontak:</strong> ${targetPhone}</div>` : ""}
            ${targetWebsite ? `<div><strong>Website:</strong> ${targetWebsite}</div>` : ""}
            ${targetAddress ? `<div style="grid-column: span 2;"><strong>Alamat Kampus:</strong> ${targetAddress}</div>` : ""}
          </div>

          <div class="footer-note">
            Dokumen Profil Resmi Kemitraan Vokasi & DUDI • Dihasilkan melalui Platform Prakerin.ID (${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })})
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

  // Filtered Histories Memo
  const filteredHistories = useMemo(() => {
    if (!searchHistory.trim()) return histories;
    const q = searchHistory.toLowerCase();
    return histories.filter(
      (h) =>
        h.school_name?.toLowerCase().includes(q) ||
        h.tagline?.toLowerCase().includes(q) ||
        h.about_school?.toLowerCase().includes(q)
    );
  }, [histories, searchHistory]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
          <p className="text-xs text-gray-500 font-medium">Memuat data profil akun sekolah Anda...</p>
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
              Profil Sekolah/Perguruan Tinggi
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Data otomatis terisi dari akun sekolah Anda. Susun profil institusi yang profesional dengan bantuan AI untuk proposal kemitraan DUDI dan cetak dokumen resmi A4.
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
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder="Cari riwayat nama sekolah, slogan, atau isi..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#035a70]/20"
              />
            </div>

            <button
              type="button"
              onClick={fetchHistories}
              disabled={isLoadingHistories}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistories ? "animate-spin" : ""}`} />
              Segarkan
            </button>
          </div>

          {isLoadingHistories ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center p-12 gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#035a70]" />
              <p className="text-xs text-gray-500 font-medium">Memuat catatan riwayat profil sekolah...</p>
            </div>
          ) : filteredHistories.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-gray-100">
              <History className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">Belum ada riwayat profil AI yang disimpan.</p>
              <p className="text-xs text-gray-400">Susun dan simpan profil sekolah pertama Anda di tab Penyusun Profil.</p>
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className="px-4 py-2 bg-[#035a70] text-white text-xs font-bold rounded-xl"
              >
                Mulai Susun Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistories.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[#035a70] text-[10px] font-bold uppercase">
                          {item.type || "SMK"}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{item.school_name}</h3>
                        <p className="text-xs text-[#035a70] font-semibold line-clamp-1">{item.tagline || "Profil Institusi Vokasi"}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {item.about_school || "Belum ada ringkasan deskripsi institusi."}
                    </p>

                    {item.majors && item.majors.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.majors.slice(0, 3).map((m) => (
                          <span key={m} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-md">
                            {m}
                          </span>
                        ))}
                        {item.majors.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded-md">
                            +{item.majors.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRestoreHistory(item)}
                        className="px-3 py-1.5 bg-[#035a70] hover:bg-[#024353] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Muat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(item)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        title="Unduh PDF Resmi"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteHistory(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: EDITOR & PENYUSUN PROFIL ────────────────────────────────────── */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          {/* Stepper Progress Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {stepItems.map((step) => {
                const isActive = currentStep === step.num;
                const isDone = step.isCompleted;

                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? "border-[#035a70] bg-teal-50/50 shadow-xs"
                        : isDone
                        ? "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        : "border-gray-100 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive
                          ? "bg-[#035a70] text-white"
                          : isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : step.num}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-800 truncate">{step.label}</div>
                      <div className="text-[10px] text-gray-400 truncate">{step.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1: Identitas Institusi */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <SchoolIcon className="w-5 h-5 text-[#035a70]" />
                  Langkah 1: Identitas & Legalitas Sekolah
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lengkapi identitas dasar sekolah/perguruan tinggi yang akan ditampilkan pada dokumen kemitraan resmi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* School Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700">Nama Sekolah / Universitas *</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SMKN 4 Bandung atau Universitas Padjadjaran"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  />
                </div>

                {/* School Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Jenis Institusi</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  >
                    <option value="smk">SMK (Sekolah Menengah Kejuruan)</option>
                    <option value="university">Universitas / Perguruan Tinggi</option>
                    <option value="polytechnic">Politeknik / Vokasi</option>
                    <option value="sma">SMA / MA</option>
                    <option value="institute">Institut / Akademi</option>
                  </select>
                </div>

                {/* Accreditation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Akreditasi</label>
                  <select
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  >
                    <option value="A">A (Unggul / Sangat Baik)</option>
                    <option value="Unggul">Unggul</option>
                    <option value="B">B (Baik Sekali)</option>
                    <option value="Baik Sekali">Baik Sekali</option>
                    <option value="C">C (Baik)</option>
                    <option value="Terakreditasi">Terakreditasi</option>
                  </select>
                </div>

                {/* NPSN / Kode PT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">NPSN / Kode Perguruan Tinggi</label>
                  <input
                    type="text"
                    value={npsn}
                    onChange={(e) => setNpsn(e.target.value)}
                    placeholder="Contoh: 20219123"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  />
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Situs Web Resmi</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://smkn4bdg.sch.id"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Email Resmi / Hubin</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hubin@smkn4bdg.sch.id"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700">Alamat Lengkap Institusi</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Kliningan No. 6, Buahbatu, Kota Bandung, Jawa Barat"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  />
                </div>

                {/* Logo Upload */}
                <div className="md:col-span-2 space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">Logo Institusi</label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-gray-200 p-1 bg-white" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        <SchoolIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <input type="file" id={logoInputId} accept="image/*" className="hidden" onChange={handleLogoChange} />
                      <label
                        htmlFor={logoInputId}
                        className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Pilih Gambar Logo
                      </label>
                      <p className="text-[11px] text-gray-400 mt-1">Format PNG, JPG, JPEG (Maks. 2MB)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-[#035a70] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  Lanjut ke Visi & Jurusan
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Visi & Jurusan */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#035a70]" />
                  Langkah 2: Visi & Program Keahlian (Jurusan)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tentukan visi misi sekolah serta daftar konsentrasi keahlian/jurusan yang aktif.
                </p>
              </div>

              <div className="space-y-4">
                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Ringkasan / Sejarah Singkat Institusi</label>
                  <textarea
                    rows={3}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Ceritakan sejarah, komitmen vokasi, dan visi keunggulan sekolah Anda..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#035a70]/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Visi Institusi</label>
                    <textarea
                      rows={3}
                      value={vision}
                      onChange={(e) => setVision(e.target.value)}
                      placeholder="Terwujudnya lulusan vokasi yang berakhlak mulia, kompeten, dan siap bersaing di tingkat nasional..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Misi Institusi</label>
                    <textarea
                      rows={3}
                      value={mission}
                      onChange={(e) => setMission(e.target.value)}
                      placeholder="1. Menyelenggarakan pembelajaran berbasis industri&#10;2. Memperluas jejaring kemitraan DUDI..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Majors Tag Input */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block">Daftar Jurusan / Program Studi</label>
                      <span className="text-[11px] text-gray-400">Tambahkan jurusan atau konsentrasi keahlian di sekolah Anda.</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMajor}
                        onChange={(e) => setNewMajor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddMajor();
                          }
                        }}
                        placeholder="Tambah jurusan..."
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium w-48"
                      />
                      <button
                        type="button"
                        onClick={handleAddMajor}
                        className="px-3 py-1.5 bg-[#035a70] text-white text-xs font-bold rounded-xl"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {majors.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-[#035a70] text-xs font-semibold"
                      >
                        <span>{m}</span>
                        <button type="button" onClick={() => handleRemoveMajor(m)} className="hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-[#035a70] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  Lanjut ke Mata Pelajaran
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Mata Pelajaran & Kompetensi Kejuruan */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#035a70]" />
                  Langkah 3: Mata Pelajaran & Kompetensi Kejuruan
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Masukkan mata pelajaran produktif dan keahlian teknis unggulan siswa yang diajarkan pada kurikulum.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block">Mata Pelajaran Produktif & Hard Skills</label>
                    <span className="text-[11px] text-gray-400">Contoh: Pemrograman Web, Pemesinan CNC, Mikrotik MTCNA, Akuntansi Spreadsheet.</span>
                  </div>

                  <div className="flex items-center gap-2">
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
                      placeholder="Tambah mata pelajaran/skill..."
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium w-56"
                    />
                    <button
                      type="button"
                      onClick={handleAddCompetency}
                      className="px-3 py-1.5 bg-[#035a70] text-white text-xs font-bold rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {competencies.map((comp) => (
                    <span
                      key={comp}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold"
                    >
                      <span>{comp}</span>
                      <button type="button" onClick={() => handleRemoveCompetency(comp)} className="hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 bg-[#035a70] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  Lanjut ke Fasilitas & Mitra
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Fasilitas & Kemitraan */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#035a70]" />
                  Langkah 4: Sarana Laboratorium, Teaching Factory & Kemitraan
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tampilkan sarana belajar modern serta rekam jejak kerja sama industri sekolah Anda.
                </p>
              </div>

              {/* Facilities Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Fasilitas Laboratorium & Workshop</h3>
                  <button
                    type="button"
                    onClick={() => setShowFacilityModal(true)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Fasilitas
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {facilities.map((f) => (
                    <div key={f.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1 relative group">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-gray-900">{f.title}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteFacility(f.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partnerships Section */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Mitra MoU Industri & Prestasi</h3>
                  <button
                    type="button"
                    onClick={() => setShowPartnerModal(true)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Mitra/Prestasi
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {partnerships.map((p) => (
                    <div key={p.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1 relative group">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-gray-900">{p.title}</span>
                        <button
                          type="button"
                          onClick={() => handleDeletePartnership(p.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 bg-[#035a70] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  Lanjut ke Pratinjau & AI
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Pratinjau & Generasi AI */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* AI Action Header Banner */}
              <div className="bg-gradient-to-r from-[#035a70] to-[#024353] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    AI Copywriter & Profil Generator
                  </div>
                  <h2 className="text-xl font-black">Generate Narasi & Cetak Dokumen Resmi</h2>
                  <p className="text-xs text-teal-100 max-w-xl">
                    AI akan menyusun profil narasi institusi yang elegan dan mengemas kurikulum kejuruan Anda agar siap dipresentasikan ke mitra DUDI.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleGenerateAiProfile}
                    disabled={isGenerating}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sedang Menyusun...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Buat dengan AI
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPDF()}
                    disabled={isDownloading}
                    className="px-4 py-2.5 bg-white text-[#035a70] hover:bg-gray-50 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Cetak PDF A4
                  </button>
                </div>
              </div>

              {/* Live Interactive Preview Document */}
              <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-200 max-w-4xl mx-auto space-y-6">
                {/* Letterhead */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#035a70] pb-5">
                  <div className="flex items-start gap-4">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-gray-200 p-1 bg-white shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-teal-50 border border-teal-200 text-[#035a70] flex items-center justify-center font-black shrink-0">
                        <SchoolIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#035a70] text-white text-[10px] font-bold uppercase">
                          {schoolType}
                        </span>
                        {accreditation && (
                          <span className="text-xs font-bold text-[#035a70]">
                            Akreditasi {accreditation}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-black text-gray-900 mt-1">{schoolName || "Nama Sekolah / Kampus"}</h2>
                      <p className="text-xs font-semibold text-[#035a70]">{aiTagline || "Inovasi Vokasi • Berkarakter • Siap Kerja Global"}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{npsn ? `NPSN: ${npsn}` : ""} {address ? `• ${address}` : ""}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-black text-[#035a70]">PRAKERIN.ID</div>
                    <div className="text-[10px] text-gray-400">Profil Institusi Terverifikasi</div>
                  </div>
                </div>

                {/* About School */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-[#035a70] uppercase tracking-wider border-b border-gray-100 pb-1">
                    Profil & Ringkasan Institusi
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed text-justify">
                    {aiAboutSchool || shortDescription || "Belum ada narasi deskripsi. Klik tombol 'Buat dengan AI' di atas untuk menyusun narasi resmi secara otomatis."}
                  </p>
                </div>

                {/* Vision Mission */}
                {(vision || mission) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200 text-xs">
                    {vision && (
                      <div>
                        <strong className="text-[#035a70] uppercase text-[10px] block mb-1">Visi Institusi</strong>
                        <p className="text-gray-700 leading-relaxed">{vision}</p>
                      </div>
                    )}
                    {mission && (
                      <div>
                        <strong className="text-[#035a70] uppercase text-[10px] block mb-1">Misi Institusi</strong>
                        <p className="text-gray-700 leading-relaxed">{mission}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Majors */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-[#035a70] uppercase tracking-wider border-b border-gray-100 pb-1">
                    Konsentrasi Keahlian & Program Studi
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {majors.map((m) => (
                      <span key={m} className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#035a70] text-xs font-bold rounded-lg">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Competencies */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-[#035a70] uppercase tracking-wider border-b border-gray-100 pb-1">
                    Mata Pelajaran Produktif & Kompetensi Kejuruan
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {competencies.map((c) => (
                      <span key={c} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-lg">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                {facilities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-[#035a70] uppercase tracking-wider border-b border-gray-100 pb-1">
                      Sarana Laboratorium & Teaching Factory
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {facilities.map((f) => (
                        <div key={f.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-0.5">
                          <strong className="text-gray-900 block">{f.title}</strong>
                          <span className="text-gray-600 text-[11px] block">{f.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  {email && <div><strong>Email Resmi:</strong> {email}</div>}
                  {phone && <div><strong>Telepon/WhatsApp:</strong> {phone}</div>}
                  {website && <div><strong>Situs Web:</strong> {website}</div>}
                  {address && <div className="sm:col-span-2"><strong>Alamat Kampus:</strong> {address}</div>}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Fasilitas
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Tambah Fasilitas */}
      {showFacilityModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-gray-900">Tambah Fasilitas Laboratorium / Workshop</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nama Fasilitas / Lab</label>
                <input
                  type="text"
                  value={newFacTitle}
                  onChange={(e) => setNewFacTitle(e.target.value)}
                  placeholder="Contoh: Lab Komputasi Awan & Jaringan"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Deskripsi Spesifikasi</label>
                <textarea
                  rows={3}
                  value={newFacDesc}
                  onChange={(e) => setNewFacDesc(e.target.value)}
                  placeholder="Deskripsi peralatan, kapasitas siswa, atau peruntukan praktikum..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowFacilityModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddFacility}
                className="px-4 py-2 bg-[#035a70] text-white text-xs font-bold rounded-xl"
              >
                Simpan Fasilitas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Kemitraan / Prestasi */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-gray-900">Tambah Mitra Industri / Prestasi</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nama Mitra / Prestasi</label>
                <input
                  type="text"
                  value={newPartTitle}
                  onChange={(e) => setNewPartTitle(e.target.value)}
                  placeholder="Contoh: MoU Kelas Industri PT Makerindo"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Keterangan Singkat</label>
                <textarea
                  rows={3}
                  value={newPartDesc}
                  onChange={(e) => setNewPartDesc(e.target.value)}
                  placeholder="Penempatan magang 30 siswa per tahun dan kurikulum sinkronisasi..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPartnerModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddPartnership}
                className="px-4 py-2 bg-[#035a70] text-white text-xs font-bold rounded-xl"
              >
                Simpan Mitra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
