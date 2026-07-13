"use client";
import {
  CheckSquare,
  CirclePlus,
  ClipboardCheck,
  HelpCircle,
  Info,
  Search,
  Pencil,
  Trash,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import NotFoundComponent from "@/components/NotFoundComponent";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import { suppressErrorForSuperAdmin } from "@/libs/errorHandler";
import TabsComponent from "@/components/TabsCompenent";
import Loader from "@/components/loader";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";

interface Tes {
  id: string;
  title: string;
  link: string;
  description: string;
  type: Type;
}
interface FormError {
  title?: string;
  link?: string;
  description?: string;
  type?: string;
}

type ActiveTab = "Semua" | "Praktik" | "Teori" | "Lainnya";
type Type = "theory" | "practice" | "";

const TestListPage: React.FC = () => {
  const tabs: ActiveTab[] = ["Semua", "Praktik", "Teori", "Lainnya"];

  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [inputSearch, setInputSearch] = useState("");
  const [tests, setTests] = useState<Tes[]>([]);
  const [formData, setFormData] = useState<Tes>({
    id: "",
    title: "",
    link: "",
    description: "",
    type: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<FormError>({});

  const debouncedQuery = useDebounce(inputSearch, 1000);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReload, setIsReload] = useState<boolean>(false);

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const fetchTests = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let filteredStatus: undefined | string = "all";
      switch (activeTab) {
        case "Semua":
          filteredStatus = undefined;
          break;
        case "Praktik":
          filteredStatus = "practice";
          break;
        case "Teori":
          filteredStatus = "theory";
          break;
        case "Lainnya":
          filteredStatus = "other";
          break;
      }

      const response = await API.get(ENDPOINTS.TESTS, {
        params: {
          type: filteredStatus,
          search: inputSearch,
          limit: 10,
          page: pages.activePages,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      setTests(response.data.data);
      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError({});

    try {
      await suppressErrorForSuperAdmin(() => API.patch(`${ENDPOINTS.TESTS}/${editingId}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }), { showSuccessMessage: true, successMessage: "Tes berhasil diubah!" });

      await fetchTests();
      setFormData({
        id: "",
        title: "",
        link: "",
        description: "",
        type: "",
      });

      setIsModalOpen(false);
      setEditingId(null);
      await alertSuccess("Tes berhasil diubah!");
    } catch (error: AxiosError | unknown) {
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
      `Apakah anda yakin ingin menghapus Tes "${name}"?`
    );
    if (!confirm) return;

    try {
      await suppressErrorForSuperAdmin(() => API.delete(`${ENDPOINTS.TESTS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }), { showSuccessMessage: true, successMessage: `Tes ${name} berhasil dihapus!` });
      if (tests.length == 1) {
        setPages({ ...pages, activePages: pages.activePages - 1 });
      } else {
        await fetchTests();
      }
      await alertSuccess(`Tes ${name} berhasil dihapus!`);
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.formError;
        await alertError(responseError);
      }
      console.error(error);
    }
  };

  const getType = (type: string) => {
    switch (type) {
      case "practice":
        return "Praktik";
      case "theory":
        return "Teori";
      case "other":
        return "Lainnya";
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
        setTests([]);
        return;
      }
    }

    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchTests();
  }, [pages.activePages, isReload]);

  return (
    <main className="p-4 sm:p-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-accent-dark text-xs sm:text-sm mb-3 sm:mb-5">Tes</h1>
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl mt-2">Tes</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit gap-2">
            <TabsComponent
              data={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
        {Cookies.get("authorization") === "company" && (
          <div className="flex justify-end mb-4 sm:mb-6">
            <Link
              href="/dashboard/tes/tambah"
              className="text-white bg-accent rounded-xl p-2.5 px-4 sm:p-3 sm:px-5 flex items-center space-x-2 text-sm sm:text-base"
            >
              <CirclePlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Tambah Tes</span>
            </Link>
          </div>
        )}
      </div>

      {/* Tes Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4 sm:w-5 sm:h-5 z-10" />
          <input
            type="text"
            placeholder="Cari tes..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full bg-accent text-white text-sm sm:text-base pl-10 pr-4 py-2.5 sm:py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-teal-200 placeholder-white/70"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-2 sm:p-3 font-medium text-gray-600 uppercase text-xs sm:text-sm">
                  No
                </th>
                <th className="text-left p-2 sm:p-3 font-medium text-gray-600 uppercase text-xs sm:text-sm">
                  Judul Tes
                </th>
                <th className="text-left p-2 sm:p-3 font-medium text-gray-600 uppercase text-xs sm:text-sm">
                  Tautan Tes
                </th>
                <th className="text-left p-2 sm:p-3 font-medium text-gray-600 uppercase text-xs sm:text-sm">
                  Deskripsi
                </th>
                <th className="text-left p-2 sm:p-3 font-medium text-gray-600 uppercase text-xs sm:text-sm">
                  Tipe
                </th>
                <th className="text-left p-2 sm:p-3 font-medium text-gray-600 uppercase text-xs sm:text-sm">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {tests && !isLoading ? (
                tests.map((test, index) => (
                  <tr key={test.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 sm:p-4 text-gray-800 text-sm">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-2 sm:p-4 text-gray-800 text-sm break-words max-w-[200px]">
                      {test.title}
                    </td>
                    <td className="p-2 sm:p-4 text-sm break-all max-w-[200px]">
                      <a 
                        href={test.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {test.link}
                      </a>
                    </td>
                    <td className="p-2 sm:p-4 text-sm break-words max-w-[250px]">
                      {test.description}
                    </td>
                    <td className="p-2 sm:p-4 text-sm whitespace-nowrap">
                      {getType(test.type)}
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => {
                            setEditingId(test.id);
                            setFormData({
                              id: test.id,
                              title: test.title,
                              link: test.link,
                              description: test.description,
                              type: test.type,
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id, test.title)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    <Loader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50 overflow-y-auto">
            <div className="bg-white text-black p-4 sm:p-6 rounded-lg flex flex-col gap-3 sm:gap-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto">
              <div className="rounded-lg justify-between flex items-start gap-2">
                <h3 className="text-base sm:text-lg font-semibold">
                  {editingId ? "Ubah" : "Tambah"} Tes
                </h3>
                <button
                  disabled={isSubmitting} 
                  
                  onClick={() => {
                    if (editingId) {
                      setEditingId(null);
                      setFormData({
                        id: "",
                        title: "",
                        link: "",
                        description: "",
                        type: "",
                      });
                    }
                    setIsModalOpen(false);
                  }}
                  className="flex-shrink-0"
                >
                  <X className={`w-6 h-6 sm:w-8 sm:h-8 text-red-500 hover:text-red-600 ${
                    isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`} />
                </button>
              </div>

              <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Judul Tes
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50  ${
                      formError.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Masukkan judul tes"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  {formError.title && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {formError.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Tipe Tes
                  </label>
                  <select
                    value={formData.type}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as Type })
                    }
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                      formError.type ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih jenis tes</option>
                    <option value="theory">Tes Teori</option>
                    <option value="practice">Tes Praktik</option>
                    <option value="other">Tes Lainnya</option>
                  </select>
                  {formError.type && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {formError.type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Link Tes
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                      formError.link ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Masukkan link tes"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  />
                  {formError.link && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {formError.link}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    value={formData.description}
                    placeholder="Masukkan deskripsi tentang tes"
                    className={`resize-none w-full h-32 sm:h-40 px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                      formError.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  ></textarea>
                  {formError.description && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">
                      {formError.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (editingId) {
                        setEditingId(null);
                        setFormData({
                          id: "",
                          title: "",
                          link: "",
                          description: "",
                          type: "",
                        });
                      }
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-accent text-white px-4 py-2 text-sm sm:text-base rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent-hover"
                  >
                    {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tests.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-2">
            <NotFoundComponent text="Anda belum memiliki tes." />
          </div>
        )}
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        loading={isLoading}
        onPageChange={handleChangePage}
        totalPages={pages.pages}
      />
    </main>
  );
};
export default TestListPage;