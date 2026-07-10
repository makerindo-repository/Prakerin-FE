"use client";
import { AlertCircle, ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Clock, HelpCircle, Mail, MessageSquare, Send, User } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { alertError, alertSuccess } from "@/libs/alert";

interface MessageForm {
  name: string;
  email: string;
  category: "general" | "bug" | "feedback";
  subject: string;
  message: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface Reply {
  id: string;
  reply_message: string;
  created_at: string;
  replied_by?: {
    username: string;
  };
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  replies: Reply[];
}

const HubungiKamiPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"send" | "check">("send");
  
  // Send message form state
  const [form, setForm] = useState<MessageForm>({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Check replies state
  const [checkEmail, setCheckEmail] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<ContactMessage[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Pre-fill email if logged-in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = Cookies.get("userToken");
        if (token) {
          const response = await API.get("/api/v1/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = response.data.data || response.data;
          setForm((prev) => ({
            ...prev,
            name: user.name || user.username || "",
            email: user.email || "",
          }));
          setCheckEmail(user.email || "");
        }
      } catch (e) {
        console.error("Not logged in or profile fetch failed:", e);
      }
    };
    checkLogin();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmittedId(null);

    // Frontend validation — prevent empty/whitespace-only fields
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama tidak boleh kosong";
    if (!form.email.trim()) newErrors.email = "Email tidak boleh kosong";
    if (!form.subject.trim()) newErrors.subject = "Subjek tidak boleh kosong";
    if (!form.message.trim()) newErrors.message = "Pesan tidak boleh kosong";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post("/api/v1/contacts", form);
      await alertSuccess("Pesan berhasil dikirim!");
      setSubmittedId(response.data.message_id);
      setForm((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        const resErrors = error.response?.data.errors;
        if (typeof resErrors === "string") {
          await alertError(resErrors);
        } else {
          setErrors(resErrors || {});
        }
      } else {
        await alertError("Gagal mengirim pesan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchReplies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmail.trim()) return;

    setIsSearching(true);
    setSearchResult([]);
    setHasSearched(true);

    try {
      const response = await API.get(`/api/v1/contacts/user/${encodeURIComponent(checkEmail)}`);
      setSearchResult(response.data.data || []);
    } catch (error) {
      console.error("Error searching replies:", error);
      await alertError("Gagal memeriksa balasan");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Baru</span>;
      case "read":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Dibaca</span>;
      case "replied":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Dibalas</span>;
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "bug":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Bug</span>;
      case "feedback":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Feedback</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Umum</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navbar / Top Bar */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-accent font-bold text-xl">
            <HelpCircle className="w-6 h-6 text-accent" />
            <span>Prakerin</span>
          </Link>
          <Link href="/" className="text-gray-600 hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors">
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Hubungi Kami</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Punya kendala, masukan, atau pertanyaan seputar program Prakerin? Silahkan hubungi kami.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("send")}
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === "send"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Kirim Pesan
          </button>
          <button
            onClick={() => setActiveTab("check")}
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === "check"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Cek Balasan Anda
          </button>
        </div>

        {/* Tab 1: Kirim Pesan */}
        {activeTab === "send" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
            {submittedId && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Pesan Berhasil Dikirim!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Terima kasih telah menghubungi kami. Kami akan memproses pesan Anda segera.
                  </p>
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    ID Pesan: {submittedId}
                  </p>
                  <button
                    onClick={() => {
                      setSubmittedId(null);
                      setActiveTab("check");
                    }}
                    className="text-xs text-accent underline mt-2 font-semibold hover:text-accent-hover block cursor-pointer"
                  >
                    Periksa status & balasan pesan Anda di sini
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                        errors.name ? "border-red-500" : "border-gray-200"
                      }`}
                      required
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="contoh@domain.com"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      }`}
                      required
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Pesan<span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-accent"
                >
                  <option value="general">Umum / Tanya Jawab</option>
                  <option value="bug">Pelaporan Masalah (Bug)</option>
                  <option value="feedback">Saran / Masukan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjek / Judul<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleInputChange}
                  placeholder="Masukkan subjek pesan"
                  className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    errors.subject ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleInputChange}
                  placeholder="Ketikkan pesan lengkap Anda di sini..."
                  rows={5}
                  className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    errors.message ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Mengirim...</span>
                  ) : (
                    <>
                      <span>Kirim Pesan</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Cek Balasan */}
        {activeTab === "check" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleSearchReplies} className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={checkEmail}
                    onChange={(e) => setCheckEmail(e.target.value)}
                    placeholder="Masukkan email pengirim untuk mencari balasan..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-accent-hover transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? "Mencari..." : "Cari"}
                </button>
              </form>
            </div>

            {hasSearched && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Hasil Pencarian ({searchResult.length})</h3>

                {searchResult.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Tidak ditemukan pesan terkirim dengan email tersebut.</p>
                  </div>
                ) : (
                  searchResult.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Message Summary Head */}
                      <div
                        onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                        className="p-5 flex justify-between items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getCategoryBadge(msg.category)}
                            {getStatusBadge(msg.status)}
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(msg.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900">{msg.subject}</h4>
                          <p className="text-xs text-gray-400">ID: {msg.id}</p>
                        </div>
                        <div>
                          {expandedMessage === msg.id ? (
                            <ChevronUp className="text-gray-400 w-5 h-5" />
                          ) : (
                            <ChevronDown className="text-gray-400 w-5 h-5" />
                          )}
                        </div>
                      </div>

                      {/* Message Thread Body */}
                      {expandedMessage === msg.id && (
                        <div className="border-t border-gray-100 bg-slate-50/50 p-5 space-y-4">
                          {/* Original Message */}
                          <div className="bg-white p-4 rounded-xl border border-gray-150">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-gray-500">Pertanyaan Anda:</span>
                            </div>
                            <p className="text-sm text-gray-800 white-space-pre-line">{msg.message}</p>
                          </div>

                          {/* Admin Replies */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                              <MessageSquare size={12} />
                              <span>Balasan Admin ({msg.replies.length})</span>
                            </h5>

                            {msg.replies.length === 0 ? (
                              <p className="text-xs text-gray-500 italic pl-1">Belum ada balasan dari Admin.</p>
                            ) : (
                              msg.replies.map((reply) => (
                                <div key={reply.id} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 ml-4 relative">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-indigo-700">
                                      Admin ({reply.replied_by?.username || "Staff"})
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(reply.created_at).toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-800 white-space-pre-line">{reply.reply_message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <div className="max-w-6xl mx-auto">
          &copy; {new Date().getFullYear()} Prakerin.id. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HubungiKamiPage;
