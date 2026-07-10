"use client";
import { AlertCircle, ArrowLeft, Clock, Mail, MessageSquare, Send, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API } from "@/utils/config";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { alertError, alertSuccess } from "@/libs/alert";
import Loader from "@/components/loader";

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
  category: "general" | "bug" | "feedback";
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
  replies: Reply[];
}

const ContactMessageDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const messageId = params.id as string;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [errors, setErrors] = useState<{ reply_message?: string }>({});

  const fetchDetail = async () => {
    try {
      const response = await API.get(`/api/v1/contacts/${messageId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setMessage(response.data.data);
    } catch (error) {
      console.error("Error fetching message detail:", error);
      await alertError("Gagal mengambil data detail pesan");
      router.push("/dashboard/contact-messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messageId) {
      fetchDetail();
    }
  }, [messageId]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await API.post(
        `/api/v1/contacts/${messageId}/reply`,
        { reply_message: replyMessage },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      await alertSuccess("Balasan berhasil terkirim!");
      setReplyMessage("");
      fetchDetail(); // Reload conversation thread
    } catch (error) {
      if (error instanceof AxiosError) {
        const resErrors = error.response?.data.errors;
        if (typeof resErrors === "string") {
          await alertError(resErrors);
        } else {
          setErrors(resErrors || {});
        }
      } else {
        await alertError("Gagal mengirim balasan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "read":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "replied":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case "new":
        return "Baru";
      case "read":
        return "Dibaca";
      case "replied":
        return "Dibalas";
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bug":
        return "bg-red-50 text-red-700 border-red-200";
      case "feedback":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "general":
        return "Umum";
      case "bug":
        return "Bug";
      case "feedback":
        return "Feedback";
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>Pesan tidak ditemukan.</p>
        <Link href="/dashboard/contact-messages" className="text-accent underline mt-4 block">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link className="hover:underline hover:text-accent" href={"/dashboard/contact-messages"}>
          Daftar Pesan
        </Link>{" "}
        -&gt; Detail Pesan
      </h1>

      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        {/* Header section */}
        <div className="flex justify-between items-start gap-4 flex-wrap border-b border-gray-100 pb-5 mb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">{message.subject}</h2>
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <User size={12} />
                {message.name}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Mail size={12} />
                {message.email}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(message.created_at).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(message.category)}`}>
              {getCategoryName(message.category)}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(message.status)}`}>
              {getStatusName(message.status)}
            </span>
          </div>
        </div>

        {/* Message message body */}
        <div className="bg-slate-50 p-5 rounded-xl border border-gray-100 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Pesan Pengirim:</span>
          <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">{message.message}</p>
        </div>

        {/* Reply history */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <MessageSquare className="text-accent w-4 h-4" />
            <span>Riwayat Balasan ({message.replies.length})</span>
          </h3>

          {message.replies.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Belum ada balasan untuk pesan ini.</p>
          ) : (
            <div className="space-y-4 pl-4 border-l-2 border-slate-100">
              {message.replies.map((reply) => (
                <div key={reply.id} className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-accent">
                      {reply.replied_by?.username || "Staff Admin"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(reply.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{reply.reply_message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleReplySubmit} className="border-t border-gray-100 pt-6">
          <h4 className="font-semibold text-gray-800 mb-3">Tulis Balasan</h4>
          
          <div className="space-y-4">
            <div>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Ketikkan balasan email Anda di sini..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm ${
                  errors.reply_message ? "border-red-500" : "border-gray-200"
                }`}
                required
              />
              {errors.reply_message && (
                <p className="mt-1 text-xs text-red-500">{errors.reply_message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !replyMessage.trim()}
                className="bg-accent text-white px-5 py-2 rounded-lg font-semibold hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <span>Kirim Balasan</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ContactMessageDetailPage;
