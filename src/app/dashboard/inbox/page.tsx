"use client";

import { useEffect, useState, useCallback } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import { alertError, alertSuccess } from "@/libs/alert";
import {
  Bell,
  BellOff,
  CheckCheck,
  ClipboardList,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Briefcase,
  RefreshCw,
  ChevronRight,
  InboxIcon,
} from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/utils/timeAgo";

interface InboxItem {
  id: number;
  user_id: string;
  sender_id: string | null;
  title: string;
  content: string;
  type: string;
  related_type: string | null;
  related_id: number | null;
  action_url: string | null;
  is_read: boolean;
  notification_sent: boolean;
  created_at: string;
}

interface InboxMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  application_status: {
    icon: <ClipboardList className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
    label: "Status Lamaran",
  },
  new_task: {
    icon: <FileText className="w-5 h-5" />,
    color: "from-amber-500 to-orange-500",
    label: "Tugas Baru",
  },
  report_feedback: {
    icon: <MessageSquare className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    label: "Feedback Laporan",
  },
  new_application: {
    icon: <Briefcase className="w-5 h-5" />,
    color: "from-purple-500 to-indigo-500",
    label: "Lamaran Masuk",
  },
};

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [meta, setMeta] = useState<InboxMeta | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInbox = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await API.get(`${ENDPOINTS.INBOX}?page=${page}`);
      setItems(res.data.data);
      setMeta(res.data.meta);
      setUnreadCount(res.data.unread_count);
    } catch (e) {
      alertError("Gagal memuat notifikasi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox(currentPage);
  }, [currentPage, fetchInbox]);

  const markRead = async (id: number) => {
    try {
      await API.patch(`${ENDPOINTS.INBOX}/${id}/read`);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await API.patch(`${ENDPOINTS.INBOX}/mark-all-read`);
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      alertSuccess("Semua notifikasi ditandai sudah dibaca.");
    } catch {
      alertError("Gagal menandai semua notifikasi.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getTypeConfig = (type: string) =>
    typeConfig[type] ?? {
      icon: <Bell className="w-5 h-5" />,
      color: "from-gray-400 to-gray-500",
      label: type,
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
              <InboxIcon className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Notifikasi
              </h1>
              <p className="text-sm text-slate-500">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInbox(currentPage)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={isMarkingAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-200 disabled:opacity-60"
              >
                {isMarkingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                Tandai Semua Dibaca
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-500 text-sm">Memuat notifikasi...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <BellOff className="w-12 h-12 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-semibold text-lg">Tidak ada notifikasi</p>
              <p className="text-slate-400 text-sm mt-1">
                Semua notifikasi akan muncul di sini
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const { icon, color, label } = getTypeConfig(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.is_read) markRead(item.id);
                  }}
                  className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                    item.is_read
                      ? "border-slate-100 opacity-80"
                      : "border-indigo-200 shadow-indigo-50"
                  }`}
                >
                  {/* Unread indicator */}
                  {!item.is_read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                  )}

                  <div className="p-4 pl-5 flex gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-sm`}
                    >
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {label}
                            </span>
                            {!item.is_read && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 text-sm leading-snug truncate">
                            {item.title}
                          </p>
                          <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {timeAgo(item.created_at)}
                          </span>
                          {item.action_url && (
                            <Link
                              href={item.action_url}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold group-hover:underline"
                            >
                              Lihat <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-slate-500 px-3">
              {currentPage} / {meta.last_page}
            </span>
            <button
              disabled={currentPage === meta.last_page}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}

        {/* Total count */}
        {meta && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Menampilkan {items.length} dari {meta.total} notifikasi
          </p>
        )}
      </div>
    </div>
  );
}
