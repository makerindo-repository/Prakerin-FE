"use client";
import {
  Check,
  CirclePlus,
  Mail,
  Map,
  Pencil,
  Search,
  Trash,
  X,
  Eye,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";
import { API, ENDPOINTS } from "@/utils/config";
import Link from "next/link";
import ImportInstitutionModal from "./ImportInstitutionModal";

type ActiveTab = "Semua" | "Diterima" | "Belum Diterima";

interface Pages {
  activePages: number;
  pages: number;
}

interface Data {
  id: string;
  email: string;
  school: {
    id: string;
    name: string;
    is_verified: boolean;
  };
}

const AdminUniversitas: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 500);

  const tabs = ["Semua", "Diterima", "Belum Diterima"];

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [data, setData] = useState<Data[]>([]);

  const handleChangePage = (selectedPage: number) => {
    setPages((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      let isAccepted: boolean | undefined = undefined;
      switch (activeTab) {
        case "Diterima":
          isAccepted = true;
          break;
        case "Belum Diterima":
          isAccepted = false;
          break;
      }

      const response = await API.get(ENDPOINTS.USERS, {
        params: {
          role: "school",
          is_verified: isAccepted,
          search: debouncedQuery,
          limit: 10,
          page: pages.activePages,
          is_school: false, // Data Universitas = khusus institusi type "university"
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log(response.data.data);
      setData(response.data.data);
      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = await alertConfirm(
      `Apakah anda yakin ingin menghapus universitas "${name}"?`
    );
    if (!confirm) return;

    try {
      await API.delete(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess(`Universitas ${name} berhasil dihapus!`);
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };

  const handleAccept = async (id: string, name: string) => {
    const confirm = await alertConfirm(
      `Apakah anda yakin ingin menerima universitas "${name}"?`
    );
    if (!confirm) return;
    try {
      await API.patch(
        `${ENDPOINTS.USERS}/${id}`,
        {
          is_verified: true,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      await fetchData();
      await alertSuccess(`Universitas ${name} berhasil diterima!`);
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };

  useEffect(() => {
    setPages((prev) => ({ ...prev, activePages: 1 }));
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchData();
  }, [pages.activePages, activeTab, debouncedQuery]);
  return (
    <>

        {/* Filter and Add Button - Now Responsive */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-3 sm:gap-4 items-stretch sm:items-center">

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as ActiveTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer  ${
                  activeTab === tab
                    ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
                    : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white shadow-sm hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
        </div>
      

      {/* Task Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari universitas..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full bg-accent text-white pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-transparent transition-colors"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  No
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Nama
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Email
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {data && loading !== true ? (
                data.map((item, index) => (
                  console.log(item),
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800">{item.school?.name}</td>
                    <td className="p-4 text-gray-800">{item.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.school?.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.school?.is_verified
                          ? "Diterima"
                          : "Belum Diterima"}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {!item.school?.is_verified && (
                        <>
                          <button
                            onClick={() =>
                              handleAccept(item.id, item.school?.name)
                            }
                            className="p-2 text-green-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <Link
                            href={`mailto:${item.email}`}
                            className="p-2 text-accent hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                          >
                            <Mail className="w-4 h-4" />
                          </Link>
                        </>
                      )}

                      {/* View Students */}
                      {item.school?.id && (
                        <Link
                          href={`/dashboard/sekolah/${item.school.id}/murid`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}

                      <button
                        onClick={() => handleDelete(item.id, item.school?.name)}
                        className="p-2 text-red-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    <LoaderData />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length === 0 && loading === false && (
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Tidak ada universitas yang ditemukan." />
          </div>
        )}
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={loading}
      />

      <ImportInstitutionModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="university"
        onImported={fetchData}
      />
    </>
  );
};
export default AdminUniversitas;