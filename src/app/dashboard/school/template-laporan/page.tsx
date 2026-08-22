"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { API } from "@/utils/config";
import { alertError, alertSuccess } from "@/libs/alert";
import { FileText, Save, Sparkles, RefreshCw, BookOpen, CheckCircle2 } from "lucide-react";

const TEMPLATE_PRESETS = [
  {
    name: "Standard SMK (Laporan Praktik Kerja Lapangan)",
    content: `FORMAT LAPORAN PKL / PRAKERIN SMK:
1. PENDAHULUAN: LATAR BELAKANG DAN TUJUAN MAGANG
2. GAMBARAN UMUM PERUSAHAAN MITRA
3. BIDANG PEKERJAAN & DETAIL TUGAS UTAMA YANG DISELESAIKAN
4. EVALUASI CAPAIAN HARIAN & KETERAMPILAN TEKNIS YANG DIPEROLEH
5. KENDALA YANG DIHADAPI DAN SOLUSI PENYELESAIAN
6. KESIMPULAN DAN SARAN UNTUK PENGEMBANGAN DIRI`,
  },
  {
    name: "Standard Perguruan Tinggi / Magang Akademik",
    content: `FORMAT LAPORAN MAGANG / PKL MAHASISWA:
1. EXECUTIVE SUMMARY & IDENTITAS PESERTA
2. CHRONOLOGY OF ACTIVITIES & CORE RESPONSIBILITIES
3. COMPETENCY ACQUISITION & TECHNICAL PROFICIENCY (HARD SKILLS & SOFT SKILLS)
4. PROJECT DELIVERABLES & IMPACT ANALYSIS
5. CHALLENGES & PROBLEM SOLVING APPROACH
6. LESSONS LEARNED AND STRATEGIC RECOMMENDATIONS`,
  },
  {
    name: "Pendekatan berbasis Project & Portofolio",
    content: `FORMAT LAPORAN PROYEK & HASIL KARYA MAGANG:
1. RINGKASAN PROYEK UTAMA YANG DIKERJAKAN
2. TECH STACK, TOOLS, DAN METODOLOGI YANG DIGUNAKAN
3. DETAIL HASIL PEKERJAAN (OUTPUT, KONTRIBUSI, DAN PENCAPAIAN)
4. TANTANGAN EKSEKUSI & REFLEKSI PEMBELAJARAN
5. REKOMENDASI PENGEMBANGAN SKILL KE DEPAN`,
  },
];

export default function TemplateLaporanPage() {
  const [templateText, setTemplateText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchTemplate = async () => {
    setFetching(true);
    try {
      const response = await API.get("/api/v1/school/report-template", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200 && response.data?.data) {
        setTemplateText(response.data.data.report_template || "");
      }
    } catch (error: any) {
      console.error("Error fetching report template:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await API.post(
        "/api/v1/school/report-template",
        { report_template: templateText },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      if (response.status === 200) {
        await alertSuccess("Template laporan sekolah berhasil disimpan!");
      }
    } catch (error: any) {
      console.error("Error saving report template:", error);
      await alertError(
        error.response?.data?.message || "Gagal menyimpan template laporan."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (content: string) => {
    setTemplateText(content);
  };

  const isUniversity = (Cookies.get("school_type") as string) === "university";
  const labelType = isUniversity ? "Mahasiswa" : "Siswa";
  const institutionLabel = isUniversity ? "Perguruan Tinggi" : "Sekolah";

  return (
    <main className="p-4 sm:p-6 max-w-5xl mx-auto min-h-screen">
      {/* Breadcrumb */}
      <h1 className="text-accent-dark text-xs sm:text-sm mb-3 sm:mb-5">
        <Link className="hover:underline hover:text-accent" href={"/dashboard"}>
          Dashboard
        </Link>{" "}
        -&gt; Template Laporan {institutionLabel}
      </h1>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-accent/10 via-primary-100 to-accent/5 border border-accent/20 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center space-x-3 text-accent font-extrabold mb-2">
          <FileText className="w-6 h-6 text-accent shrink-0" />
          <h2 className="text-xl sm:text-2xl">Template & Format Laporan Magang</h2>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
          Atur panduan, struktur, atau poin khusus laporan magang untuk {labelType.toLowerCase()} dari instansi Anda. 
          Ketika {labelType.toLowerCase()} membuat <strong className="text-accent">AI Report</strong>, generator AI akan otomatis menyesuaikan struktur laporan berdasarkan format yang Anda tentukan di sini.
        </p>
      </div>

      {/* Preset Selection & Form Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Format / Panduan Laporan {institutionLabel}
              </label>
              {fetching && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Memuat data...
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Tuliskan instruksi bab, poin-poin evaluasi, atau format standar yang Anda wajibkan bagi {labelType.toLowerCase()}.
            </p>

            <textarea
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              placeholder="Contoh: 
1. BAB I: PENDAHULUAN (Latar belakang & tujuan)
2. BAB II: PROFIL PERUSAHAAN MITRA
3. BAB III: PELAKSANAAN MAGANG & RINCIAN TUGAS
4. BAB IV: HAMBATAN DAN SOLUSI
5. BAB V: PENUTUP (Kesimpulan & Saran)"
              rows={14}
              className="w-full p-4 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent resize-y font-mono leading-relaxed bg-gray-50/50"
              disabled={fetching || loading}
            />
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => setTemplateText("")}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              disabled={fetching || loading}
            >
              Bersihkan Text
            </button>
            <button
              onClick={handleSave}
              disabled={fetching || loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        </div>

        {/* Sidebar Presets & Tips */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" /> Contoh Format Cepat
            </h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Klik salah satu contoh di bawah untuk mengaplikasikan format ke editor:
            </p>
            <div className="space-y-2">
              {TEMPLATE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset.content)}
                  className="w-full text-left p-3 text-xs rounded-lg border border-gray-100 bg-gray-50 hover:bg-accent/10 hover:border-accent/30 transition-all group"
                >
                  <span className="font-medium text-gray-800 group-hover:text-accent block mb-1">
                    {preset.name}
                  </span>
                  <span className="text-gray-400 block truncate">
                    {preset.content.split("\n")[1] || preset.content}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-blue-800 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              Bagaimana AI Bekerja?
            </div>
            Jika kolom template ini terisi, AI akan menyusun Laporan Magang Otomatis milik siswa Anda dengan mengikuti poin-poin panduan sekolah ini. Jika dibiarkan kosong, AI akan memakai format laporan standar bawaan sistem.
          </div>
        </div>
      </div>
    </main>
  );
}
