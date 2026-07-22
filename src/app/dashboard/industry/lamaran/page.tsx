"use client";
import {
  BriefcaseBusiness,
  CircleAlert,
  Download,
  Edit,
  Eye,
  FileText,
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
import page from "@/app/hubungi-cs/page";
import Loader from "@/components/loader";

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
  };
  school: {
    name: string;
  };
  status: string;
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

  const handleDownload = async (cvId: string) => {
    console.log("Downloading CV with ID:", cvId);
    try {
      const response = await API.get(
        `${ENDPOINTS.CURRICULUM_VITAE}/${cvId}/download`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const nameCv = internshipApplications.find((application) => {
        return application.curriculum_vitae.id === cvId;
      });

      link.setAttribute("download", `${nameCv?.curriculum_vitae.name}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading CV:", error.response?.data?.errors || error.message);
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
          <table className="w-full min-w-[800px]">
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
                internshipApplications.map((application, index) => (
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
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(application.curriculum_vitae.id)
                        }
                        className="bg-green-500 text-white rounded-full py-1.5 px-3 text-xs cursor-pointer hover:bg-green-600 transition-colors"
                      >
                        Unduh
                      </button>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/dashboard/industry/lamaran/${application.id}`}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer inline-block p-1"
                      >
                        <CircleAlert size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
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
            internshipApplications.map((application, index) => (
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
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleDownload(application.curriculum_vitae.id)
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download size={12} />
                    <span>Unduh CV</span>
                  </button>
                  <Link
                    href={`/dashboard/industry/lamaran/${application.id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <CircleAlert size={12} />
                    <span>Detail</span>
                  </Link>
                </div>
              </div>
            ))
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