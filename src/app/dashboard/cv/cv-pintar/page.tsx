"use client";
import UnderConstruction from "@/components/UnderConstruction";
import { FileText } from "lucide-react";
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
  const templates = ["Classic", "Modern", "Minimal"];
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0]
  );
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
      const response = await API.post(
        `${ENDPOINTS.CURRICULUM_VITAE}/generate-cv`,
        {
          profile_user: {
            personal_details: {
              full_name: "Budi Santoso",
              email: "budi.santoso.dev@email.com",
              phone_number: "+62 812 3456 7890",
              address: "Jakarta, Indonesia",
              linkedin_url: "https://linkedin.com/in/budisantoso-dev",
            },
            work_experience: [
              {
                job_title: "Senior Frontend Developer",
                company: "PT Teknologi Maju Bersama",
                start_date: "Januari 2022",
                end_date: "Sekarang",
                responsibilities: [
                  "Mengembangkan dan memelihara user interface untuk aplikasi web utama menggunakan React dan Next.js.",
                  "Berkolaborasi dengan desainer UI/UX dan tim backend untuk integrasi API.",
                  "Melakukan code review dan mentoring untuk developer junior.",
                  "Meningkatkan performa website hingga 20%.",
                ],
              },
              {
                job_title: "Frontend Developer",
                company: "Startup Cepat Koding",
                start_date: "Juni 2019",
                end_date: "Desember 2021",
                responsibilities: [
                  "Membangun komponen UI yang reusable.",
                  "Mengubah desain dari Figma menjadi kode HTML, CSS, dan JavaScript.",
                  "Mengintegrasikan layanan REST API ke aplikasi frontend.",
                ],
              },
            ],
            education: [
              {
                institution: "Universitas Gadjah Mada",
                degree: "Sarjana Komputer",
                field_of_study: "Ilmu Komputer",
                graduation_year: "2019",
              },
            ],
            skills: {
              technical: [
                "JavaScript",
                "TypeScript",
                "React.js",
                "Next.js",
                "Node.js",
                "Tailwind CSS",
                "Git",
                "REST API",
              ],
              languages: [
                "Bahasa Indonesia (Native)",
                "English (Professional)",
              ],
            },
          },
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
      }
    } catch (err: any) {
      console.log("Fetch Failed: " + err);
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
      case "Classic": // Anda bisa ganti ini menjadi "Professional"
        return <CVProfessional data={cv} />;
      case "Modern":
        return <CVModern data={cv} />;
      case "Minimal": // Anda bisa ganti ini menjadi "ATS"
        return <CVAts data={cv} />;
      default:
        return <CVProfessional data={cv} />;
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
            // onClick={handleDownload}
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
  const templates = ["Classic", "Modern", "Minimal"];
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0]
  );
  const [previewText, setPreviewText] = useState<string | null>(null);
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    if (!previewRef.current) return;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;
    printWindow.document.write(
      `<!doctype html><html><head><title>CV Preview</title>`
    );
    printWindow.document.write(
      `<style>body{font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;} .container{padding:20px;}</style>`
    );
    printWindow.document.write(
      `</head><body><div class='container'>${previewRef.current.innerHTML}</div></body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // return <UnderConstruction />;
  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/cv"}
        >
          Curiculum Vitae
        </Link>{" "}
        -&gt; CV Pintar
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl">cv-pintar</h2>
        </div>
      </div>
      {/* Two-column layout: left = prompt, right = templates + preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-accent mb-3">
            Buat CV Pintar
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Masukkan instruksi atau ringkasan pengalaman yang ingin diolah
            menjadi bagian CV. Gunakan contoh cepat di bawah untuk memulai.
          </p>

          <PromptField
            onResult={(s) => setPreviewText(s)}
            selectedTemplate={selectedTemplate}
          />
        </div>

        <aside className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Pilih Template</h4>
            <div className="flex flex-col gap-2">
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

          <div className="mt-2 flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">Preview CV</h4>
            <div
              ref={previewRef}
              className="border border-gray-100 rounded-md p-3 bg-white min-h-[220px]"
            >
              {previewText ? (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    Template:{" "}
                    <span className="font-medium">{selectedTemplate}</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {previewText}
                  </pre>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Belum ada preview. Tekan Generate untuk membuat preview CV.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewText(null)}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 bg-white"
            >
              Reset
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-sm rounded-md bg-accent text-white"
            >
              Print / Download
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default BuatPintarPage;
