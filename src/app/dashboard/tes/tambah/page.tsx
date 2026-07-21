"use client";

import dynamic from "next/dynamic";
import { HelpCircle, Sparkles, Brain, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import { suppressErrorForSuperAdmin } from "@/libs/errorHandler";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  type: type;
  link: string;
  description: string;
}

interface Error {
  title?: string;
  type?: string;
  link?: string;
  description?: string;
}

type type = "theory" | "practice" | "other" | "";

const tambahLowonganPage: React.FC = () => {
  const route = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    link: "",
    description: "",
  });

  const [errors, setErrors] = useState<Error>({});

  // AI Modal States
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiJobTitle, setAiJobTitle] = useState<string>("");
  const [aiSkills, setAiSkills] = useState<string>("");
  const [aiType, setAiType] = useState<type>("practice");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleAiGenerate = async () => {
    if (!aiJobTitle.trim()) {
      await alertError("Posisi / Judul Pekerjaan harus diisi!");
      return;
    }
    setAiLoading(true);

    try {
      const response = await API.post(
        `${ENDPOINTS.TESTS}/generate`,
        {
          job_title: aiJobTitle,
          skills: aiSkills,
          type: aiType,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.data && response.data.success && response.data.data) {
        const generated = response.data.data;
        setFormData({
          title: generated.title || "",
          type: aiType,
          link: formData.link || "https://",
          description: generated.description || "",
        });
        setShowAiModal(false);
        await alertSuccess("Skenario tes berhasil dibuat oleh AI!");
      }
    } catch (err: any) {
      console.error(err);
      await alertError(err?.response?.data?.message || "Gagal membuat skenario tes.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.description) {
      await alertError("Mohon lengkapi semua kolom wajib!");
      return;
    }

    setIsSubmitting(true);
    try {
      await suppressErrorForSuperAdmin(() => API.post(ENDPOINTS.TESTS, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }), { showSuccessMessage: true, successMessage: "Tes berhasil ditambahkan!" });

      route.replace("/dashboard/tes");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setErrors(responseError || {});
        }
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-6 relative">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/tes"}
        >
          Tes
        </Link>{" "}
        -&gt; Tambah Tes
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <HelpCircle className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Tes</h2>
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="bg-vip hover:bg-orange-400 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-vip/15 cursor-pointer transition-all"
        >
          <Sparkles size={16} className="text-amber-200 animate-pulse" />
          Bantu Buat dengan AI
        </button>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 m-auto my-10 max-w-4xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gray-200 p-2 rounded-full w-10 h-10 my-auto flex items-center justify-center">
            <HelpCircle className="text-accent" size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800">Tambah Tes</h2>
            <p className="text-gray-400 text-sm">
              Silahkan isi semua informasi yang dibutuhkan atau gunakan asisten AI untuk merancang secara otomatis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-600">
          {/* Judul tes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Tes <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Masukkan judul tes"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Tipe Tes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Tes <span className="text-red-500">*</span>
            </label>
            <select
              disabled={isSubmitting}
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as type })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Pilih Jenis Tes</option>
              <option value="theory">Tes Teori</option>
              <option value="practice">Tes Praktik</option>
              <option value="other">Tes Lainnya</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Link tes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Tes (Opsional)
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.link ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://makerindo.co.id"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
            />
            {errors.link && (
              <p className="mt-1 text-sm text-red-500">{errors.link}</p>
            )}
          </div>

          {/* Deskripsi Tes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi / Instruksi Tes <span className="text-red-500">*</span>
            </label>
            <textarea
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
              placeholder="Masukkan deskripsi atau instruksi pengerjaan tentang tes"
              value={formData.description}
              className={`resize-none w-full h-40 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-end">
          <Link
            href="/dashboard/tes"
            onClick={async (e) => {
              e.preventDefault();
              if (isSubmitting) return;
              const isConfirm = await alertConfirm(
                "Apakah anda yakin ingin membatalkan!"
              );
              if (isConfirm) {
                route.push("/dashboard/tes");
              }
            }}
            className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center ${isSubmitting ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      {/* ─── AI SCENARIO GENERATOR MODAL ─── */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#035a70] to-[#04829e] text-white">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 animate-pulse text-amber-200" />
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5">
                  AI Test Scenario Generator
                </h3>
              </div>
              <button
                onClick={() => !aiLoading && setShowAiModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                disabled={aiLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-gray-700">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Posisi Pekerjaan / Judul Lowongan
                </label>
                <input
                  type="text"
                  value={aiJobTitle}
                  onChange={(e) => setAiJobTitle(e.target.value)}
                  placeholder="Contoh: Junior Web Developer, UI/UX Designer"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                  disabled={aiLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Tipe Tes
                </label>
                <select
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value as type)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all"
                  disabled={aiLoading}
                >
                  <option value="theory">Tes Teori</option>
                  <option value="practice">Tes Praktik</option>
                  <option value="other">Tes Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Skill / Topik Utama (Opsional)
                </label>
                <textarea
                  value={aiSkills}
                  onChange={(e) => setAiSkills(e.target.value)}
                  placeholder="Contoh: React Hooks, Redux, responsive design dengan Tailwind"
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all resize-none"
                  disabled={aiLoading}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/50">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                disabled={aiLoading}
              >
                Batal
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiJobTitle.trim()}
                className="px-5 py-2 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-lg text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyusun...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    Generate Skenario
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default tambahLowonganPage;
