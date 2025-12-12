"use client";
import { Check, Mail, Pencil, Search, Trash, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";
import Link from "next/link";
import { API, ENDPOINTS } from "../../../../../utils/config";
import { useRouter } from "next/navigation";

type ActiveTab = "Semua" | "Sekolah" | "Perusahaan" | "Siswa / Mahasiswa";

interface Pages {
  activePages: number;
  pages: number;
}

interface Data {
  username: string;
  id: string;
  email: string;
  role: string;
  company: {
    name: string;
    is_verified: boolean;
  };
}

const Users: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 1000);

  const tabs = ["Semua" , "Sekolah" , "Perusahaan" , "Siswa / Mahasiswa"];

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [data, setData] = useState<Data[]>([]);

  const [isReload, setIsReload] = useState(false);

  const router = useRouter();

  const handleChangePage = (selectedPage: number) => {
    setPages((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let roles: string | undefined = undefined;
      switch (activeTab) {
        case "Sekolah":
          roles = "school";
          break;
        case "Perusahaan":
          roles = "company";
          break;
        case "Siswa / Mahasiswa":
          roles = "student";
          break;
        default:
          break;
      }

      const response = await API.get(ENDPOINTS.USERS, {
        params: {
          role: roles,
          // is_verified: roles,
          search: inputSearch,
          limit: 10,
          page: pages.activePages,
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
      `Apakah anda yakin ingin menghapus perusahaan "${name}"?`
    );
    if (!confirm) return;

    try {
      await API.delete(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess(`Perusahaan ${name} berhasil dihapus!`);
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
      `Apakah anda yakin ingin menerima perusahaan "${name}"?`
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
      await alertSuccess(`Perusahaan ${name} berhasil diterima!`);
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };

  useEffect(() => {
    if (inputSearch.trim() !== "") {
      if (!debouncedQuery) {
        setData([]);
        return;
      }
    }

    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchData();
  }, [pages.activePages, isReload]);
  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Daftar User</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <UsersRound className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar User</h2>
        </div>
      </div>
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

      {/* Task Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari User..."
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
                  Username
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Email
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Role
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {data && loading !== true ? (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800">{item.username}</td>
                    <td className="p-4 text-gray-800">{item.email}</td>
                    <td className="p-4 text-gray-800">{item.role}</td>
                    <td className="p-4 flex gap-2">
                      
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer" onClick={() => router.push(`users/${item.id}`)}><Pencil className="w-4 h-4" /></button>
                      <button
                        onClick={() =>
                          handleDelete(item.id, item.company?.name)
                        }
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
            <NotFoundComponent text="Tidak ada perusahaan yang ditemukan." />
          </div>
        )}
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
export default Users;
