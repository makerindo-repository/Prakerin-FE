"use client";
import UnderConstruction from "@/components/UnderConstruction";
import { FileText, Sparkles, Download, Save, Copy, RefreshCw, Check, FileCheck } from "lucide-react";
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
    { key: "Modern", label: "Modern Graphic" },
  ];
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ATS");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

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
            userPfpUrl = uData.photo_profile.startsWith("http")
              ? uData.photo_profile
              : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.prakerin.id'}/storage/photo-profile/${uData.photo_profile}`;
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
          photo_profile: userPfpUrl,
        };
        setCv(resultWithPhoto);
        setResult(JSON.stringify(resultWithPhoto));
        if (onResult) {
          onResult(JSON.stringify(resultWithPhoto, null, 2));
        }
      }
    } catch (err: any) {
      console.error("Error generating CV:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat menghubungi layanan AI.");
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
    } catch (err: any) {
      console.error("Error downloading CV PDF:", err);
      setError("Terjadi kesalahan saat mengunduh file PDF.");
      await alertError("Gagal mengunduh file PDF CV.");
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
    } catch (err: any) {
      console.error("Error saving CV to dashboard:", err);
      setError("Terjadi kesalahan saat menyimpan CV ke dashboard.");
      await alertError("Gagal menyimpan CV ke dashboard.");
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
          {templates.map((t) => (
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