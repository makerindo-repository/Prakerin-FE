"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "@/utils/config";
import { alertError, alertSuccess } from "@/libs/alert";
import PermissionGuard from "@/components/PermissionGuard";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Globe,
  Database,
  ArrowRight,
} from "lucide-react";

export default function PengaturanPage() {
  return (
    <PermissionGuard permission="view_pengaturan">
      <PengaturanContent />
    </PermissionGuard>
  );
}

function PengaturanContent() {
  const [activeTab, setActiveTab] = useState<"umum" | "kebijakan" | "integrasi" | "smtp">("umum");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Form states mapping directly to backend setting keys
  const [form, setForm] = useState({
    platform_name: "Prakerin Management Portal",
    support_email: "support@prakerin.com",
    support_phone: "+62 812-3456-7890",
    support_address: "Bandung, West Java, Indonesia",
    max_concurrent_applications: 3,
    auto_approve_schools: false,
    auto_approve_companies: false,
    auto_approve_students: false,
    mou_number_prefix: "MOU/{YEAR}/{MONTH}/{ID}",
    cert_number_prefix: "CERT/{YEAR}/{ID}",
    min_internship_duration: 1,
    max_internship_duration: 52,
    pre_internship_class_url: "https://makerindo.myr.id/",
    ai_provider: "gemini",
    ai_api_key: "",
    recaptcha_enabled: false,
    recaptcha_site_key: "",
    recaptcha_secret_key: "",
    smtp_host: "smtp.mailtrap.io",
    smtp_port: 2525,
    smtp_username: "",
    smtp_password: "",
    smtp_encryption: "tls",
    smtp_from_email: "noreply@prakerin.com",
    smtp_from_name: "Prakerin Support",
  });

  // Password visibility toggles
  const [showAiKey, setShowAiKey] = useState(false);
  const [showRecaptchaSecret, setShowRecaptchaSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(ENDPOINTS.SETTINGS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      if (response.data?.data) {
        const fetched = response.data.data;
        setForm((prev) => ({
          ...prev,
          ...fetched,
          // Ensure booleans are correctly casted from potential string representations
          auto_approve_schools: fetched.auto_approve_schools === true || fetched.auto_approve_schools === "true",
          auto_approve_companies: fetched.auto_approve_companies === true || fetched.auto_approve_companies === "true",
          auto_approve_students: fetched.auto_approve_students === true || fetched.auto_approve_students === "true",
          recaptcha_enabled: fetched.recaptcha_enabled === true || fetched.recaptcha_enabled === "true",
          max_concurrent_applications: Number(fetched.max_concurrent_applications || 3),
          min_internship_duration: Number(fetched.min_internship_duration || 1),
          max_internship_duration: Number(fetched.max_internship_duration || 52),
          smtp_port: Number(fetched.smtp_port || 2525),
        }));
      }
    } catch (error: any) {
      console.error(error);
      alertError("Gagal mengambil data pengaturan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Send settings payload wrapped inside settings key as expected by backend
      const response = await API.post(
        ENDPOINTS.SETTINGS,
        { settings: form },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        alertSuccess("Pengaturan sistem berhasil disimpan!");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal menyimpan pengaturan.";
      alertError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const testSmtpConnection = async () => {
    setIsTestingSmtp(true);
    try {
      // First save settings so backend has latest config
      await API.post(
        ENDPOINTS.SETTINGS,
        { settings: form },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      const response = await API.post(
        `${ENDPOINTS.SETTINGS}/test-smtp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.data?.status === "success") {
        alertSuccess(response.data.message || "Koneksi SMTP berhasil!");
      } else {
        alertError("Koneksi SMTP gagal.");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal menghubungkan ke server SMTP.";
      alertError(msg);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const testAiConnection = async () => {
    setIsTestingAi(true);
    try {
      // First save settings so backend has latest config
      await API.post(
        ENDPOINTS.SETTINGS,
        { settings: form },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      const response = await API.post(
        `${ENDPOINTS.SETTINGS}/test-ai`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.data?.status === "success") {
        alertSuccess(response.data.message || "Koneksi Gemini API Berhasil!");
      } else {
        alertError("Koneksi Gemini API Gagal.");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal menghubungi API Gemini.";
      alertError(msg);
    } finally {
      setIsTestingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Memuat konfigurasi sistem...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-1">SISTEM</p>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pengaturan Sistem</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-2xl leading-relaxed">
          Kelola parameter platform global, kebijakan pendaftaran siswa, integrasi kunci API pihak ketiga, dan pengaturan server surat (SMTP).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* TABS SELECTOR (LEFT SIDEBAR) */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab("umum")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer ${
              activeTab === "umum"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
            }`}
          >
            <Globe className={`w-5 h-5 ${activeTab === "umum" ? "text-indigo-600" : "text-gray-400"}`} />
            Umum & Branding
          </button>
          <button
            onClick={() => setActiveTab("kebijakan")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer ${
              activeTab === "kebijakan"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${activeTab === "kebijakan" ? "text-indigo-600" : "text-gray-400"}`} />
            Kebijakan Magang
          </button>
          <button
            onClick={() => setActiveTab("integrasi")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer ${
              activeTab === "integrasi"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
            }`}
          >
            <Cpu className={`w-5 h-5 ${activeTab === "integrasi" ? "text-indigo-600" : "text-gray-400"}`} />
            Integrasi & API
          </button>
          <button
            onClick={() => setActiveTab("smtp")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer ${
              activeTab === "smtp"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
            }`}
          >
            <Mail className={`w-5 h-5 ${activeTab === "smtp" ? "text-indigo-600" : "text-gray-400"}`} />
            Server Email (SMTP)
          </button>
        </div>

        {/* ACTIVE FORM AREA */}
        <div className="lg:col-span-3">
          <form onSubmit={saveSettings} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* TAB CONTENT: UMUM */}
            {activeTab === "umum" && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Pengaturan Umum & Branding</h3>
                  <p className="text-gray-500 text-xs mt-1">Sesuaikan identitas nama dan kontak dukungan pada platform.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Platform / Aplikasi</label>
                    <input
                      type="text"
                      name="platform_name"
                      value={form.platform_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Contoh: Prakerin Portal"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Layanan Pelanggan (CS)</label>
                    <input
                      type="email"
                      name="support_email"
                      value={form.support_email}
                      onChange={handleInputChange}
                      required
                      placeholder="support@prakerin.id"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon CS</label>
                    <input
                      type="text"
                      name="support_phone"
                      value={form.support_phone}
                      onChange={handleInputChange}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Kantor CS</label>
                    <textarea
                      name="support_address"
                      value={form.support_address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Masukkan alamat lengkap kantor..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: KEBIJAKAN MAGANG */}
            {activeTab === "kebijakan" && (
              <div className="p-6 md:p-8 space-y-8">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900">Kebijakan Alur Kerja Magang</h3>
                  <p className="text-gray-500 text-xs mt-1">Konfigurasikan aturan validasi otomatis dan pendaftaran magang siswa.</p>
                </div>

                <div className="space-y-6">
                  {/* AUTO APPROVAL TOGGLES */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Verifikasi Otomatis Akun Baru</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* School Toggle */}
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-800">Institusi Sekolah</p>
                          <p className="text-gray-400 text-xs">Aktif instan tanpa review</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.auto_approve_schools}
                          onChange={(e) => handleToggleChange("auto_approve_schools", e.target.checked)}
                          className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-indigo-600 relative transition-all duration-200 outline-none cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:translate-x-5 before:transition-all"
                        />
                      </div>

                      {/* Company Toggle */}
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-800">Mitra Industri</p>
                          <p className="text-gray-400 text-xs">Aktif instan tanpa review</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.auto_approve_companies}
                          onChange={(e) => handleToggleChange("auto_approve_companies", e.target.checked)}
                          className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-indigo-600 relative transition-all duration-200 outline-none cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:translate-x-5 before:transition-all"
                        />
                      </div>

                      {/* Student Toggle */}
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-800">Siswa / Mahasiswa</p>
                          <p className="text-gray-400 text-xs">Aktif instan tanpa review</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.auto_approve_students}
                          onChange={(e) => handleToggleChange("auto_approve_students", e.target.checked)}
                          className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-indigo-600 relative transition-all duration-200 outline-none cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:translate-x-5 before:transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENT & LIMIT CONTROLS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Batas Lamaran Aktif Bersamaan
                      </label>
                      <input
                        type="number"
                        name="max_concurrent_applications"
                        value={form.max_concurrent_applications}
                        onChange={handleInputChange}
                        min={1}
                        max={10}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                      />
                      <p className="text-gray-400 text-xs mt-1">Batas maksimal lamaran magang yang boleh berjalan serentak per siswa.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durasi Magang Minimal (Minggu)
                      </label>
                      <input
                        type="number"
                        name="min_internship_duration"
                        value={form.min_internship_duration}
                        onChange={handleInputChange}
                        min={1}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Format Prefix Dokumen MoU Kerja Sama
                      </label>
                      <input
                        type="text"
                        name="mou_number_prefix"
                        value={form.mou_number_prefix}
                        onChange={handleInputChange}
                        required
                        placeholder="MOU/{YEAR}/{MONTH}/{ID}"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                      />
                      <p className="text-gray-400 text-[10px] mt-1">Dukung placeholder: {"{YEAR}"}, {"{MONTH}"}, {"{ID}"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Format Prefix Nomor Sertifikat Magang
                      </label>
                      <input
                        type="text"
                        name="cert_number_prefix"
                        value={form.cert_number_prefix}
                        onChange={handleInputChange}
                        required
                        placeholder="CERT/{YEAR}/{ID}"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Link Kelas Pra-Magang (LMS)
                      </label>
                      <input
                        type="url"
                        name="pre_internship_class_url"
                        value={form.pre_internship_class_url}
                        onChange={handleInputChange}
                        required
                        placeholder="https://makerindo.myr.id/"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        URL yang dituju menu &quot;Kelas Pra-Magang&quot; di sidebar semua role (siswa/mahasiswa, sekolah, perusahaan, admin).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: INTEGRASI */}
            {activeTab === "integrasi" && (
              <div className="p-6 md:p-8 space-y-8">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900">Integrasi Layanan & Kunci API</h3>
                  <p className="text-gray-500 text-xs mt-1">Hubungkan platform dengan Google reCAPTCHA dan layanan Google Gemini AI.</p>
                </div>

                <div className="space-y-6">
                  {/* GOOGLE GEMINI AI SECTION */}
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Kecerdasan Buatan (AI Analytics)</h4>
                        <p className="text-gray-400 text-xs">Digunakan untuk menghasilkan review otomatis CV & laporan magang.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Penyedia Model AI</label>
                        <select
                          name="ai_provider"
                          value={form.ai_provider}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none"
                        >
                          <option value="gemini">Google Gemini (Default)</option>
                          <option value="none">Tidak Aktif</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gemini API Key</label>
                        <div className="relative">
                          <input
                            type={showAiKey ? "text" : "password"}
                            name="ai_api_key"
                            value={form.ai_api_key}
                            onChange={handleInputChange}
                            placeholder="AIzaSy..."
                            className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAiKey(!showAiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {form.ai_provider === "gemini" && form.ai_api_key && (
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={testAiConnection}
                          disabled={isTestingAi}
                          className="px-4 py-2 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isTestingAi ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Menguji...
                            </>
                          ) : (
                            "Uji Koneksi Gemini"
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* RECAPTCHA SECTION */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-200/60 text-gray-600 rounded-xl">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">Keamanan Google reCAPTCHA v3</h4>
                          <p className="text-gray-400 text-xs">Proteksi bot pada form pendaftaran akun baru.</p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={form.recaptcha_enabled}
                        onChange={(e) => handleToggleChange("recaptcha_enabled", e.target.checked)}
                        className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-indigo-600 relative transition-all duration-200 outline-none cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:translate-x-5 before:transition-all"
                      />
                    </div>

                    {form.recaptcha_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">reCAPTCHA Site Key</label>
                          <input
                            type="text"
                            name="recaptcha_site_key"
                            value={form.recaptcha_site_key}
                            onChange={handleInputChange}
                            placeholder="Site Key Publik"
                            required={form.recaptcha_enabled}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">reCAPTCHA Secret Key</label>
                          <div className="relative">
                            <input
                              type={showRecaptchaSecret ? "text" : "password"}
                              name="recaptcha_secret_key"
                              value={form.recaptcha_secret_key}
                              onChange={handleInputChange}
                              placeholder="Secret Key Privat"
                              required={form.recaptcha_enabled}
                              className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRecaptchaSecret(!showRecaptchaSecret)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              {showRecaptchaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SMTP */}
            {activeTab === "smtp" && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Server Pengiriman Email (SMTP)</h3>
                      <p className="text-gray-500 text-xs mt-1">Konfigurasikan infrastruktur pengiriman email reset password dan verifikasi akun.</p>
                    </div>

                    <button
                      type="button"
                      onClick={testSmtpConnection}
                      disabled={isTestingSmtp || !form.smtp_host}
                      className="px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isTestingSmtp ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Menguji server...
                        </>
                      ) : (
                        "Uji Koneksi Server"
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Host Server SMTP</label>
                    <input
                      type="text"
                      name="smtp_host"
                      value={form.smtp_host}
                      onChange={handleInputChange}
                      placeholder="Contoh: smtp.mailtrap.io"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Port Server</label>
                    <input
                      type="number"
                      name="smtp_port"
                      value={form.smtp_port}
                      onChange={handleInputChange}
                      placeholder="587"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Protokol Enkripsi</label>
                    <select
                      name="smtp_encryption"
                      value={form.smtp_encryption}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    >
                      <option value="tls">TLS (Direkomendasikan)</option>
                      <option value="ssl">SSL</option>
                      <option value="none">Tanpa Enkripsi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username SMTP</label>
                    <input
                      type="text"
                      name="smtp_username"
                      value={form.smtp_username}
                      onChange={handleInputChange}
                      placeholder="Username akun server..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password SMTP</label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? "text" : "password"}
                        name="smtp_password"
                        value={form.smtp_password}
                        onChange={handleInputChange}
                        placeholder="Password akun server..."
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showSmtpPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Pengirim (Sender Email)</label>
                    <input
                      type="email"
                      name="smtp_from_email"
                      value={form.smtp_from_email}
                      onChange={handleInputChange}
                      placeholder="noreply@prakerin.id"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Pengirim (Sender Name)</label>
                    <input
                      type="text"
                      name="smtp_from_name"
                      value={form.smtp_from_name}
                      onChange={handleInputChange}
                      placeholder="Prakerin Indonesia"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STICKY CARD ACTION FOOTER */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Data akan disimpan ke database pusat
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Simpan Pengaturan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}