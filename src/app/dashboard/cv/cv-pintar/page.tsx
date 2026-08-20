"use client";
import UnderConstruction from "@/components/UnderConstruction";
import { FileText, Sparkles, Download, Save, Copy, RefreshCw, Check, FileCheck, Camera, Image as ImageIcon, Clock } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { LockedFeature } from "@/components/LockedFeature";
import CVAts from "@/components/cv-templates/CVAts";
import CVProfessional from "@/components/cv-templates/CVProfessional";
import CVModern from "@/components/cv-templates/CVModern";
import { API, ENDPOINTS } from "@/utils/config";
import { CVResult } from "@/models/CV";
import Cookies from "js-cookie";
import { alertSuccess, alertError } from "@/libs/alert";

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error';
  details?: string;
}

interface PromptFieldProps {
  onResult?: (s: string) => void;
  selectedTemplate?: string;
}

const PromptField: React.FC<PromptFieldProps> = ({ onResult }) => {
  const presets = [
    "Sorot pengalaman kepemimpinan dan pencapaian kuantitatif.",
    "Tekankan keterampilan teknis: JavaScript, React, TypeScript.",
    "Ringkas pengalaman jadi 3-4 poin yang padat dan to the point.",
  ];
  const templates = [
    { key: "ATS", label: "ATS Friendly" },
    { key: "Classic", label: "Classic / Formal" },
    { key: "Modern", label: "Modern Graphic", hidden: true },
  ];
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ATS");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Custom photo states
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Camera capture states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // History log states
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('ai_cv_logs');
    if (savedLogs) {
      try { setLogs(JSON.parse(savedLogs)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_cv_logs', JSON.stringify(logs));
  }, [logs]);

  // Progress Bar states
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const stages = [
    "Mengumpulkan profil siswa...",
    "Mengirim instruksi ke Gemini AI...",
    "Menganalisis pencapaian & pengalaman...",
    "Menyusun ringkasan & poin responsibilitas...",
    "Menyelaraskan gaya bahasa & format CV...",
    "Hampir selesai...",
  ];

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cv, setCv] = useState<CVResult>();

  // Timer reference for progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(5);
      setStageIndex(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const next = prev + Math.floor(Math.random() * 8) + 4;
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
  }, [loading]);

  const handlePreset = (text: string) => {
    setPrompt((p) => (p ? p + " \n" + text : text));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
      // Let the modal mount first before assigning srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Gagal mengakses kamera. Pastikan Anda telah memberikan izin pada browser Anda.");
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCustomPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const addLog = (action: string, status: 'success' | 'error', details?: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('id-ID'),
      action,
      status,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleClear = () => {
    setPrompt("");
    setResult(null);
    setCv(undefined);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Masukkan prompt atau pilih contoh terlebih dahulu.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      let profileUserPayload: any = {
        personal_details: {
          full_name: "Siswa Prakerin",
          email: "",
          phone_number: "",
          address: "",
          linkedin_url: "",
        },
        work_experience: [],
        education: [],
        skills: { technical: [], languages: [] },
      };

      let userPfpUrl: string | undefined = undefined;

      try {
        const profileRes = await API.get(`${ENDPOINTS.USERS}/profile`, {
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        });
        if (profileRes.status === 200 && profileRes.data?.data) {
          const uData = profileRes.data.data;
          const sData = uData.student || {};

          if (uData.photo_profile) {
            const cleanPhoto = uData.photo_profile.startsWith("/") ? uData.photo_profile.slice(1) : uData.photo_profile;
            userPfpUrl = cleanPhoto.startsWith("http")
              ? cleanPhoto
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/storage/photo-profile/${cleanPhoto}`;
          }

          profileUserPayload = {
            personal_details: {
              full_name: sData.name || uData.username || "Siswa Prakerin",
              email: uData.email || "",
              phone_number: sData.phone_number || "",
              address: sData.address || "",
              linkedin_url: sData.portofolio_link || sData.social_media_link || "",
            },
            work_experience: [],
            education: sData.school_name ? [
              {
                institution: sData.school_name,
                degree: sData.class ? `Kelas ${sData.class}` : "Peserta Magang",
                field_of_study: sData.major?.name || "Umum",
                graduation_year: "Aktif",
              },
            ] : [],
            skills: {
              technical: sData.skill ? sData.skill.split(",").map((s: string) => s.trim()) : ["Komunikasi", "Kerja Tim"],
              languages: ["Bahasa Indonesia"],
            },
          };
        }
      } catch (e) {
        console.error("Could not fetch user profile for CV generator:", e);
      }

      const response = await API.post(
        `${ENDPOINTS.CURRICULUM_VITAE}/generate-cv`,
        {
          profile_user: profileUserPayload,
          prompt_user: `${prompt}\n(Gaya Bahasa / Tone: ${tone})`,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setProgress(100);
        const resultWithPhoto = {
          ...response.data,
          photo_profile: customPhoto || userPfpUrl,
        };
        setCv(resultWithPhoto);
        setResult(JSON.stringify(resultWithPhoto));
        if (onResult) {
          onResult(JSON.stringify(resultWithPhoto, null, 2));
        }
        addLog("Buat CV AI", "success", `Berhasil membuat CV (${selectedTemplate})`);
      }
    } catch (err: any) {
      console.error("Error generating CV:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat menghubungi layanan AI.");
      addLog("Buat CV AI", "error", err.response?.data?.message || "Gagal membuat CV");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 400);
    }
  };

  const generatePdfBlob = async (): Promise<{ blob: Blob; defaultFilename: string }> => {
    if (!cv) throw new Error("Data CV tidak tersedia");
    const response = await API.post(
      "/api/v1/dev/download-cv",
      {
        ...cv,
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
    const defaultFilename = `CV_${(cv.full_name || "Prakerin").replace(/\s+/g, "_")}_${selectedTemplate}.pdf`;
    return { blob, defaultFilename };
  };

  const handleDownloadPdf = async () => {
    if (!cv) return;
    setDownloading(true);
    setError(null);
    try {
      const { blob, defaultFilename } = await generatePdfBlob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", defaultFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      await alertSuccess("Berhasil mengunduh PDF CV!");
      addLog("Unduh CV", "success", `File: ${defaultFilename}`);
    } catch (err: any) {
      console.error("Error downloading CV PDF:", err);
      setError("Terjadi kesalahan saat mengunduh file PDF.");
      await alertError("Gagal mengunduh file PDF CV.");
      addLog("Unduh CV", "error", "Gagal mengunduh PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveToDashboard = async () => {
    if (!cv) return;
    const saveName = window.prompt(
      "Masukkan nama CV untuk disimpan di Dashboard:",
      `CV ${selectedTemplate} - ${cv.full_name || "Siswa"}`
    );

    if (!saveName || !saveName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const { blob, defaultFilename } = await generatePdfBlob();
      const formData = new FormData();
      formData.append("name", saveName.trim());
      formData.append("file", blob, defaultFilename);

      await API.post("/api/v1/curriculum-vitaes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await alertSuccess("CV berhasil disimpan ke Dashboard!");
      addLog("Simpan CV", "success", `Disimpan sebagai: ${saveName.trim()}`);
    } catch (err: any) {
      console.error("Error saving CV to dashboard:", err);
      setError("Terjadi kesalahan saat menyimpan CV ke dashboard.");
      await alertError("Gagal menyimpan CV ke dashboard.");
      addLog("Simpan CV", "error", "Gagal menyimpan ke dashboard");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const renderView = () => {
    if (!cv) return null;

    switch (selectedTemplate) {
      case "ATS":
        return <CVAts data={cv} />;
      case "Classic":
        return <CVProfessional data={cv} />;
      case "Modern":
        return <CVModern data={cv} />;
      default:
        return <CVAts data={cv} />;
    }
  };

  return (
    <div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prompt / Instruksi Khusus untuk AI
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Contoh: Saya memiliki pengalaman magang sebagai frontend developer, tolong sorot proyek React & Tailwind yang pernah saya buat..."
          rows={5}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-y text-sm"
          disabled={loading}
        />
        {error && <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto Profil (Opsional)
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          {customPhoto && (
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200">
              <img src={customPhoto} alt="Profil" className="w-full h-full object-cover" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon size={14} /> Pilih dari Galeri
          </button>
          <button
            onClick={startCamera}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Camera size={14} /> Buka Kamera
          </button>
          {customPhoto && (
            <button
              onClick={() => setCustomPhoto(null)}
              className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              Hapus Foto
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

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center gap-4 w-full max-w-md animate-fade-in">
            <div className="w-full flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Camera size={18} className="text-accent" /> Ambil Foto Profil
              </h3>
              <button onClick={stopCamera} className="text-gray-400 hover:text-red-500">
                Tutup
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black/10 rounded-xl overflow-hidden border border-gray-200">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
            </div>
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={stopCamera}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-white font-medium hover:bg-teal-700 flex justify-center items-center gap-2 transition-all shadow-sm"
              >
                <Camera size={16} /> Jepret
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePreset(p)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {p.replace(/\s+/g, " ").slice(0, 32) + (p.length > 32 ? "..." : "")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tone:</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white cursor-pointer focus:ring-2 focus:ring-accent focus:border-accent shadow-sm"
            disabled={loading}
          >
            <option value="Professional">Professional</option>
            <option value="Formal">Formal</option>
            <option value="Casual">Casual</option>
          </select>
        </div>
      </div>

      {/* Progress Bar Display while generating */}
      {loading && (
        <div className="mb-6 p-4 border border-accent/20 bg-emerald-50/50 rounded-xl space-y-3 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center text-xs font-semibold text-accent">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
              {stages[stageIndex]}
            </span>
            <span className="font-bold text-accent-dark">{progress}%</span>
          </div>

          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 italic">
            Estimasi waktu pembuatan: 5 - 10 detik. Mohon tunggu sejenak...
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 justify-end mb-6">
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
          disabled={loading || downloading || saving}
        >
          Reset / Clear
        </button>

        <button
          onClick={handleGenerate}
          className="px-5 py-2 rounded-lg text-sm bg-accent text-white hover:bg-teal-700 font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
          disabled={loading || downloading || saving}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          {loading ? "Generasi Berjalan..." : result ? "Generate Ulang" : "Buat CV AI"}
        </button>
      </div>

      {/* Template Selection Tabs */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 text-sm">Pilih Template CV</h4>
          {cv && (
            <span className="text-xs text-emerald-600 bg-emerald-50 font-medium px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <FileCheck size={13} /> Output Siap Siap Diunduh ({selectedTemplate})
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {templates
            .filter((t) => !t.hidden)
            .map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedTemplate(t.key)}
                className={`text-sm px-4 py-2 rounded-lg border font-medium transition-all ${
                  selectedTemplate === t.key
                    ? "border-accent bg-accent/10 text-accent font-semibold shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
        </div>
      </div>

      {/* Generated Result & Actions */}
      {result && cv && (
        <div className="mt-6 border border-gray-200 bg-gray-50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h4 className="font-bold text-accent text-base flex items-center gap-2">
                <Check size={18} className="text-emerald-500" /> Hasil CV Berhasil Dibuat
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih format template di atas atau langsung unduh/simpan CV Anda sebagai dokumen PDF.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 flex items-center gap-1.5 transition-colors"
                title="Salin Data JSON"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Tersalin!" : "Salin JSON"}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="text-xs px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
              >
                <Download size={14} />
                <span>{downloading ? "Mengunduh PDF..." : `Unduh PDF (${selectedTemplate})`}</span>
              </button>

              <button
                onClick={handleSaveToDashboard}
                disabled={saving}
                className="text-xs px-4 py-2 rounded-lg bg-accent hover:bg-teal-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
              >
                <Save size={14} />
                <span>{saving ? "Menyimpan..." : "Simpan ke Dashboard"}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-inner max-h-[800px] overflow-y-auto">
            {renderView()}
          </div>
        </div>
      )}

      {/* Activity Logs */}
      <div className="mt-8 border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Clock size={16} className="text-gray-500" /> Riwayat Aktivitas
          </h4>
          {logs.length > 0 && (
            <button onClick={() => setLogs([])} className="text-xs text-red-500 hover:underline">
              Bersihkan
            </button>
          )}
        </div>
        <div className="p-0">
          {logs.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-500">
              Belum ada aktivitas tercatat.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {logs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <p className="text-sm font-medium text-gray-800">{log.action}</p>
                    </div>
                    <span className="text-xs text-gray-400">{log.timestamp}</span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-gray-500 mt-1 ml-4">{log.details}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const BuatPintarPageInner = () => {
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/cv"}
        >
          Curiculum Vitae
        </Link>{" "}
        -&gt; AI Smart CV Generator
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
          <h2 className="text-2xl">AI Smart CV Generator</h2>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-accent mb-3">
          AI Smart CV Generator
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Masukkan instruksi atau ringkasan pengalaman yang ingin diolah
          menjadi bagian CV. Gunakan contoh cepat di bawah untuk memulai.
        </p>

        <PromptField />
      </div>
    </main>
  );
};

export default function BuatPintarPage() {
  return <BuatPintarPageInner />;
}