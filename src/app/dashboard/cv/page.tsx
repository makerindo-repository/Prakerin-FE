"use client";
import {
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { alertConfirm, alertSuccess } from "@/libs/alert";
import Link from "next/link";
import { Pages } from "@/models/pagination";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";
import NotFoundComponent from "@/components/NotFoundComponent";

interface CVItem {
  id: string;
  name: string;
}

const CvPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedQuery = useDebounce(searchTerm, 1000);
  const router = useRouter();
  const [cvList, setCvList] = useState<CVItem[]>([]);
  const [page, setPage] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });
  const [loading, setLoading] = useState<boolean>(false);

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
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        // Bisa static atau ambil dari backend Content-Disposition
        const nameCv = cvList.find((cv) => {
          return cv.id === cvId;
        });

        link.setAttribute("download", `${nameCv?.name}.pdf`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error("Error downloading CV:", error.response?.data?.errors || error.message);
    }
  };

  const handlePreview = async (cvId: string) => {
    try {
      const response = await API.get(
        `${ENDPOINTS.CURRICULUM_VITAE}/${cvId}/preview`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);

        // Buka di tab baru
        window.open(fileURL, "_blank");
      }
    } catch (error: any) {
      console.error("Error previewing CV:", error.response?.data || error);
    }
  };

  const fetchCv = async (selectedPage = page.activePages) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await API.get(`${ENDPOINTS.CURRICULUM_VITAE}`, {
        params: {
          page: selectedPage,
          limit: 10,
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        setCvList(response.data.data);
        setPage({
          activePages: selectedPage,
          pages: response.data.last_page,
        });
      }
    } catch (error: any) {
      console.error("Error fetching CVs:", error.response?.data?.errors || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cvId: string) => {
    const confirm = await alertConfirm(
      "Apakah Anda yakin ingin menghapus CV ini?"
    );
    if (!confirm) return;
    console.log("Deleting CV with ID:", cvId);
    try {
      const response = await API.delete(
        `${ENDPOINTS.CURRICULUM_VITAE}/${cvId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      if (response.status === 200) {
        setCvList((prev) => prev.filter((cv) => cv.id !== cvId));
        await alertSuccess("Berhasil menghapus CV");
      }
    } catch (error: any) {
      console.error("Error deleting CV:", error.response?.data?.errors || error.message);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      if (!debouncedQuery) {
        setCvList([]);
        return;
      }
    }

    fetchCv();
  }, [debouncedQuery, page.activePages]);

  const handlePageChange = (selectedPage: number) => {
    setPage((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };

  return (
    <main className="flex-1 p-4 lg:p-6">
      <h1 className="text-accent-dark text-sm mb-5">Curiculum Vitae</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Curiculum Vitae</h2>
        </div>
      </div>

      {/* Pages Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mb-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Link
            href="/dashboard/cv/cv-pintar"
            className="bg-vip hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center "
          >
            <Sparkles size={16} className="mr-1.5 text-amber-300 animate-pulse" />
            Membuat CV
          </Link>
          <button
            onClick={() => router.push("cv/create")}
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer"
          >
            <Plus size={16} className="mr-1" />
            Tambah CV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-t-2xl  bg-accent">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari CV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-white placeholder-teal-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>

      {/* CV Table */}
      <div className="bg-white rounded-b-2xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama CV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unduh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lihat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cvList && loading !== true ? (
                cvList.map((cv, index) => (
                  <tr key={cv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cv.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDownload(cv.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer"
                      >
                        Unduh
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePreview(cv.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer"
                      >
                        Lihat
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/cv/${cv.id}/ubah`}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(cv.id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <LoaderData />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {cvList && loading !== true ? (
            cvList.map((cv, index) => (
              <div key={cv.id} className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{cv.name}</h3>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => handleDownload(cv.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center"
                  >
                    <Download size={12} className="mr-1" />
                    Unduh
                  </button>
                  <button
                    onClick={() => handlePreview(cv.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center"
                  >
                    <Eye size={12} className="mr-1" />
                    Lihat
                  </button>
                </div>

                <div className="flex justify-end space-x-2">
                  <Link
                    href={`/dashboard/cv/${cv.id}/ubah`}
                    className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(cv.id)}
                    className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <LoaderData />
          )}
        </div>

        {loading !== true && cvList.length === 0 && (
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Tidak ada curiculum vitae yang ditemukan." />
          </div>
        )}
      </div>
      <PaginationComponent
        activePage={page.activePages}
        totalPages={page.pages}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </main>
  );
};

export default CvPage;
