"use client";
import {
  BriefcaseBusiness,
  CheckCheck,
  CircleAlert,
  Download,
  Edit,
  Eye,
  FileText,
  Loader2,
  MessageCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import NotFoundComponent from "@/components/NotFoundComponent";
import TabsComponent from "@/components/TabsCompenent";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";
import Loader from "@/components/loader";
import { alertError, alertSuccess } from "@/libs/alert";

interface Lamaran {
  id: number;
  name: string;
  school_name: string;
  jurusan: string;
  status: "Pengajuan" | "Ditolak" | "Test" | "Diterima";
  application: File | null;
  color?: string;
}

interface InternshipApplication {
  id: string;
  student: {
    name: string;
    phone_number?: string | null;
  };
  user?: {
    email?: string;
    whatsapp_number?: string | null;
  };
  school: {
    name: string;
  };
  status: string;
  read_at?: string | null;
  is_read?: boolean;
  major: string | null;
  curriculum_vitae: {
    id: string;
    name: string;
  };
}

type ActiveTab = "Semua" | "Diterima" | "Pengajuan" | "Ditolak";

const lamaranPage: React.FC = () => {
  const router = useRouter();
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 1000);
  const [internshipApplications, setInternshipApplications] = useState<
    InternshipApplication[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);
  const [downloadingCvId, setDownloadingCvId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const tabs: ActiveTab[] = ["Semua", "Diterima", "Pengajuan", "Ditolak"];
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [isReload, setIsReload] = useState<boolean>(false);

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const fetchInternshipAplication = async () => {
    if (isLoading) return;
    setIsLoading(true);

    let status: string | undefined = undefined;
    switch (activeTab) {
      case "Diterima":
        status = "accepted";
        break;
      case "Pengajuan":
        status = "in_progress";
        break;
      case "Ditolak":
        status = "rejected";
        break;
    }

    try {
      const response = await API.get(ENDPOINTS.INTERNSHIP_APPLICATIONS, {
        params: {
          search: inputSearch,
          limit: 10,
          page: pages.activePages,
          status: status,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log(response.data.data);
      setInternshipApplications(response.data.data);
      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = (status: string) => {
    switch (status) {
      case "in_progress":
        return "Pengajuan";
      case "accepted":
        return "Diterima";
      case "rejected":
        return "Ditolak";
    }
  };

  const changeStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "text-green-500";
      case "accepted":
        return "text-accent";
      case "rejected":
        return "text-red-500";
    }
  };

  const handleChangePage = (selectedPage: number) => {
    setPages((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };

  useEffect(() => {
    if (inputSearch.trim() !== "") {
      if (!debouncedQuery) {
        setInternshipApplications([]);
        return;
      }
    }

    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchInternshipAplication();
  }, [pages.activePages, isReload]);

  const handleMarkAsRead = async (applicationId: string) => {
    if (markingReadId) return;
    setMarkingReadId(applicationId);
    try {
      await API.patch(
        `${ENDPOINTS.INTERNSHIP_APPLICATIONS}/${applicationId}/mark-as-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      setInternshipApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, is_read: true, read_at: new Date().toISOString() }
            : app
        )
      );

      await alertSuccess("Lamaran berhasil ditandai sudah dibaca dan pelamar telah diberi tahu!");
    } catch (error: any) {
      console.error("Error marking application as read:", error);
      await alertError(error.response?.data?.errors || "Gagal menandai lamaran sudah dibaca.");
    } finally {
      setMarkingReadId(null);
    }
  };

  const getWhatsAppLink = (phone: string | null | undefined, name: string) => {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }
    const msg = encodeURIComponent(
      `Halo ${name}, kami telah meninjau lamaran magang Anda di PRAKERIN.ID dan ingin mendiskusikan tahapan seleksi selanjutnya.`
    );
    return `https://wa.me/${cleaned}?text=${msg}`;
  };

  const handleDownload = async (cvId: string) => {
    if (downloadingCvId) return;
    setDownloadingCvId(cvId);
    setDownloadProgress(0);
    try {
      const response = await API.get(
        `${ENDPOINTS.CURRICULUM_VITAE}/${cvId}/download`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setDownloadProgress(percent);
            } else {
              setDownloadProgress((prev) => Math.min(prev + 25, 90));
            }
          },
        }
      );
      setDownloadProgress(100);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const nameCv = internshipApplications.find((application) => {
        return application.curriculum_vitae.id === cvId;
      });

      link.setAttribute("download", `${nameCv?.curriculum_vitae.name || "CV"}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      await alertSuccess("CV berhasil diunduh!");
    } catch (error: any) {
      console.error("Error downloading CV:", error.response?.data?.errors || error.message);
      await alertError("Gagal mengunduh CV.");
    } finally {
      setTimeout(() => {
        setDownloadingCvId(null);
        setDownloadProgress(0);
      }, 600);
    }
  };

  return (
    <main className="p-4 sm:p-6 min-h-screen">
      {/* Breadcrumb */}
      <h1 className="text-accent-dark text-xs sm:text-sm mb-3 sm:mb-5 break-words">
        Lamaran Magang
      </h1>

      {/* Page Title */}
      <div className="flex items-center mb-6 sm:mb-8 gap-2 font-extrabold text-accent">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl">Lamaran Magang</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        <TabsComponent
          data={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Search Bar */}
      <div className="rounded-t-2xl bg-accent">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4 sm:w-5 sm:h-5"
          />
          <input
            type="text"
            placeholder="Cari lamaran..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full bg-accent text-white placeholder-white/70 text-sm sm:text-base pl-10 pr-4 py-2.5 sm:py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-b-2xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Siswa/Mahasiswa
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asal Sekolah
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jurusan
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CV
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {internshipApplications && !isLoading ? (
                internshipApplications.map((application, index) => {
                  const phone =
                    application.student?.phone_number ||
                    application.user?.whatsapp_number;
                  const waLink = getWhatsAppLink(phone, application.student.name);

                  return (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1 + (pages.activePages - 1) * 10}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 break-words max-w-[200px]">
                        {application.student.name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 break-words max-w-[200px]">
                        {application.school.name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                        {application.major ?? "-"}
                      </td>
                      <td
                        className={`px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium ${changeStatusColor(
                          application.status
                        )}`}
                      >
                        {changeStatus(application.status)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                        {downloadingCvId === application.curriculum_vitae.id ? (
                          <div className="relative overflow-hidden bg-gray-200 text-gray-800 rounded-full py-1.5 px-3 text-xs font-semibold flex items-center justify-center min-w-[90px] border border-gray-300">
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-green-500 transition-all duration-150"
                              style={{ width: `${downloadProgress}%` }}
                            />
                            <span className="relative z-10 text-white font-medium flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {downloadProgress}%
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(application.curriculum_vitae.id)
                            }
                            className="bg-green-500 text-white rounded-full py-1.5 px-3 text-xs cursor-pointer hover:bg-green-600 transition-colors shadow-xs flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Unduh
                          </button>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {application.is_read || application.read_at ? (
                            <>
                              <span
                                title={`Sudah dibaca${
                                  application.read_at
                                    ? ` pada ${new Date(
                                        application.read_at
                                      ).toLocaleDateString("id-ID")}`
                                    : ""
                                }`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                              >
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Sudah Dibaca</span>
                              </span>

                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors shadow-xs"
                                  title="Chat pelamar via WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(application.id)}
                              disabled={markingReadId === application.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                              title="Tandai telah dibaca dan beri tahu pelamar"
                            >
                              {markingReadId === application.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-amber-600" />
                              )}
                              <span>Tandai Dibaca</span>
                            </button>
                          )}

                          <Link
                            href={`/dashboard/industry/lamaran/${application.id}`}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Detail Lamaran"
                          >
                            <CircleAlert size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    <Loader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {internshipApplications && !isLoading ? (
            internshipApplications.map((application, index) => {
              const phone =
                application.student?.phone_number ||
                application.user?.whatsapp_number;
              const waLink = getWhatsAppLink(phone, application.student.name);

              return (
                <div
                  key={application.id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm break-words">
                        {application.student.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 break-words">
                        {application.school.name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex-shrink-0">
                      #{index + 1 + (pages.activePages - 1) * 10}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Jurusan:</span>
                      <span className="text-xs text-gray-900">
                        {application.major ?? "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      <span
                        className={`text-xs font-medium ${changeStatusColor(
                          application.status
                        )}`}
                      >
                        {changeStatus(application.status)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {downloadingCvId === application.curriculum_vitae.id ? (
                      <div className="relative overflow-hidden bg-gray-200 text-gray-800 rounded-lg py-1.5 px-3 text-xs font-semibold flex items-center justify-center min-w-[90px] border border-gray-300">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-green-500 transition-all duration-150"
                          style={{ width: `${downloadProgress}%` }}
                        />
                        <span className="relative z-10 text-white font-medium flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" />
                          {downloadProgress}%
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleDownload(application.curriculum_vitae.id)
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download size={12} />
                        <span>Unduh CV</span>
                      </button>
                    )}

                    {application.is_read || application.read_at ? (
                      <>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <CheckCheck size={12} className="text-emerald-600" />
                          <span>Sudah Dibaca</span>
                        </span>

                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <MessageCircle size={12} className="text-green-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(application.id)}
                        disabled={markingReadId === application.id}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {markingReadId === application.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Eye size={12} />
                        )}
                        <span>Tandai Dibaca</span>
                      </button>
                    )}

                    <Link
                      href={`/dashboard/industry/lamaran/${application.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <CircleAlert size={12} />
                      <span>Detail</span>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center">
              <Loader />
            </div>
          )}
        </div>

        {/* Empty State */}
        {internshipApplications.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <NotFoundComponent text="Belum ada orang yang melamar." />
          </div>
        )}
      </div>

      {/* Pagination */}
      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={isLoading}
      />
    </main>
  );
};

export default lamaranPage;