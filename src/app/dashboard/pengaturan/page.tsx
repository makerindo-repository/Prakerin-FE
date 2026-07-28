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
  MessageSquare,
  CreditCard,
  Layers,
  Sparkles,
  Lock,
  SlidersHorizontal,
  Building,
  DollarSign,
  Banknote,
} from "lucide-react";

export default function PengaturanPage() {
  return (
    <PermissionGuard permission="view_pengaturan">
      <PengaturanContent />
    </PermissionGuard>
  );
}

function PengaturanContent() {
  const [activeTab, setActiveTab] = useState<"umum" | "kebijakan" | "integrasi" | "smtp" | "whatsapp" | "tier_access" | "pembayaran">("umum");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isTestingXendit, setIsTestingXendit] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);

  // Form states mapping directly to backend setting keys
  const [form, setForm] = useState({
    platform_name: "Prakerin Management Portal",
    app_name: "Prakerin Management Portal",
    app_logo: "",
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
    xendit_secret_key: "",
    xendit_webhook_token: "",
    xendit_payment_methods: "",
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
    whatsapp_notifications_active: false,
    whatsapp_api_provider: "meta",
    whatsapp_api_key: "",
    whatsapp_sender_number: "",
    whatsapp_meta_phone_number_id: "",
    whatsapp_qontak_channel_id: "",
    whatsapp_qontak_template_id: "",
    pro_access_ai_cv_generator: true,
    pro_access_ai_analytics: true,
    pro_access_ai_report: true,
    pro_monthly_price: 99000,
    pro_yearly_price: 999000,
    company_bank_name: "Bank Central Asia (BCA)",
    company_bank_account_number: "",
    company_bank_account_name: "",
    company_bank_address: "",
  });

  // Password visibility toggles
  const [showAiKey, setShowAiKey] = useState(false);
  const [showXenditKey, setShowXenditKey] = useState(false);
  const [showRecaptchaSecret, setShowRecaptchaSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showWaKey, setShowWaKey] = useState(false);

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
          whatsapp_notifications_active: fetched.whatsapp_notifications_active === true || fetched.whatsapp_notifications_active === "true",
          pro_access_ai_cv_generator: fetched.pro_access_ai_cv_generator !== undefined ? (fetched.pro_access_ai_cv_generator === true || fetched.pro_access_ai_cv_generator === "true") : true,
          pro_access_ai_analytics: fetched.pro_access_ai_analytics !== undefined ? (fetched.pro_access_ai_analytics === true || fetched.pro_access_ai_analytics === "true") : true,
          pro_access_ai_report: fetched.pro_access_ai_report !== undefined ? (fetched.pro_access_ai_report === true || fetched.pro_access_ai_report === "true") : true,
          pro_monthly_price: Number(fetched.pro_monthly_price || 99000),
          pro_yearly_price: Number(fetched.pro_yearly_price || 999000),
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

  const testXenditConnection = async () => {
    setIsTestingXendit(true);
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
        `${ENDPOINTS.SETTINGS}/test-xendit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.data?.status === "success") {
        alertSuccess(response.data.message || "Koneksi Xendit Berhasil!");
      } else {
        alertError("Koneksi Xendit Gagal.");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal menghubungi API Xendit.";
      alertError(msg);
    } finally {
      setIsTestingXendit(false);
    }
  };

  const testWaConnection = async () => {
    setIsTestingWa(true);
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
        `${ENDPOINTS.SETTINGS}/test-whatsapp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.data?.status === "success") {
        alertSuccess(response.data.message || "Koneksi WhatsApp API Berhasil!");
      } else {
        alertError(response.data?.message || "Koneksi WhatsApp API Gagal.");
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsTestingWa(false);
    }
  };

  // Broadcast & Message Template State
  const [broadcastTarget, setBroadcastTarget] = useState<string>("all_wa_users");
  const [broadcastTitle, setBroadcastTitle] = useState<string>("📢 Pengumuman Platform Prakerin");
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    "Halo {name},\n\nAda informasi penting dari platform Prakerin untuk kamu.\n\n🔗 Silakan cek di:\n{link}"
  );
  const [broadcastActionUrl, setBroadcastActionUrl] = useState<string>("http://localhost:3000/dashboard");
  const [singleUserIdentifier, setSingleUserIdentifier] = useState<string>("");
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  const PRESET_TEMPLATES = [
    {
      id: "ads_pro",
      name: "📢 Promosi / Ads (Aplikasi PRO)",
      title: "🚀 Tingkatkan Karirmu dengan Prakerin PRO!",
      message: "Halo {name},\n\nTingkatkan skill dan dapatkan rekomendasi tempat magang favorit lebih cepat dengan upgrade ke Prakerin PRO!\n\n🔗 Cek penawaran khusus di:\n{link}",
      target: "unapplied_students"
    },
    {
      id: "app_status",
      name: "📋 Status Lamaran Magang",
      title: "📋 Pembaruan Status Lamaran Magang",
      message: "Halo {name},\n\nStatus pengajuan magang kamu telah diperbarui oleh perusahaan/mitra. Harap segera memeriksa detail lengkap di dashboard.\n\n🔗 Lihat detail:\n{link}",
      target: "all_wa_users"
    },
    {
      id: "new_task",
      name: "📝 Penugasan Tugas Magang",
      title: "📝 Tugas Magang Baru Diberikan",
      message: "Halo {name},\n\nPembimbing magang kamu memberikan tugas baru di platform. Pastikan kamu membaca petunjuk dan menyelesaikan tepat waktu.\n\n🔗 Buka tugas:\n{link}",
      target: "active_interns"
    },
    {
      id: "announcement",
      name: "📣 Pengumuman Umum Platform",
      title: "📣 Informasi Penting Prakerin",
      message: "Halo {name},\n\nKami menginfokan pembaruan penting mengenai layanan platform Prakerin. Jangan lupa lengkapi profil dan jurnal magang kamu.\n\n🔗 Kunjungi dashboard:\n{link}",
      target: "all_wa_users"
    }
  ];

  const applyPresetTemplate = (templateId: string) => {
    const selected = PRESET_TEMPLATES.find((t) => t.id === templateId);
    if (selected) {
      setBroadcastTitle(selected.title);
      setBroadcastMessage(selected.message);
      if (selected.target) {
        setBroadcastTarget(selected.target);
      }
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alertError("Judul dan isi pesan broadcast tidak boleh kosong.");
      return;
    }

    if (broadcastTarget === "test_single_user" && !singleUserIdentifier.trim()) {
      alertError("Harap masukkan Email, No. HP, atau User ID target uji coba.");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mengirim pesan WhatsApp broadcast ini ke kelompok target [${broadcastTarget}]?`)) {
      return;
    }

    setIsBroadcasting(true);
    try {
      const response = await API.post(
        `${ENDPOINTS.SETTINGS}/broadcast-whatsapp`,
        {
          target_group: broadcastTarget,
          title: broadcastTitle,
          message: broadcastMessage,
          action_url: broadcastActionUrl,
          single_user_identifier: singleUserIdentifier,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.data?.status === "success") {
        alertSuccess(response.data.message || "Pesan broadcast WhatsApp berhasil menjadualkan pengiriman!");
      } else {
        alertError(response.data?.message || "Gagal mengirim broadcast WhatsApp.");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal mengirim broadcast WhatsApp.";
      alertError(msg);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Email Broadcast State
  const [emailBroadcastTarget, setEmailBroadcastTarget] = useState<string>("all_email_users");
  const [emailBroadcastTitle, setEmailBroadcastTitle] = useState<string>("📢 Informasi Terbaru Platform Prakerin");
  const [emailBroadcastMessage, setEmailBroadcastMessage] = useState<string>(
    "Halo {name},\n\nKami menginformasikan pembaruan penting mengenai aktivitas magang kamu di platform Prakerin.\n\n🔗 Silakan buka tautan berikut untuk melihat rincian selengkapnya:\n{link}"
  );
  const [emailBroadcastActionUrl, setEmailBroadcastActionUrl] = useState<string>("http://localhost:3000/dashboard");
  const [emailSingleUserIdentifier, setEmailSingleUserIdentifier] = useState<string>("");
  const [emailHeaderLogo, setEmailHeaderLogo] = useState<string>("");
  const [emailHeaderTitle, setEmailHeaderTitle] = useState<string>("Ada Notifikasi Baru!");
  const [emailHeaderIcon, setEmailHeaderIcon] = useState<string>("📬");
  const [isBroadcastingEmail, setIsBroadcastingEmail] = useState<boolean>(false);

  // Preview Email Card State
  const [previewRecipientName, setPreviewRecipientName] = useState<string>("eka.wijaya");
  const [previewRecipientRole, setPreviewRecipientRole] = useState<string>("Siswa");

  const EMAIL_PRESET_TEMPLATES = [
    {
      id: "ads_pro_email",
      name: "📢 Promosi / Ads (Aplikasi PRO)",
      title: "🚀 Tingkatkan Karirmu dengan Prakerin PRO!",
      message: "Halo {name},\n\nTingkatkan skill dan dapatkan rekomendasi tempat magang favorit lebih cepat dengan upgrade ke Prakerin PRO!\n\n🔗 Cek penawaran khusus di:\n{link}",
      target: "unapplied_students",
      headerTitle: "Penawaran Khusus Prakerin PRO!",
      headerIcon: "🚀",
    },
    {
      id: "app_status_email",
      name: "📋 Status Lamaran Magang",
      title: "📋 Pembaruan Status Lamaran Magang",
      message: "Halo {name},\n\nStatus pengajuan magang kamu telah diperbarui oleh perusahaan/mitra. Harap segera memeriksa detail lengkap di dashboard.\n\n🔗 Lihat detail:\n{link}",
      target: "all_email_users",
      headerTitle: "Pembaruan Status Lamaran!",
      headerIcon: "📋",
    },
    {
      id: "new_task_email",
      name: "📝 Penugasan Tugas Magang",
      title: "📝 Tugas Magang Baru Diberikan",
      message: "Halo {name},\n\nPembimbing magang kamu memberikan tugas baru di platform. Pastikan kamu membaca petunjuk dan menyelesaikan tepat waktu.\n\n🔗 Buka tugas:\n{link}",
      target: "active_interns",
      headerTitle: "Tugas Magang Baru Diberikan!",
      headerIcon: "📝",
    },
    {
      id: "announcement_email",
      name: "📣 Pengumuman Umum Platform",
      title: "📣 Informasi Penting Prakerin",
      message: "Halo {name},\n\nKami menginfokan pembaruan penting mengenai layanan platform Prakerin. Jangan lupa lengkapi profil dan jurnal magang kamu.\n\n🔗 Kunjungi dashboard:\n{link}",
      target: "all_email_users",
      headerTitle: "Pengumuman Resmi Platform!",
      headerIcon: "📢",
    }
  ];

  const applyEmailPresetTemplate = (templateId: string) => {
    const selected = EMAIL_PRESET_TEMPLATES.find((t) => t.id === templateId);
    if (selected) {
      setEmailBroadcastTitle(selected.title);
      setEmailBroadcastMessage(selected.message);
      if (selected.target) {
        setEmailBroadcastTarget(selected.target);
      }
      if (selected.headerTitle) {
        setEmailHeaderTitle(selected.headerTitle);
      }
      if (selected.headerIcon) {
        setEmailHeaderIcon(selected.headerIcon);
      }
    }
  };

  const handleSendEmailBroadcast = async () => {
    if (!emailBroadcastTitle.trim() || !emailBroadcastMessage.trim()) {
      alertError("Judul dan isi pesan email broadcast tidak boleh kosong.");
      return;
    }

    if (emailBroadcastTarget === "test_single_user" && !emailSingleUserIdentifier.trim()) {
      alertError("Harap masukkan Email, No. HP, atau User ID target uji coba.");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mengirim Email broadcast ini ke kelompok target [${emailBroadcastTarget}]?`)) {
      return;
    }

    setIsBroadcastingEmail(true);
    try {
      const response = await API.post(
        `${ENDPOINTS.SETTINGS}/broadcast-email`,
        {
          target_group: emailBroadcastTarget,
          title: emailBroadcastTitle,
          message: emailBroadcastMessage,
          action_url: emailBroadcastActionUrl,
          single_user_identifier: emailSingleUserIdentifier,
          header_logo_url: emailHeaderLogo,
          header_title: emailHeaderTitle,
          header_icon: emailHeaderIcon,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      if (response.data?.status === "success") {
        alertSuccess(response.data.message || "Email broadcast berhasil dijadwalkan!");
      } else {
        alertError(response.data?.message || "Gagal mengirim Email broadcast.");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal mengirim Email broadcast.";
      alertError(msg);
    } finally {
      setIsBroadcastingEmail(false);
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
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer ${
              activeTab === "whatsapp"
                ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
            }`}
          >
            <MessageSquare className={`w-5 h-5 ${activeTab === "whatsapp" ? "text-green-600" : "text-gray-400"}`} />
            WhatsApp Gateway
          </button>
          <button
            onClick={() => setActiveTab("tier_access")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer ${
              activeTab === "tier_access"
                ? "bg-amber-50 border-amber-200 text-amber-800 shadow-sm"
                : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
            }`}
          >
            <Layers className={`w-5 h-5 ${activeTab === "tier_access" ? "text-amber-600" : "text-gray-400"}`} />
            Akses Tier
          </button>
          <button
            onClick={() => setActiveTab("pembayaran")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer ${
              activeTab === "pembayaran"
                ? "bg-purple-50 border-purple-200 text-purple-800 shadow-sm"
                : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
            }`}
          >
            <CreditCard className={`w-5 h-5 ${activeTab === "pembayaran" ? "text-purple-600" : "text-gray-400"}`} />
            Pembayaran & Langganan
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
                    />
                  </div>
                </div>

                {/* SECTION: EMAIL BROADCAST & TEMPLATE MANAGER */}
                <div className="mt-8 pt-8 border-t border-gray-200/80 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        Kirim Broadcast & Template Pesan Email
                      </h4>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Pilih template preset email atau ketik pesan kustom, lalu pilih kelompok penerima target.
                      </p>
                    </div>

                    {/* Preset Template Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Preset Template:</span>
                      <select
                        onChange={(e) => applyEmailPresetTemplate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">-- Pilih Template Preset --</option>
                        {EMAIL_PRESET_TEMPLATES.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-5">
                    {/* Target Audience Group Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Target Kelompok Penerima Email (Audience Group)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { id: "all_email_users", label: "Semua Pengguna Email Aktif", desc: "Semua akun dengan notifikasi email aktif" },
                          { id: "unapplied_students", label: "Siswa Belum Pernah Melamar", desc: "Target promosi magang / PRO" },
                          { id: "active_interns", label: "Siswa Sedang Magang Aktif", desc: "Pengumuman & tugas magang" },
                          { id: "pro_users", label: "Pengguna Akun PRO / Premium", desc: "Notifikasi eksklusif pengguna PRO" },
                          { id: "test_single_user", label: "Uji Coba Single User", desc: "Kirim tes ke 1 email spesifik" },
                        ].map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => setEmailBroadcastTarget(group.id)}
                            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                              emailBroadcastTarget === group.id
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold"
                                : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                            }`}
                          >
                            <p className="font-bold text-xs">{group.label}</p>
                            <p className={`text-[11px] mt-0.5 ${emailBroadcastTarget === group.id ? "text-indigo-100" : "text-gray-400"}`}>
                              {group.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Single User Identifier Input if test_single_user */}
                    {emailBroadcastTarget === "test_single_user" && (
                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                        <label className="block text-xs font-semibold text-amber-900 mb-1">
                          Email Target Uji Coba (Single User)
                        </label>
                        <input
                          type="text"
                          value={emailSingleUserIdentifier}
                          onChange={(e) => setEmailSingleUserIdentifier(e.target.value)}
                          placeholder="Contoh: makerdotindo@gmail.com"
                          className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                        <p className="text-[11px] text-amber-700 mt-1">
                          Pesan email hanya akan dikirimkan ke 1 alamat email spesifik ini untuk pengujian.
                        </p>
                      </div>
                    )}

                    {/* Title & Content Editor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Email (Subject & Inbox Header)</label>
                        <input
                          type="text"
                          value={emailBroadcastTitle}
                          onChange={(e) => setEmailBroadcastTitle(e.target.value)}
                          placeholder="Judul pesan email..."
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Action Deep Link (URL)</label>
                        <input
                          type="text"
                          value={emailBroadcastActionUrl}
                          onChange={(e) => setEmailBroadcastActionUrl(e.target.value)}
                          placeholder="http://localhost:3000/dashboard/inbox"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Isi Pesan Email</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-400">Sisipkan Variabel:</span>
                          <button
                            type="button"
                            onClick={() => setEmailBroadcastMessage((prev) => prev + " {name}")}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-all cursor-pointer"
                          >
                            + {"{name}"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailBroadcastMessage((prev) => prev + " {role}")}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all cursor-pointer"
                          >
                            + {"{role}"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailBroadcastMessage((prev) => prev + " {link}")}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all cursor-pointer"
                          >
                            + {"{link}"}
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={5}
                        value={emailBroadcastMessage}
                        onChange={(e) => setEmailBroadcastMessage(e.target.value)}
                        placeholder="Ketik isi pesan email di sini..."
                        className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-gray-400">
                        *Variabel <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{"{name}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{"{role}"}</code>, dan <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{"{link}"}</code> akan diganti secara otomatis sesuai penerima.
                      </p>

                      <button
                        type="button"
                        onClick={handleSendEmailBroadcast}
                        disabled={isBroadcastingEmail}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isBroadcastingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menjadwalkan Broadcast...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            Kirim Broadcast Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* LIVE EMAIL CARD PREVIEW CONTAINER */}
                  <div className="mt-8 pt-8 border-t border-gray-200/80 space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h5 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                          Pratinjau Langsung & Kustomisasi Card Email
                        </h5>
                      </div>

                      {/* Sample Recipient Selector */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 font-medium hidden sm:inline">Contoh Penerima:</span>
                        <select
                          value={previewRecipientName}
                          onChange={(e) => {
                            setPreviewRecipientName(e.target.value);
                            setPreviewRecipientRole(e.target.value === "eka.wijaya" ? "Siswa" : e.target.value === "budi.santoso" ? "Mitra" : "SuperAdmin");
                          }}
                          className="px-3 py-1 rounded-lg border border-gray-200 text-xs bg-white text-gray-700 font-semibold cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="eka.wijaya">eka.wijaya (Siswa)</option>
                          <option value="budi.santoso">budi.santoso (Mitra)</option>
                          <option value="sean.superadmin">sean.superadmin (Admin)</option>
                        </select>
                      </div>
                    </div>

                    {/* LIVE CARD CUSTOMIZATION TOOLBAR */}
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          🎨 Kustomisasi Tampilan Banner & Logo Card Preview
                        </label>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
                          Real-time
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">URL Logo Header (Image URL)</label>
                          <input
                            type="text"
                            value={emailHeaderLogo}
                            onChange={(e) => setEmailHeaderLogo(e.target.value)}
                            placeholder="https://imgur.com/logo.png"
                            className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Judul Banner Header</label>
                          <input
                            type="text"
                            value={emailHeaderTitle}
                            onChange={(e) => setEmailHeaderTitle(e.target.value)}
                            placeholder="Ada Notifikasi Baru!"
                            className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Icon Header</label>
                          <select
                            value={emailHeaderIcon}
                            onChange={(e) => setEmailHeaderIcon(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-purple-200 text-xs bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="📬">📬 Notifikasi System</option>
                            <option value="📢">📢 Pengumuman Resmi</option>
                            <option value="🚀">🚀 Promosi & Fitur PRO</option>
                            <option value="📝">📝 Tugas & Magang</option>
                            <option value="🎓">🎓 Kelulusan / Sertifikat</option>
                            <option value="⭐️">⭐️ Notifikasi Spesial</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* RENDERED EMAIL CARD REPLICA */}
                    <div className="max-w-lg mx-auto bg-slate-200/60 p-4 sm:p-6 rounded-3xl border border-slate-300/70 shadow-inner">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 font-sans transition-all">
                        
                        {/* Header Gradient Card */}
                        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-8 text-center text-white relative">
                          {emailHeaderLogo || form.app_logo ? (
                            <img
                              src={emailHeaderLogo || form.app_logo}
                              alt="Logo"
                              className="h-12 mx-auto mb-3 object-contain drop-shadow max-w-[200px]"
                            />
                          ) : (
                            <div className="text-[11px] font-extrabold tracking-widest uppercase text-white/80 mb-3">
                              {form.app_name || "PRAKERIN PLATFORM"}
                            </div>
                          )}
                          <div className="text-4xl mb-2">{emailHeaderIcon || "📬"}</div>
                          <div className="text-xl font-bold text-white">{emailHeaderTitle || "Ada Notifikasi Baru!"}</div>
                          <div className="text-xs text-white/80 mt-1">
                            Kamu punya pembaruan di {form.app_name || "Prakerin"}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 md:p-8 space-y-5">
                          <p className="text-sm text-gray-600">
                            Halo, <strong className="text-gray-900 font-bold">{previewRecipientName}</strong>!
                          </p>

                          <div>
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-extrabold tracking-wider uppercase rounded-full">
                              BROADCAST
                            </span>
                          </div>

                          {/* Message Card */}
                          <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-indigo-600 rounded-xl p-5 space-y-2">
                            <h6 className="font-bold text-gray-900 text-base">
                              {emailBroadcastTitle || "Judul Email Broadcast..."}
                            </h6>
                            <div className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                              {emailBroadcastMessage
                                ? emailBroadcastMessage
                                    .replace(/{name}/g, previewRecipientName)
                                    .replace(/{role}/g, previewRecipientRole)
                                    .replace(/{link}/g, emailBroadcastActionUrl || "http://localhost:3000/dashboard")
                                : "Isi pesan email akan muncul di sini..."}
                            </div>
                          </div>

                          {/* CTA Button */}
                          {emailBroadcastActionUrl && (
                            <div className="text-center pt-2 pb-1">
                              <a
                                href={emailBroadcastActionUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
                              >
                                Lihat di Prakerin →
                              </a>
                            </div>
                          )}

                          <hr className="border-gray-200 my-4" />

                          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                            Jangan lewatkan informasi penting terkait magang kamu.<br />
                            Masuk ke Prakerin untuk melihat detail lengkap.
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 border-t border-slate-200/80 p-5 text-center space-y-1">
                          <div className="text-xs font-bold text-indigo-600">🎓 {form.app_name || "Prakerin"}</div>
                          <p className="text-[10px] text-gray-400">
                            © {new Date().getFullYear()} {form.app_name || "Prakerin Platform"}. Hak cipta dilindungi.<br />
                            Kamu menerima email ini karena notifikasi email diaktifkan di akunmu.
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: WHATSAPP GATEWAY */}
            {activeTab === "whatsapp" && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Konfigurasi WhatsApp Gateway</h3>
                    <p className="text-gray-500 text-sm">Integrasi push notifikasi WhatsApp via Meta Developer Sandbox, Mekari Qontak, atau Twilio</p>
                  </div>
                  <button
                    type="button"
                    onClick={testWaConnection}
                    disabled={isTestingWa}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 font-semibold text-sm transition-all border border-green-200 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingWa ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Uji Koneksi WhatsApp
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Aktifkan Notifikasi WhatsApp Platform</h4>
                    <p className="text-gray-500 text-xs mt-0.5">Jika nonaktif, pengguna tidak dapat menerima notifikasi WhatsApp dari sistem.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleChange("whatsapp_notifications_active", !form.whatsapp_notifications_active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      form.whatsapp_notifications_active ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.whatsapp_notifications_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Penyedia API (Provider)</label>
                    <select
                      name="whatsapp_api_provider"
                      value={form.whatsapp_api_provider}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm bg-white font-medium text-gray-800"
                    >
                      <option value="mock">⚡ Local Mock Gateway (Simulasi Lokal - Tanpa API Key 3rd Party)</option>
                      <option value="qontak">Mekari Qontak (Sandbox / Production API)</option>
                      <option value="meta">Meta Developer Sandbox (WhatsApp Cloud API)</option>
                      <option value="twilio">Twilio (Official Support)</option>
                      <option value="disabled">Nonaktifkan Provider</option>
                    </select>
                  </div>

                  {/* Dynamic Form per Provider */}
                  {form.whatsapp_api_provider === "mock" && (
                    <div className="md:col-span-2 p-4 bg-blue-50/80 rounded-2xl border border-blue-200">
                      <h5 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                        ⚡ Local Mock WhatsApp Gateway Aktif
                      </h5>
                      <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                        Mode ini tidak memerlukan API Key atau akun dari pihak ketiga (Qontak/Meta/Twilio). Semua pesan push notifikasi & broadcast WhatsApp akan <strong>disimulasikan secara lokal</strong>, otomatis dicatat di <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">storage/logs/laravel.log</code>, dan ditandai sebagai terkirim (Status: Sent) di database platform.
                      </p>
                    </div>
                  )}
                  {form.whatsapp_api_provider === "meta" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Phone Number ID</label>
                        <input
                          type="text"
                          name="whatsapp_meta_phone_number_id"
                          value={form.whatsapp_meta_phone_number_id}
                          onChange={handleInputChange}
                          placeholder="Contoh: 104820491029482"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">ID Nomor Telepon pengirim dari Meta Developer Console &gt; WhatsApp &gt; API Setup</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Access Token (Temporary / Permanent)</label>
                        <div className="relative">
                          <input
                            type={showWaKey ? "text" : "password"}
                            name="whatsapp_api_key"
                            value={form.whatsapp_api_key}
                            onChange={handleInputChange}
                            placeholder="EAAG..."
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWaKey(!showWaKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showWaKey ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Access Token dari Meta Developer App / System User Token</p>
                      </div>
                    </>
                  )}

                  {form.whatsapp_api_provider === "qontak" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Qontak Channel Integration ID</label>
                        <input
                          type="text"
                          name="whatsapp_qontak_channel_id"
                          value={form.whatsapp_qontak_channel_id}
                          onChange={handleInputChange}
                          placeholder="Contoh: 8a7c8584-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">Integration ID channel WhatsApp dari Dashboard Mekari Qontak</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Qontak Access Token (Bearer Token)</label>
                        <div className="relative">
                          <input
                            type={showWaKey ? "text" : "password"}
                            name="whatsapp_api_key"
                            value={form.whatsapp_api_key}
                            onChange={handleInputChange}
                            placeholder="eyJhbGciOi..."
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWaKey(!showWaKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showWaKey ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Access Token OAuth2 / Direct API dari Mekari Qontak</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Default Message Template ID (Opsional)</label>
                        <input
                          type="text"
                          name="whatsapp_qontak_template_id"
                          value={form.whatsapp_qontak_template_id}
                          onChange={handleInputChange}
                          placeholder="ID Template Broadcast Qontak (opsional)"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">Kosongkan jika ingin menggunakan pesan direct text biasa</p>
                      </div>
                    </>
                  )}

                  {form.whatsapp_api_provider === "twilio" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor WhatsApp Pengirim (Twilio Sender)</label>
                        <input
                          type="text"
                          name="whatsapp_sender_number"
                          value={form.whatsapp_sender_number}
                          onChange={handleInputChange}
                          placeholder="+14155238886"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Format internasional dengan tanda +, contoh: +14155238886</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Twilio API Key (Account SID : Auth Token)</label>
                        <div className="relative">
                          <input
                            type={showWaKey ? "text" : "password"}
                            name="whatsapp_api_key"
                            value={form.whatsapp_api_key}
                            onChange={handleInputChange}
                            placeholder="ACxxxxxxxxxxxxxxxx:your_auth_token_here"
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWaKey(!showWaKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showWaKey ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Gabungkan Account SID dan Auth Token dipisah dengan titik dua (:)</p>
                      </div>
                    </>
                  )}
                </div>

                {/* SECTION: WHATSAPP BROADCAST & TEMPLATE MANAGER */}
                <div className="mt-8 pt-8 border-t border-gray-200/80 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        Kirim Broadcast & Template Pesan WhatsApp
                      </h4>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Pilih template preset atau ketik pesan kustom, lalu pilih kelompok penerima target.
                      </p>
                    </div>

                    {/* Preset Template Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Preset Template:</span>
                      <select
                        onChange={(e) => applyPresetTemplate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="">-- Pilih Template Preset --</option>
                        {PRESET_TEMPLATES.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-5">
                    {/* Target Audience Group Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Target Kelompok Penerima (Audience Group)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { id: "all_wa_users", label: "Semua Pengguna WA Aktif", desc: "Semua akun dengan notifikasi WA aktif" },
                          { id: "unapplied_students", label: "Siswa Belum Pernah Melamar", desc: "Target promosi magang / PRO" },
                          { id: "active_interns", label: "Siswa Sedang Magang Aktif", desc: "Pengumuman & tugas magang" },
                          { id: "pro_users", label: "Pengguna Akun PRO / Premium", desc: "Notifikasi eksklusif pengguna PRO" },
                          { id: "test_single_user", label: "Uji Coba Single User", desc: "Kirim tes ke 1 email / nomor HP" },
                        ].map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => setBroadcastTarget(group.id)}
                            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                              broadcastTarget === group.id
                                ? "bg-green-600 text-white border-green-600 shadow-sm font-semibold"
                                : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50/30"
                            }`}
                          >
                            <p className="font-bold text-xs">{group.label}</p>
                            <p className={`text-[11px] mt-0.5 ${broadcastTarget === group.id ? "text-green-100" : "text-gray-400"}`}>
                              {group.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Single User Identifier Input if test_single_user */}
                    {broadcastTarget === "test_single_user" && (
                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                        <label className="block text-xs font-semibold text-amber-900 mb-1">
                          Email, No. HP, atau User ID Target Uji Coba
                        </label>
                        <input
                          type="text"
                          value={singleUserIdentifier}
                          onChange={(e) => setSingleUserIdentifier(e.target.value)}
                          placeholder="Contoh: indah@student.com atau 085717481973"
                          className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                        <p className="text-[11px] text-amber-700 mt-1">
                          Pesan hanya akan dikirimkan ke 1 akun spesifik ini untuk pengujian.
                        </p>
                      </div>
                    )}

                    {/* Title & Content Editor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Notifikasi (Inbox & Header)</label>
                        <input
                          type="text"
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          placeholder="Judul pesan broadcast..."
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Action Deep Link (URL)</label>
                        <input
                          type="text"
                          value={broadcastActionUrl}
                          onChange={(e) => setBroadcastActionUrl(e.target.value)}
                          placeholder="http://localhost:3000/dashboard/inbox"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Isi Pesan WhatsApp</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-400">Sisipkan Variabel:</span>
                          <button
                            type="button"
                            onClick={() => setBroadcastMessage((prev) => prev + " {name}")}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-100 text-green-800 hover:bg-green-200 transition-all cursor-pointer"
                          >
                            + {"{name}"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBroadcastMessage((prev) => prev + " {role}")}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all cursor-pointer"
                          >
                            + {"{role}"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBroadcastMessage((prev) => prev + " {link}")}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all cursor-pointer"
                          >
                            + {"{link}"}
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={5}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Ketik pesan WhatsApp di sini..."
                        className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-mono leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-gray-400">
                        *Variabel <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{"{name}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{"{role}"}</code>, dan <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">{"{link}"}</code> akan diganti secara otomatis sesuai penerima.
                      </p>

                      <button
                        type="button"
                        onClick={handleSendBroadcast}
                        disabled={isBroadcasting}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition-all shadow hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isBroadcasting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menjadwalkan Broadcast...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            Kirim Broadcast WhatsApp
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: AKSES TIER */}
            {activeTab === "tier_access" && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Akses Tier & Pengaturan Aksesibilitas Fitur</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    Atur aksesibilitas fitur dan halaman khusus untuk tingkat akun Pro (Premium). Toggle switch berikut menentukan apakah pengguna berstatus Pro dapat mengakses fitur/halaman terkait.
                  </p>
                </div>

                {/* PRO TIER CARD */}
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-100/50 p-6 md:p-8 shadow-sm">
                  {/* CARD HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/80">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-8 ring-amber-500/5">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-extrabold text-gray-900">Kartu Akses Pro (Premium)</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">PRO TIER</span>
                        </div>
                        <p className="text-xs text-amber-900/70 mt-0.5">
                          Konfigurasi ketersediaan halaman dan fitur AI untuk akun siswa/mahasiswa bertipe Pro.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FEATURES LIST & TOGGLERS */}
                  <div className="mt-6 space-y-4">
                    {[
                      {
                        key: "pro_access_ai_cv_generator",
                        name: "AI CV Generator (Pembuat CV Pintar)",
                        path: "/dashboard/cv/cv-pintar",
                        desc: "Akses ke fitur pembuat CV berbasis AI. (Catatan: Akun Free juga dapat menggunakan CV Generator).",
                      },
                      {
                        key: "pro_access_ai_analytics",
                        name: "AI CV Analyzer & Analytics",
                        path: "/dashboard/ai-analytics",
                        desc: "Fitur analisis kecocokan resume & insight karir otomatis menggunakan AI.",
                      },
                      {
                        key: "pro_access_ai_report",
                        name: "AI Report & Summary",
                        path: "/dashboard/ai-report",
                        desc: "Generator ringkasan dan evaluasi kemajuan kegiatan magang berbasis AI.",
                      },
                    ].map((feature) => {
                      const isEnabled = Boolean((form as any)[feature.key]);
                      return (
                        <div
                          key={feature.key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/90 border border-amber-200/60 shadow-2xs hover:border-amber-300 transition-all"
                        >
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{feature.name}</span>
                              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px]">{feature.path}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            <span className={`text-xs font-semibold ${isEnabled ? "text-green-600" : "text-gray-400"}`}>
                              {isEnabled ? "Akses Diizinkan" : "Akses Dinonaktifkan"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleChange(feature.key, !isEnabled)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled ? "bg-amber-500" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PEMBAYARAN & LANGGANAN */}
            {activeTab === "pembayaran" && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Pengaturan Pembayaran & Langganan</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    Kelola harga paket langganan Pro, informasi rekening penagihan perusahaan, serta koneksi Xendit Payment Gateway.
                  </p>
                </div>

                {/* SECTION 1: PRO SUBSCRIPTION PRICING */}
                <div className="bg-purple-50/60 p-5 md:p-6 rounded-2xl border border-purple-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Harga Paket Langganan Pro (Premium)</h4>
                      <p className="text-gray-500 text-xs">Atur tarif biaya langganan siswa/mahasiswa dalam mata uang Rupiah (IDR).</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Harga Paket Pro Bulanan (Rp)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                        <input
                          type="number"
                          name="pro_monthly_price"
                          value={form.pro_monthly_price}
                          onChange={handleInputChange}
                          required
                          min={0}
                          placeholder="99000"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-500 font-semibold"
                        />
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1">
                        Format angka murni tanpa titik/koma (mis. <code className="bg-white px-1 py-0.5 rounded border border-gray-200">99000</code> untuk Rp 99.000 / bulan).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Harga Paket Pro Tahunan (Rp)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                        <input
                          type="number"
                          name="pro_yearly_price"
                          value={form.pro_yearly_price}
                          onChange={handleInputChange}
                          required
                          min={0}
                          placeholder="999000"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-500 font-semibold"
                        />
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1">
                        Format angka murni tanpa titik/koma (mis. <code className="bg-white px-1 py-0.5 rounded border border-gray-200">999000</code> untuk Rp 999.000 / tahun).
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: COMPANY BANK & BILLING DETAILS */}
                <div className="bg-indigo-50/50 p-5 md:p-6 rounded-2xl border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Rekening & Informasi Perusahaan (Xendit Invoice Header)</h4>
                      <p className="text-gray-500 text-xs">Identitas bank dan alamat penagihan resmi perusahaan yang dicantumkan pada kuitansi/invoice.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Bank Perusahaan</label>
                      <input
                        type="text"
                        name="company_bank_name"
                        value={form.company_bank_name}
                        onChange={handleInputChange}
                        placeholder="Contoh: Bank Central Asia (BCA)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor Rekening Bank</label>
                      <input
                        type="text"
                        name="company_bank_account_number"
                        value={form.company_bank_account_number}
                        onChange={handleInputChange}
                        placeholder="Contoh: 1234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Atas Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        name="company_bank_account_name"
                        value={form.company_bank_account_name}
                        onChange={handleInputChange}
                        placeholder="Contoh: PT Makerindo Prima Solusindo"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alamat Cabang / Kantor Perusahaan</label>
                      <input
                        type="text"
                        name="company_bank_address"
                        value={form.company_bank_address}
                        onChange={handleInputChange}
                        placeholder="Contoh: Bandung, West Java, Indonesia"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: XENDIT PAYMENT GATEWAY CONNECTOR */}
                <div className="bg-amber-50/50 p-5 md:p-6 rounded-2xl border border-amber-200/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Konektor API Xendit Payment Gateway</h4>
                      <p className="text-gray-500 text-xs">Dipakai untuk membuat invoice QRIS & memproses webhook callback pembayaran langganan siswa.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Xendit Secret Key</label>
                      <div className="relative">
                        <input
                          type={showXenditKey ? "text" : "password"}
                          name="xendit_secret_key"
                          value={form.xendit_secret_key}
                          onChange={handleInputChange}
                          placeholder="xnd_development_..."
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowXenditKey(!showXenditKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showXenditKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1">
                        Gunakan key berawalan <code className="bg-white px-1 py-0.5 rounded border border-gray-200">xnd_development_</code> untuk uji coba, atau <code className="bg-white px-1 py-0.5 rounded border border-gray-200">xnd_production_</code> untuk live.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Webhook Verification Token</label>
                      <input
                        type="text"
                        name="xendit_webhook_token"
                        value={form.xendit_webhook_token}
                        onChange={handleInputChange}
                        placeholder="Token dari Xendit Dashboard > Webhooks"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-gray-400 text-[11px] mt-1">
                        Memverifikasi keaslian payload callback webhook dari Xendit server.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Batasi Channel Pembayaran (Opsional)</label>
                      <input
                        type="text"
                        name="xendit_payment_methods"
                        value={form.xendit_payment_methods}
                        onChange={handleInputChange}
                        placeholder="Kosongkan (default) — atau isi 'QRCODE' setelah QRIS aktif"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-gray-400 text-[11px] mt-1">
                        Kosongkan agar Xendit menampilkan semua saluran pembayaran aktif di akunmu (VA, e-wallet, QRIS).
                      </p>
                    </div>
                  </div>

                  {form.xendit_secret_key && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={testXenditConnection}
                        disabled={isTestingXendit}
                        className="px-4 py-2 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isTestingXendit ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Menguji Koneksi Xendit...
                          </>
                        ) : (
                          "Uji Koneksi Xendit API"
                        )}
                      </button>
                    </div>
                  )}
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