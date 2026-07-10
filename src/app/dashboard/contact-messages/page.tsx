"use client";
import { AlertCircle, Clock, Eye, Mail, MessageSquare, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { alertError } from "@/libs/alert";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";
import Link from "next/link";
import { API, ENDPOINTS } from "@/utils/config";

interface Pages {
  activePages: number;
  pages: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  category: "general" | "bug" | "feedback";
  subject: string;
  status: "new" | "read" | "replied";
  created_at: string;
  replies_count: number;
}

const ContactMessagesAdminPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [inputSearch, setInputSearch] = useState<string>("");
  const debouncedSearch = useDebounce(inputSearch, 800);

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const handleChangePage = (selectedPage: number) => {
    setPages((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/v1/contacts", {
        params: {
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          search: debouncedSearch || undefined,
          page: pages.activePages,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      setMessages(response.data.data || []);
      setPages({
        activePages: response.data.current_page || 1,
        pages: response.data.last_page || 1,
      });
    } catch (error) {
      console.error("Error fetching admin contact messages:", error);
      await alertError("Gagal mengambil data pesan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPages((prev) => ({ ...prev, activePages: 1 }));
  }, [statusFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    fetchMessages();
  }, [pages.activePages, statusFilter, categoryFilter, debouncedSearch]);

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

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Master Data -&gt; Contact Messages</h1>
      
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <Mail className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar Pesan Hubungi Kami</h2>
        </div>
      </div>

      {/* Filters card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama, email, atau subjek..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-accent text-sm"
          >
            <option value="">Semua Status</option>
            <option value="new">Baru</option>
            <option value="read">Dibaca</option>
            <option value="replied">Dibalas</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-accent text-sm"
          >
            <option value="">Semua Kategori</option>
            <option value="general">Umum</option>
            <option value="bug">Bug</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-12">
                  No
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Pengirim
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Subjek & Pesan
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-28">
                  Kategori
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-28">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-28">
                  Tanggal
                </th>
                <th className="text-center p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <LoaderData />
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Tidak ada pesan yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                messages.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-gray-500 text-sm">
                      {index + 1 + (pages.activePages - 1) * 20}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.email}</div>
                    </td>
                    <td className="p-4 max-w-xs md:max-w-md lg:max-w-lg">
                      <div className="text-sm font-medium text-gray-800 truncate">{item.subject}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MessageSquare size={12} />
                        <span>{item.replies_count} balasan</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(item.category)}`}>
                        {getCategoryName(item.category)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                        {getStatusName(item.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/dashboard/contact-messages/${item.id}`}
                        className="p-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Detail & Balas"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={loading}
      />
    </main>
  );
};

export default ContactMessagesAdminPage;
