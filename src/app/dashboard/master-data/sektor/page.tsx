"use client";
import {
  BriefcaseBusiness,
  Check,
  CirclePlus,
  IdCard,
  Map,
  Pencil,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { Province } from "@/models/province";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";

type ActiveTab = "Semua" | "Diterima" | "Belum Diterima";

interface FormData {
  name: string;
}

interface FormError {
  name?: string;
}

interface Pages {
  activePages: number;
  pages: number;
}

const SektorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 500);

  const tabs = ["Semua", "Diterima", "Belum Diterima"];

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [roles, setRoles] = useState<Province[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({ name: "" });
  const [formError, setFormError] = useState<FormError>({});

  const [editingId, setEditingId] = useState<string | null>(null);

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

      const response = await API.get(ENDPOINTS.SECTORS, {
        params: {
          is_accepted: isAccepted,
          search: debouncedQuery,
          limit: 10,
          page: pages.activePages,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log(response.data.data);
      setRoles(response.data.data);
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
        await API.patch(`${ENDPOINTS.SECTORS}/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
      } else {
        await API.post(
          ENDPOINTS.SECTORS,
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
      setFormData({ name: "" });

      if (editingId) {
        setIsModalOpen(false);
        setEditingId(null);
        await alertSuccess("Sektor berhasil diubah!");
      } else {
        await alertSuccess("Sektor berhasil ditambahkan!", 1500);
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
      `Apakah anda yakin ingin menghapus sektor "${name}"?`
    );
    if (!confirm) return;

    try {
      await API.delete(`${ENDPOINTS.SECTORS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess(`Sektor ${name} berhasil dihapus!`);
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
      `Apakah anda yakin ingin menerima sektor "${name}"?`
    );
    if (!confirm) return;
    try {
      await API.patch(
        `${ENDPOINTS.SECTORS}/${id}`,
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
      await alertSuccess(`Sektor ${name} berhasil diterima!`);
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
    <main className="p-6 ">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-accent-dark text-sm mb-5">Sektor</h1>
        <div className="mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <IdCard className="w-5 h-5" />
            <h2 className="text-2xl mt-2">Sektor</h2>
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

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white bg-accent hover:bg-accent-hover rounded-xl p-3 px-5 flex items-center space-x-2 cursor-pointer"
          >
            <CirclePlus className="w-5 h-5 " />
            <span>Tambah Sektor</span>
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari Sektor..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full bg-accent text-white pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-transparent transition-colors"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">No</th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Nama
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {roles && loading !== true ? (
                roles.map((field, index) => (
                  <tr key={field.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800">{field.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          field.is_accepted
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {field.is_accepted ? "Diterima" : "Belum Diterima"}
                      </span>
                    </td>
                    <td className="p-4">
                      {!field.is_accepted && (
                        <button
                          onClick={() => handleAccept(field.id, field.name)}
                          className="p-2 text-green-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingId(field.id);
                          setFormData({ name: field.name });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id, field.name)}
                        className="p-2 text-red-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
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

        {/* Empty State (if no roles) */}
        {roles.length === 0 && loading === false && (
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Tidak ada sektor yang ditemukan." />
          </div>
        )}
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={loading}
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center h-screen bg-black/25 z-50">
          <div className="bg-white text-black p-6 rounded-lg flex flex-col gap-2 min-w-sm lg:min-w-xl">
            <div className=" rounded-lg justify-between flex">
              <h3 className="text-lg font-semibold">
                {editingId ? "Ubah" : "Tambah"} Sektor
              </h3>
              <X
                onClick={() => {
                  if (isSubmitting) return;
                  if (editingId) {
                    setEditingId(null);
                    setFormData({ name: "" });
                  }
                  setIsModalOpen(false);
                }}
                className={`w-8 h-8  text-red-500 hover:text-red-600 ${
                  isSubmitting ? "pointer-events-none opacity-50" : "cursor-pointer"
                }`}
              />
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="province">Nama Sektor</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  id="province"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Masukkan nama sektor"
                  className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    formError.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formError.name && (
                  <p className="mt-1 text-sm text-red-500">{formError.name}</p>
                )}
              </div>

              <div className="flex justify-end ">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent-hover"
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
export default SektorPage;
