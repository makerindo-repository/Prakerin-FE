"use client";
import UnderConstruction from "@/components/UnderConstruction";
import { FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import CVAts from "@/components/cv-templates/CVAts";
import CVProfessional from "@/components/cv-templates/CVProfessional";
import CVModern from "@/components/cv-templates/CVModern";
import { CVData } from "@/types/cv";
import { API, ENDPOINTS } from "@/utils/config";
import { CVResult } from "@/models/CV";
import Cookies from "js-cookie";

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
  const templates = ["ATS", "Classic", "Modern"];
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ATS");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cv, setCv] = useState<CVResult>();
  const cvRef = useRef<HTMLDivElement>(null);

  const handlePreset = (text: string) => {
    setPrompt((p) => (p ? p + " \n" + text : text));
  };

  const handleClear = () => {
    setPrompt("");
    setResult(null);
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

      try {
        const profileRes = await API.get(`${ENDPOINTS.USERS}/profile`, {
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        });
        if (profileRes.status === 200 && profileRes.data?.data) {
          const uData = profileRes.data.data;
          const sData = uData.student || {};
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
          prompt_user: prompt,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data);
        setCv(response.data);
        setResult(JSON.stringify(response.data));
        if (onResult) {
          onResult(JSON.stringify(response.data, null, 2));
        }
      }
    } catch (err: any) {
      console.error("Error generating CV:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat menghubungi layanan AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cv) return;
    setLoading(true);
    setError(null);
    try {
      const response = await API.post(
        "/api/v1/dev/download-cv",
        cv,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        const defaultFilename = `cv_${cv.full_name.replace(/\s+/g, "_")}.pdf`;
        link.setAttribute("download", defaultFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        const saveName = window.prompt(
          "Masukkan nama untuk menyimpan CV ini ke Dashboard/Daftar CV (kosongkan/batal jika tidak ingin menyimpan):",
          `CV Pintar - ${cv.full_name}`
        );

        if (saveName) {
          const formData = new FormData();
          formData.append("name", saveName);
          formData.append("file", blob, defaultFilename);

          await API.post("/api/v1/curriculum-vitaes", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          });
          alert("CV berhasil disimpan ke dashboard!");
        }
      }
    } catch (err: any) {
      console.error("Error downloading/saving CV:", err);
      setError("Terjadi kesalahan saat mengunduh/menyimpan CV.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      // small visual feedback could be added later
    } catch (e) {
      // ignore
    }
  };


  const renderView = () => {
    if (!cv) {
      return;
    }

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
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Contoh: Saya memiliki pengalaman magang sebagai frontend developer..."
          rows={6}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-y"
          disabled={loading}
        />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePreset(p)}
              className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
            >
              {p.replace(/\s+/g, " ").slice(0, 30) +
                (p.length > 30 ? "..." : "")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Tone:</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="p-2 border border-gray-200 rounded-md text-sm"
            disabled={loading}
          >
            <option>Professional</option>
            <option>Formal</option>
            <option>Casual</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end mb-4">
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-md border border-gray-200 text-sm bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Clear
        </button>

        {!result ? (
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-md text-sm bg-accent text-white hover:opacity-90 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-md text-sm bg-accent text-white hover:opacity-90 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Downloading..." : "Download/Simpan"}
          </button>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Pilih Template</h4>
        <div className="flex gap-2">
          {templates.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTemplate(t)}
              className={`text-sm text-left px-3 py-2 rounded-md border ${
                selectedTemplate === t
                  ? "border-accent bg-accent/10"
                  : "border-gray-200 bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-4 border border-gray-100 bg-gray-50 rounded-md p-4">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-accent">Hasil</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="text-sm px-3 py-1 rounded-md border border-gray-200 bg-white"
              >
                Copy
              </button>
            </div>
          </div>
          {renderView()}
        </div>
      )}
    </div>
  );
};

const BuatPintarPage = () => {
  // return <UnderConstruction />;
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

export default BuatPintarPage;
