"use client";
import { Check, CirclePlus, GraduationCap, Map, Pencil, Search, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";

type ActiveTab = "Semua" | "Diterima" | "Belum Diterima";

interface FormData {
  name: string;
  level: string;
}

interface FormError {
  name?: string;
  level?: string;
}

interface Pages {
  activePages: number;
  pages: number;
}

interface Data {
  id: string;
  name: string;
  level: string;
  is_accepted: boolean;
}

const JurusanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 1000);

  const tabs = ["Semua", "Diterima", "Belum Diterima"];

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [majors, setProvinces] = useState<Data[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({ name: "", level: "" });
  const [formError, setFormError] = useState<FormError>({});

  const [editingId, setEditingId] = useState<string | null>(null);

  const [isReload, setIsReload] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

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
      let isAccepted: boolean | undefined = undefined;
      switch (activeTab) {
        case "Diterima":
          isAccepted = true;
          break;
        case "Belum Diterima":
          isAccepted = false;
          break;
      }

      const response = await API.get(ENDPOINTS.MAJORS, {
        params: {
          is_accepted: isAccepted,
          search: inputSearch,
          limit: 10,
          page: pages.activePages,
          level: selectedLevel || undefined,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log(response.data.data);
      setProvinces(response.data.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError({});
    try {
      if (editingId) {
        await API.patch(`${ENDPOINTS.MAJORS}/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
      } else {
        await API.post(
          ENDPOINTS.MAJORS,
          {
            ...formData,
            is_accepted: true,
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        );
      }

      await fetchData();
      setFormData({ name: "", level: "" });

      if (editingId) {
        setIsModalOpen(false);
        setEditingId(null);
        await alertSuccess("Jurusan berhasil diubah!");
      } else {
        await alertSuccess("Jurusan berhasil ditambahkan!", 1500);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setFormError(responseError);
        }
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = await alertConfirm(
      `Apakah anda yakin ingin menghapus jurusan "${name}"?`
    );
    if (!confirm) return;

    try {
      await API.delete(`${ENDPOINTS.MAJORS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess(`Jurusan ${name} berhasil dihapus!`);
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
      `Apakah anda yakin ingin menerima jurusan "${name}"?`
    );
    if (!confirm) return;
    try {
      await API.patch(
        `${ENDPOINTS.MAJORS}/${id}`,
        {
          is_accepted: true,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      await fetchData();
      await alertSuccess(`Jurusan ${name} berhasil diterima!`);
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
        setProvinces([]);
        return;
      }
    }

    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery, selectedLevel]);

  useEffect(() => {
    fetchData();
  }, [pages.activePages, isReload]);
  
  return (
    <main className="p-4 sm:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-accent-dark text-sm mb-5">Jurusan</h1>
        <div className="mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <GraduationCap className="w-5 h-5" />
            <h2 className="text-2xl mt-2">Jurusan</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as ActiveTab)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer ${
                activeTab === tab
                  ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
                  : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter and Add Button - Now Responsive */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex flex-col gap-2 bg-white w-full sm:w-auto sm:min-w-[200px] p-4 rounded-xl shadow-sm">
            <label htmlFor="select-major" className="font-medium text-sm">
              Pilih Level
            </label>
            <select
              id="select-major"
              value={selectedLevel || ""}
              onChange={(e) => setSelectedLevel(e.target.value || null)}
              className="border p-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            >
              <option value="">Semua</option>
              <option value="smk">SMK</option>
              <option value="college">Kuliah</option>
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white bg-accent hover:bg-accent-hover rounded-xl p-3 px-5 flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto text-sm sm:text-base"
          >
            <CirclePlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Tambah Jurusan</span>
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Cari Jurusan..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full bg-accent text-white pl-9 sm:pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-transparent transition-colors text-sm sm:text-base placeholder:text-gray-200"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600 text-sm">No</th>
                <th className="text-left p-3 font-medium text-gray-600 text-sm">
                  Nama
                </th>
                <th className="text-left p-3 font-medium text-gray-600 text-sm">
                  Status
                </th>
                <th className="text-left p-3 font-medium text-gray-600 text-sm">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {majors && loading !== true ? (
                majors.map((major, index) => (
                  <tr key={major.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800 text-sm">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800 text-sm">{major.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          major.is_accepted
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {major.is_accepted ? "Diterima" : "Belum Diterima"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {!major.is_accepted && (
                          <button
                            onClick={() => handleAccept(major.id, major.name)}
                            className="p-2 text-green-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingId(major.id);
                            setFormData({
                              name: major.name,
                              level: major.level,
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(major.id, major.name)}
                          className="p-2 text-red-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    <LoaderData />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {majors.length === 0 && loading === false && (
          <div className="text-center py-12 col-span-2">
            <NotFoundComponent text="Tidak ada jurusan yang ditemukan." />
          </div>
        )}
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={loading}
      />

      {/* Modal - Now Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center h-screen bg-black/25 z-50 p-4">
          <div className="bg-white text-black p-4 sm:p-6 rounded-lg flex flex-col gap-2 w-full max-w-md sm:max-w-lg">
            <div className="rounded-lg justify-between flex">
              <h3 className="text-base sm:text-lg font-semibold">
                {editingId ? "Ubah" : "Tambah"} Jurusan
              </h3>
              <X
                onClick={() => {
                  if(isSubmitting) return;
                  if (editingId) {
                    setEditingId(null);
                    setFormData({ name: "", level: "" });
                  }
                  setIsModalOpen(false);
                  setFormError({});
                }}
                className={`w-6 h-6 sm:w-8 sm:h-8  text-red-500 hover:text-red-600 ${
                  isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              />
            </div>
            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="level" className="text-sm sm:text-base">Pilih Tingkat</label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  id="level"
                  disabled={isSubmitting}
                  className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm  disabled:opacity-50 disabled:cursor-not-allowed${
                    formError.level ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Pilih tingkat</option>
                  <option value="smk">SMK</option>
                  <option value="college">Kuliah</option>
                </select>
                {formError.level && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">{formError.level}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="major" className="text-sm sm:text-base">Nama Jurusan</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  id="major"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Masukkan nama jurusan"
                  className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    formError.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formError.name && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">{formError.name}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent-hover text-sm sm:text-base w-full sm:w-auto"
                >
                  {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default JurusanPage;