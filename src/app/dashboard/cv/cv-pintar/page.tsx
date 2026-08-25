"use client";
import FeatureActivityLog from "@/components/FeatureActivityLog";
import {
  Sparkles,
  Download,
  Save,
  Check,
  Camera,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  User,
  Award,
  FolderGit2,
  Eye,
  RefreshCw,
  ShieldCheck,
  Layers,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import { CVResult } from "@/models/CV";
import Cookies from "js-cookie";
import { alertSuccess, alertError, alertConfirm } from "@/libs/alert";
import { resizeImageToPasFoto } from "@/utils/cropImage";

interface ProjectItem {
  id: string;
  name: string;
  role: string;
  technologies: string;
  year?: string;
  description: string;
}

interface CVFormData {
  fullName: string;
  schoolName: string;
  major: string;
  degreeYear: string;
  competencyArea: string;
  email: string;
  phone: string;
  address: string;
  github: string;
  linkedin: string;
  competencyDescription: string;
  skills: string[];
  projects: ProjectItem[];
  photoUrl: string | null;
}

const COMPETENCY_OPTIONS = [
  "Frontend Development",
  "Backend Development",
  "Fullstack Development",
  "Mobile App Development (Flutter/React Native)",
  "UI/UX Design & Product Design",
  "DevOps & Cloud Engineering",
  "Cyber Security & Networking",
  "Data Science & AI / ML",
  "Software Quality Assurance (QA)",
  "Graphic Design & Multimedia",
  "Digital Marketing & SEO",
  "Administrasi Perkantoran & Tata Kelola",
  "Teknik Komputer & Jaringan (TKJ)",
  "Rekayasa Perangkat Lunak (RPL)",
  "Lainnya",
];

const PRESET_SKILLS = [
  "HTML5",
  "CSS3",
  "JavaScript (ES6+)",
  "TypeScript",
  "React.js",
  "Next.js",
  "Tailwind CSS",
  "REST API",
  "Node.js",
  "PHP & Laravel",
  "Git & GitHub",
  "MySQL",
  "Figma",
  "Responsive Web Design",
  "Problem Solving",
  "Kerja Tim & Komunikasi",
];

export default function BuatCvPintarPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"stepper" | "all">("stepper");
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [savingDashboard, setSavingDashboard] = useState<boolean>(false);
  const [newSkillInput, setNewSkillInput] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [tone, setTone] = useState<string>("Professional");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ATS");
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CVFormData>({
    fullName: "",
    schoolName: "",
    major: "",
    degreeYear: "2022 - 2025",
    competencyArea: "Frontend Development",
    email: "",
    phone: "",
    address: "",
    github: "",
    linkedin: "",
    competencyDescription: "",
    skills: ["HTML5", "CSS3", "JavaScript", "React.js", "Tailwind CSS", "REST API", "Git"],
    projects: [
      {
        id: "proj-1",
        name: "Dashboard Monitoring IoT",
        role: "Frontend Developer",
        technologies: "React, Tailwind CSS, REST API",
        year: "2024",
        description: "Membangun dashboard real-time dan meningkatkan kecepatan pemantauan data sistem.",
      },
    ],
    photoUrl: null,
  });

  // AI Generation Progress States
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const stages = [
    "Mengumpulkan ringkasan profil...",
    "Menganalisis pencapaian & pengalaman...",
    "Menyusun kata kunci ramah ATS dengan Gemini AI...",
    "Memoles tata bahasa & bullet point aksi...",
    "Hampir selesai...",
  ];

  // Camera capture states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load User Profile Data automatically
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const profileRes = await API.get(`${ENDPOINTS.USERS}/profile`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });

      if (profileRes.status === 200 && profileRes.data?.data) {
        const uData = profileRes.data.data;
        const sData = uData.student || {};

        let userPfpUrl: string | null = null;
        if (uData.photo_profile) {
          const cleanPhoto = uData.photo_profile.startsWith("/")
            ? uData.photo_profile.slice(1)
            : uData.photo_profile;
          userPfpUrl = cleanPhoto.startsWith("http")
            ? cleanPhoto
            : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/photo-profile/${cleanPhoto}`;
        }

        // Parse skills from profile if available
        let profileSkills: string[] = [];
        if (sData.skill) {
          profileSkills = sData.skill
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        }

        setFormData((prev) => {
          const userGithub = sData.portofolio_link || (prev.github === "github.com/adityapratama" ? "" : prev.github) || "";
          const userLinkedin = sData.social_media_link || (prev.linkedin === "linkedin.com/in/adityapratama" ? "" : prev.linkedin) || "";

          return {
            ...prev,
            fullName: sData.name || uData.username || (prev.fullName === "Aditya Pratama" ? "" : prev.fullName) || "",
            email: uData.email || prev.email || "",
            phone: sData.phone_number || prev.phone || "",
            address: sData.address || (prev.address === "Bandung, Jawa Barat, Indonesia" ? "" : prev.address) || "",
            schoolName: sData.school_name || (prev.schoolName === "SMK Negeri 4 Bandung" ? "" : prev.schoolName) || "",
            major: sData.major?.name || (prev.major === "Rekayasa Perangkat Lunak" ? "" : prev.major) || "",
            degreeYear: sData.class ? `Kelas ${sData.class} (Aktif)` : prev.degreeYear || "2022 - 2025",
            github: userGithub,
            linkedin: userLinkedin,
            skills: profileSkills.length > 0 ? profileSkills : prev.skills,
            photoUrl: userPfpUrl || prev.photoUrl,
            competencyDescription:
              prev.competencyDescription && !prev.competencyDescription.includes("Aditya")
                ? prev.competencyDescription
                : sData.name
                ? `Siswa ${sData.school_name || "SMK"} jurusan ${sData.major?.name || "Rekayasa Perangkat Lunak"} yang fokus pada ${prev.competencyArea || "Frontend Development"}. Terbiasa bekerja dengan teknologi web modern, menerapkan best practices, dan berkolaborasi secara produktif dalam tim.`
                : "",
          };
        });
      }
    } catch (err) {
      console.error("Gagal memuat profil otomatis:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // Check saved draft in localStorage first
    try {
      const savedDraft = localStorage.getItem("prakerin_cv_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        setLoadingProfile(false);
        return;
      }
    } catch (e) {
      // ignore
    }
    fetchUserProfile();
  }, []);

  // Progress Bar effect during AI generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(10);
      setStageIndex(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const next = prev + Math.floor(Math.random() * 9) + 4;
          return next > 90 ? 90 : next;
        });
        setStageIndex((prevStage) => (prevStage + 1) % stages.length);
      }, 900);
    } else {
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Dynamic Completeness Score Calculation (0 - 100%)
  const completeness = useMemo(() => {
    let score = 0;
    if (formData.fullName.trim()) score += 15;
    if (formData.email.trim()) score += 10;
    if (formData.phone.trim()) score += 10;
    if (formData.schoolName.trim()) score += 15;
    if (formData.major.trim()) score += 10;
    if (formData.competencyArea.trim()) score += 10;
    if (formData.competencyDescription.trim().length > 20) score += 15;
    if (formData.skills.length >= 3) score += 10;
    if (formData.projects.length > 0 && formData.projects[0].name.trim()) score += 15;
    return Math.min(100, score);
  }, [formData]);

  // Photo Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedFile = await resizeImageToPasFoto(file, 300, 400);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFormData((prev) => ({
            ...prev,
            photoUrl: ev.target?.result as string,
          }));
        };
        reader.readAsDataURL(resizedFile);
      } catch (err) {
        console.error("Gagal memproses foto", err);
      }
    }
  };

  // Camera Handler
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alertError("Gagal mengakses kamera. Pastikan izin kamera browser telah diaktifkan.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const targetRatio = 3 / 4;
      const videoRatio = video.videoWidth / video.videoHeight;

      let cropWidth = video.videoWidth;
      let cropHeight = video.videoHeight;

      if (videoRatio > targetRatio) {
        cropWidth = video.videoHeight * targetRatio;
      } else {
        cropHeight = video.videoWidth / targetRatio;
      }

      const sx = (video.videoWidth - cropWidth) / 2;
      const sy = (video.videoHeight - cropHeight) / 2;

      canvas.width = 300;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  // Projects Handler
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: "",
      role: formData.competencyArea || "Junior Developer",
      technologies: "React, Tailwind CSS, REST API",
      year: "2024",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const handleDeleteProject = (id: string) => {
    if (formData.projects.length <= 1) {
      setFormData((prev) => ({
        ...prev,
        projects: [
          {
            id: `proj-${Date.now()}`,
            name: "",
            role: "",
            technologies: "",
            year: "",
            description: "",
          },
        ],
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Skills Handler
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      localStorage.setItem("prakerin_cv_draft", JSON.stringify(formData));
      alertSuccess("Draft CV berhasil disimpan di perangkat ini!");
    } catch (e) {
      alertError("Gagal menyimpan draft.");
    }
  };

  const handleResetToProfile = async () => {
    const isConfirmed = await alertConfirm(
      "Muat Ulang Data?",
      "Form akan disetel kembali sesuai data profil akun Anda."
    );
    if (isConfirmed) {
      localStorage.removeItem("prakerin_cv_draft");
      setFormData({
        fullName: "",
        schoolName: "",
        major: "",
        degreeYear: "2022 - 2025",
        competencyArea: "Frontend Development",
        email: "",
        phone: "",
        address: "",
        github: "",
        linkedin: "",
        competencyDescription: "",
        skills: ["HTML5", "CSS3", "JavaScript", "React.js", "Tailwind CSS", "REST API", "Git"],
        projects: [
          {
            id: "proj-1",
            name: "Dashboard Monitoring IoT",
            role: "Frontend Developer",
            technologies: "React, Tailwind CSS, REST API",
            year: "2024",
            description: "Membangun dashboard real-time dan meningkatkan kecepatan pemantauan data sistem.",
          },
        ],
        photoUrl: null,
      });
      await fetchUserProfile();
      alertSuccess("Data profil berhasil dimuat ulang!");
    }
  };

  // Generate CV with AI (Gemini Backend)
  const handleGenerateAI = async () => {
    if (!formData.fullName.trim()) {
      alertError("Mohon masukkan nama lengkap terlebih dahulu.");
      setActiveStep(1);
      return;
    }

    setIsGenerating(true);
    try {
      const profileUserPayload = {
        personal_details: {
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phone,
          address: formData.address,
          linkedin_url: formData.linkedin || formData.github,
        },
        work_experience: formData.projects
          .filter((p) => p.name.trim())
          .map((p) => ({
            job_title: p.role || formData.competencyArea || "Developer",
            company: p.name,
            start_date: p.year || "2024",
            end_date: "2024",
            description_points: [p.description || "Bertanggung jawab atas pengembangan fitur dan pemeliharaan kode."],
          })),
        education: formData.schoolName
          ? [
              {
                institution: formData.schoolName,
                degree: formData.degreeYear || "Peserta Didik",
                field_of_study: formData.major || "Umum",
                graduation_year: formData.degreeYear || "2025",
              },
            ]
          : [],
        skills: {
          technical: formData.skills,
          languages: ["Bahasa Indonesia"],
        },
      };

      const customInstruction = `
Bidang Keahlian: ${formData.competencyArea}
Deskripsi Kompetensi Pengguna: ${formData.competencyDescription}
Tone: ${tone}
${aiPrompt ? `Instruksi Tambahan: ${aiPrompt}` : ""}
Tolong susun ringkasan profil (summary) profesional standar ATS, sempurnakan bullet points proyek/pengalaman dengan kata kerja aktif (action verbs) berorientasi dampak, dan pilih kata kunci teknis yang paling relevan.
`;

      const response = await API.post(
        `${ENDPOINTS.CURRICULUM_VITAE}/generate-cv`,
        {
          profile_user: profileUserPayload,
          prompt_user: customInstruction,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        const result = response.data;
        setProgress(100);

        // Update form state with AI-enhanced content
        setFormData((prev) => ({
          ...prev,
          competencyDescription: result.summary || prev.competencyDescription,
          skills: result.skills && result.skills.length > 0 ? result.skills : prev.skills,
          projects:
            result.work_experience && result.work_experience.length > 0
              ? result.work_experience.map((w: any, idx: number) => ({
                  id: prev.projects[idx]?.id || `proj-${Date.now()}-${idx}`,
                  name: w.company || prev.projects[idx]?.name || "Proyek",
                  role: w.job_title || prev.projects[idx]?.role || prev.competencyArea,
                  technologies: prev.projects[idx]?.technologies || "Teknologi Terkait",
                  year: w.start_date || prev.projects[idx]?.year || "2024",
                  description: Array.isArray(w.description_points)
                    ? w.description_points.join(". ")
                    : prev.projects[idx]?.description || "",
                }))
              : prev.projects,
        }));

        setLastGeneratedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        alertSuccess("✨ CV ATS Berhasil disusun oleh AI!");
      }
    } catch (err: any) {
      console.error("Error generating CV:", err);
      alertError(err.response?.data?.message || "Terjadi kesalahan saat menghubungi layanan AI.");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
    }
  };

  // PDF Generation Helper
  const buildCvResultPayload = (): CVResult => {
    return {
      full_name: formData.fullName,
      email: formData.email,
      phone_number: formData.phone,
      linkedin_url: formData.linkedin,
      photo_profile: formData.photoUrl || undefined,
      summary: formData.competencyDescription,
      skills: formData.skills,
      education: [
        {
          institution: formData.schoolName,
          degree: formData.degreeYear,
          field_of_study: formData.major,
          graduation_year: formData.degreeYear,
        },
      ],
      work_experience: formData.projects.map((p) => ({
        job_title: p.role || formData.competencyArea,
        company: p.name,
        start_date: p.year || "2024",
        end_date: "Sekarang",
        description_points: [p.description],
      })),
    };
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const cvPayload = buildCvResultPayload();
      const response = await API.post(
        "/api/v1/dev/download-cv",
        {
          ...cvPayload,
          template: selectedTemplate,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const filename = `CV_${(formData.fullName || "Prakerin").replace(/\s+/g, "_")}_ATS.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alertSuccess("Berhasil mengunduh dokumen CV ATS!");
    } catch (err: any) {
      console.error("Error downloading CV PDF:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  // Save to Dashboard
  const handleSaveToDashboard = async () => {
    const saveName = window.prompt(
      "Masukkan nama CV untuk disimpan ke Dashboard:",
      `CV ATS - ${formData.fullName || "Siswa"}`
    );
    if (!saveName || !saveName.trim()) return;

    setSavingDashboard(true);
    try {
      const cvPayload = buildCvResultPayload();
      const response = await API.post(
        "/api/v1/dev/download-cv",
        {
          ...cvPayload,
          template: selectedTemplate,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const defaultFilename = `CV_${(formData.fullName || "Prakerin").replace(/\s+/g, "_")}_ATS.pdf`;
      const formDataUpload = new FormData();
      formDataUpload.append("name", saveName.trim());
      formDataUpload.append("file", blob, defaultFilename);

      await API.post("/api/v1/curriculum-vitaes", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      alertSuccess("CV berhasil disimpan ke riwayat Dashboard!");
    } catch (err) {
      console.error("Error saving CV to dashboard:", err);
      alertError("Gagal menyimpan CV ke dashboard.");
    } finally {
      setSavingDashboard(false);
    }
  };

  // Stepper Items Definition
  const steps = [
    { num: 1, label: "Data Diri", icon: User },
    { num: 2, label: "Pendidikan", icon: GraduationCap },
    { num: 3, label: "Kompetensi", icon: Award },
    { num: 4, label: "Proyek", icon: FolderGit2 },
    { num: 5, label: "Pratinjau", icon: Eye },
  ];

  const renderFormStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="text-accent">1.</span> Data Diri & Kontak
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Informasi kontak utama yang akan dicantumkan di bagian header CV Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Contoh: Aditya Pratama"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="aditya.pratama@email.com"
                      className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      No. HP / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alamat / Domisili
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Bandung, Jawa Barat, Indonesia"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Photo Box (Matching Mockup) */}
              <div className="md:col-span-1 flex flex-col items-center">
                <label className="block text-xs font-semibold text-gray-700 mb-1 self-start">
                  Foto Profil (Opsional)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-300 hover:border-accent rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-teal-50/30 group relative overflow-hidden"
                >
                  {formData.photoUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.photoUrl}
                        alt="Foto Profil"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity rounded-lg">
                        Ganti Foto
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-teal-100/60 text-accent flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Camera size={20} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-accent">
                        Pilih foto atau seret ke sini
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">JPG/PNG maks. 2MB</p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 w-full">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 py-1.5 px-2 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Camera size={13} /> Kamera
                  </button>
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: null })}
                      className="py-1.5 px-2 text-[11px] font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  GitHub (URL / Username)
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="github.com/adityapratama"
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  LinkedIn (URL / Username)
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/adityapratama"
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="text-accent">2.</span> Pendidikan & Riwayat Studi
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Riwayat institusi pendidikan formal atau kejuruan terakhir Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Asal Sekolah / Perguruan Tinggi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="SMK Negeri 4 Bandung"
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Program Studi / Jurusan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="Rekayasa Perangkat Lunak"
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tahun Angkatan / Periode Studi
              </label>
              <input
                type="text"
                value={formData.degreeYear}
                onChange={(e) => setFormData({ ...formData, degreeYear: e.target.value })}
                placeholder="2022 - 2025"
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Contoh: "2022 - 2025" atau "2023 - Sekarang (Kelas XII)"
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="text-accent">3.</span> Kompetensi & Ringkasan Profil
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tentukan target bidang keahlian, ringkasan profesional, dan daftar keahlian teknis.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bidang Kompetensi (Target Karir) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.competencyArea}
                onChange={(e) => setFormData({ ...formData, competencyArea: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white cursor-pointer transition-all"
              >
                {COMPETENCY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Deskripsi Ringkas / Profil Kompetensi
              </label>
              <textarea
                value={formData.competencyDescription}
                onChange={(e) => setFormData({ ...formData, competencyDescription: e.target.value })}
                rows={4}
                placeholder="Saya adalah siswa SMK jurusan Rekayasa Perangkat Lunak yang fokus pada Frontend Development. Berpengalaman membangun antarmuka web responsif..."
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all resize-y"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tip: Tuliskan minat utama, teknologi yang dikuasai, dan komitmen profesional Anda.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Daftar Keterampilan & Teknologi (Skills)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(newSkillInput);
                    }
                  }}
                  placeholder="Ketik skill lalu tekan Enter (misal: React.js)"
                  className="flex-1 px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="px-4 py-2 bg-accent hover:bg-teal-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Tambah
                </button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200/60"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-teal-600 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Presets suggestions */}
              <div>
                <p className="text-[11px] text-gray-400 mb-1.5">Saran Keterampilan Cepat:</p>
                <div className="flex flex-wrap gap-1">
                  {PRESET_SKILLS.filter((ps) => !formData.skills.includes(ps))
                    .slice(0, 8)
                    .map((ps) => (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => handleAddSkill(ps)}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-accent hover:text-accent transition-all cursor-pointer"
                      >
                        + {ps}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-accent">4.</span> Jejak Proyek & Portofolio
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cantumkan proyek sekolah, tugas magang, atau aplikasi personal yang pernah Anda buat.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-accent font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-teal-200/60 cursor-pointer"
              >
                <Plus size={14} /> Tambah Proyek
              </button>
            </div>

            <div className="space-y-3.5">
              {formData.projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="p-4 border border-gray-200 rounded-xl bg-gray-50/40 hover:bg-white hover:border-teal-300/80 transition-all space-y-3 relative group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                      Proyek #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Nama Proyek <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => handleUpdateProject(proj.id, "name", e.target.value)}
                        placeholder="Dashboard Monitoring IoT"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Peran
                      </label>
                      <input
                        type="text"
                        value={proj.role}
                        onChange={(e) => handleUpdateProject(proj.id, "role", e.target.value)}
                        placeholder="Frontend Developer"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Teknologi
                      </label>
                      <input
                        type="text"
                        value={proj.technologies}
                        onChange={(e) => handleUpdateProject(proj.id, "technologies", e.target.value)}
                        placeholder="React, Tailwind CSS, REST API"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Deskripsi & Dampak
                    </label>
                    <textarea
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(proj.id, "description", e.target.value)}
                      rows={2}
                      placeholder="Membangun dashboard real-time dan meningkatkan kecepatan pemantauan data."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-accent resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddProject}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-accent rounded-xl text-xs font-semibold text-gray-600 hover:text-accent flex items-center justify-center gap-1.5 transition-all bg-gray-50/50 hover:bg-teal-50/30 cursor-pointer"
            >
              <Plus size={15} /> Tambah Proyek Lainnya
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="text-accent">5.</span> Pratinjau & Pengoptimalan AI
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Kustomisasi gaya bahasa, instruksi khusus, dan buat CV Anda menjadi ramah ATS dengan AI.
              </p>
            </div>

            {/* Tone Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Gaya Bahasa / Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent cursor-pointer"
                >
                  <option value="Professional">Professional (Standar Industri)</option>
                  <option value="Formal">Formal & Ringkas</option>
                  <option value="Casual">Modern & Dinamis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilihan Template Output
                </label>
                <div className="flex gap-2">
                  {["ATS", "Classic"].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedTemplate === tpl
                          ? "bg-accent text-white border-accent shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {tpl === "ATS" ? "ATS Friendly (Direkomendasikan)" : "Classic"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Instruksi Khusus untuk AI (Opsional)
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                placeholder="Contoh: Sorot pengalaman teknologi React dan kemampuan problem solving saya secara lebih menonjol..."
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-y"
              />
            </div>

            {/* AI Callout Banner */}
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 flex items-start gap-2.5 text-teal-900 text-xs">
              <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-teal-950">AI ATS Optimization Engine</p>
                <p className="text-teal-800/90 mt-0.5">
                  AI akan merapikan deskripsi, memilih kata kunci yang ramah ATS scanner HRD, dan menyusun
                  poin pengalaman dengan formula tindakan profesional.
                </p>
              </div>
            </div>

            {lastGeneratedAt && (
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <Check size={13} /> Terakhir diperbarui AI pada pukul {lastGeneratedAt} WIB
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      {/* Top Breadcrumb & Actions */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="text-accent-dark text-xs font-medium">
              <Link className="hover:underline hover:text-accent" href="/dashboard/cv">
                Curriculum Vitae
              </Link>{" "}
              &gt; Generator CV Pintar AI
            </h1>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Buat CV ATS dengan AI
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Lengkapi data berikut, lalu AI akan menyusun CV profesional yang ramah ATS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "stepper" ? "all" : "stepper")}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Layers size={14} className="text-accent" />
              {viewMode === "stepper" ? "Lihat Semua Form" : "Mode Langkah (Wizard)"}
            </button>
            <button
              onClick={handleResetToProfile}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Sinkronkan kembali dengan data profil akun"
            >
              <RefreshCw size={14} className="text-accent" />
              Sinkron Profil
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar (Fixed - Clean Segmented Connectors) */}
        {viewMode === "stepper" && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto px-2 sm:px-4">
              {steps.map((step, idx) => {
                const isActive = activeStep === step.num;
                const isCompleted = activeStep > step.num;
                return (
                  <React.Fragment key={step.num}>
                    {/* Step Circle & Label */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(step.num)}
                      className="flex flex-col items-center group focus:outline-none cursor-pointer shrink-0"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                          isActive
                            ? "bg-accent text-white ring-4 ring-teal-100 scale-110"
                            : isCompleted
                            ? "bg-teal-600 text-white"
                            : "bg-white border-2 border-gray-300 text-gray-500 group-hover:border-accent"
                        }`}
                      >
                        {isCompleted ? <Check size={14} strokeWidth={3} /> : step.num}
                      </div>
                      <span
                        className={`text-[11px] mt-1.5 font-medium transition-colors hidden sm:block text-center ${
                          isActive
                            ? "text-accent font-bold"
                            : isCompleted
                            ? "text-gray-700"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>

                    {/* Connecting Line Segment between Step Circles */}
                    {idx < steps.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1.5 sm:mx-3 bg-gray-200 self-center sm:-mt-5 relative overflow-hidden rounded-full">
                        <div
                          className="h-full bg-accent transition-all duration-500"
                          style={{ width: activeStep > step.num ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Dual-Column Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Form Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            {viewMode === "stepper" ? (
              <>
                {renderFormStep(activeStep)}

                {/* AI Progress Bar overlay if generating */}
                {isGenerating && (
                  <div className="mt-5 p-4 border border-teal-200 bg-teal-50/70 rounded-xl space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center text-xs font-semibold text-teal-800">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                        {stages[stageIndex]}
                      </span>
                      <span className="font-bold text-teal-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-teal-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stepper Action Buttons Footer */}
                <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Save size={14} className="text-gray-500" />
                    Simpan Draft
                  </button>

                  <div className="flex items-center gap-2">
                    {activeStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveStep((prev) => prev - 1)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={14} /> Kembali
                      </button>
                    )}

                    {activeStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => setActiveStep((prev) => prev + 1)}
                        className="px-5 py-2.5 rounded-xl bg-accent text-white hover:bg-teal-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        Lanjut <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="px-5 py-2.5 rounded-xl bg-accent text-white hover:bg-teal-700 text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                      >
                        <Sparkles size={15} className="text-amber-300 animate-pulse" />
                        {isGenerating ? "Memproses AI..." : "Buat CV dengan AI"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* All-in-One Mode (Shows all sections continuously) */
              <div className="space-y-8">
                {renderFormStep(1)}
                {renderFormStep(2)}
                {renderFormStep(3)}
                {renderFormStep(4)}
                {renderFormStep(5)}

                {/* AI Progress Bar */}
                {isGenerating && (
                  <div className="p-4 border border-teal-200 bg-teal-50/70 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-teal-800">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                        {stages[stageIndex]}
                      </span>
                      <span className="font-bold text-teal-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-teal-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Save size={14} className="text-gray-500" /> Simpan Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="px-6 py-2.5 rounded-xl bg-accent text-white hover:bg-teal-700 text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <Sparkles size={15} className="text-amber-300 animate-pulse" />
                    {isGenerating ? "Memproses AI..." : "Buat CV dengan AI"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Real-Time ATS CV Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Header: Title & Badges */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                Pratinjau CV ATS
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    completeness >= 70
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <ShieldCheck size={13} />
                  {completeness >= 70 ? "ATS Ready" : "Data Parsial"}
                </span>
                <span className="text-[11px] font-bold text-accent bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  Kelengkapan {completeness}%
                </span>
              </div>
            </div>

            {/* ATS Paper Canvas Container */}
            <div className="border border-gray-200 rounded-xl bg-white shadow-inner p-6 font-sans text-gray-800 text-[11px] leading-relaxed max-h-[580px] overflow-y-auto print:border-none print:p-0">
              {/* ATS Header */}
              <div className="text-center pb-3 border-b-2 border-teal-800 mb-3">
                <h1 className="text-xl font-extrabold tracking-wider uppercase text-gray-900">
                  {formData.fullName || "NAMA LENGKAP ANDA"}
                </h1>
                <p className="text-xs font-semibold text-teal-700 mt-0.5">
                  {formData.competencyArea || "Frontend Developer"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-2 text-[10px] text-gray-600 mt-1.5">
                  {formData.email && <span>✉ {formData.email}</span>}
                  {formData.phone && <span>| 📞 {formData.phone}</span>}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-2 text-[10px] text-gray-500 mt-0.5">
                  {formData.github && <span>🐙 {formData.github}</span>}
                  {formData.linkedin && <span>| 💼 {formData.linkedin}</span>}
                  {formData.address && <span>| 📍 {formData.address}</span>}
                </div>
              </div>

              {/* SECTION: PROFIL */}
              {formData.competencyDescription && (
                <div className="mb-3.5">
                  <h2 className="text-[11px] font-bold uppercase text-teal-900 border-b border-gray-300 pb-0.5 mb-1 tracking-wider">
                    Profil
                  </h2>
                  <p className="text-justify text-gray-700 leading-normal text-[10.5px]">
                    {formData.competencyDescription}
                  </p>
                </div>
              )}

              {/* SECTION: PENDIDIKAN */}
              {(formData.schoolName || formData.major) && (
                <div className="mb-3.5">
                  <h2 className="text-[11px] font-bold uppercase text-teal-900 border-b border-gray-300 pb-0.5 mb-1 tracking-wider">
                    Pendidikan
                  </h2>
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-gray-900 text-[11px]">
                      {formData.schoolName || "SMK Negeri 4 Bandung"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {formData.degreeYear || "2022 - 2025"}
                    </p>
                  </div>
                  <p className="text-gray-700 text-[10.5px]">
                    {formData.major || "Rekayasa Perangkat Lunak"}
                  </p>
                </div>
              )}

              {/* SECTION: KOMPETENSI */}
              {formData.skills.length > 0 && (
                <div className="mb-3.5">
                  <h2 className="text-[11px] font-bold uppercase text-teal-900 border-b border-gray-300 pb-0.5 mb-1 tracking-wider">
                    Kompetensi
                  </h2>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-700 list-disc list-inside">
                    {formData.skills.map((skill, idx) => (
                      <li key={idx} className="truncate">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SECTION: PROYEK */}
              {formData.projects.length > 0 && formData.projects[0].name && (
                <div className="mb-2">
                  <h2 className="text-[11px] font-bold uppercase text-teal-900 border-b border-gray-300 pb-0.5 mb-1 tracking-wider">
                    Proyek
                  </h2>
                  <div className="space-y-2.5">
                    {formData.projects
                      .filter((p) => p.name.trim())
                      .map((proj) => (
                        <div key={proj.id}>
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-gray-900 text-[11px]">
                              {proj.name}
                            </span>
                            <span className="text-[10px] text-gray-500 italic">
                              {proj.role} {proj.year ? `| ${proj.year}` : ""}
                            </span>
                          </div>
                          {proj.technologies && (
                            <p className="text-[10px] text-teal-700 font-medium italic">
                              {proj.technologies}
                            </p>
                          )}
                          {proj.description && (
                            <p className="text-[10.5px] text-gray-700 mt-0.5">
                              • {proj.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Download & Save Card (Responsive & Contained) */}
            <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/70 space-y-3 overflow-hidden">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 font-bold text-[10px] flex items-center justify-center shrink-0 border border-red-200">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    CV_{(formData.fullName || "Prakerin").replace(/\s+/g, "_")}_ATS.pdf
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {completeness >= 70
                      ? "Siap diunduh & diajukan ke industri"
                      : "Siap dibuat setelah data lengkap"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                <button
                  type="button"
                  onClick={handleSaveToDashboard}
                  disabled={savingDashboard}
                  className="flex-1 py-2 px-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm disabled:opacity-60 cursor-pointer truncate"
                  title="Simpan CV ke Riwayat Dashboard"
                >
                  <Save size={13} />
                  <span>{savingDashboard ? "Menyimpan..." : "Simpan"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="flex-1 py-2 px-3 rounded-lg bg-accent hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-60 cursor-pointer truncate"
                >
                  <Download size={13} />
                  <span>{downloading ? "Mengunduh..." : "Unduh PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center gap-4 w-full max-w-md animate-fade-in">
            <div className="w-full flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Camera size={18} className="text-accent" /> Ambil Pas Foto Profil
              </h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black/10 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute w-full h-full object-cover scale-x-[-1]"
              />
              {/* HUD / Crop Guide (3:4 Ratio) */}
              <div className="relative z-10 w-[160px] h-[213px] border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex items-center justify-center pointer-events-none rounded-sm">
                <div className="text-white/90 text-[10px] font-bold uppercase tracking-wider absolute bottom-2">
                  Paskan Wajah di Sini
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full mt-1">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-2 px-4 rounded-xl bg-accent text-white text-xs font-bold hover:bg-teal-700 flex justify-center items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Camera size={15} /> Ambil Foto
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* Feature Activity Logs at Bottom */}
      <div className="max-w-7xl mx-auto mt-10">
        <FeatureActivityLog resourceType="CVGenerator" title="Riwayat Pembuatan CV" />
      </div>
    </main>
  );
}