"use client";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  CirclePlus,
  Map,
  Pencil,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "../../../../../utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { Province } from "@/models/province";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });

type ActiveTab = "Semua" | "Diterima" | "Belum Diterima";

interface FormData {
  province_id: string;
  name: string;
}

interface FormError {
  province_id?: string;
  name?: string;
}

interface Pages {
  activePages: number;
  pages: number;
}

interface Field {
  id: string;
  province_id: string;
  name: string;
  is_accepted: boolean;
  province?: {
    id: string;
    name: string;
  };
}

interface ProvinceOption {
  value: string;
  label: string;
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

  const [cityRegencies, setCityRegencies] = useState<Field[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    province_id: "",
    name: "",
  });
  const [formError, setFormError] = useState<FormError>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isReload, setIsReload] = useState(false);

  // State untuk react-select di modal (single select)
  const [provinceSearch, setProvinceSearch] = useState("");
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const debouncedProvinceSearch = useDebounce(provinceSearch, 500);

  // State untuk react-select filter (multi select)
  const [filterProvinceSearch, setFilterProvinceSearch] = useState("");
  const [filterProvinceOptions, setFilterProvinceOptions] = useState<ProvinceOption[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<ProvinceOption[]>([]);
  const debouncedFilterProvinceSearch = useDebounce(filterProvinceSearch, 500);

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

      // Ambil province_id dari selectedProvinces (multi select)
      const provinceIds = selectedProvinces.map(p => p.value);

      const params: any = {
        is_accepted: isAccepted,
        search: inputSearch,
        limit: 10,
        page: pages.activePages,
      };

      // Hanya tambahkan province_id jika ada yang dipilih
      if (provinceIds.length > 0) {
        params.province_id = provinceIds;
      }

      const response = await API.get(ENDPOINTS.CITY_REGENCIES, {
        params,
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      
      console.log("Params sent:", params);
      console.log(response.data.data);
      setCityRegencies(response.data.data);
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
        await API.patch(`${ENDPOINTS.CITY_REGENCIES}/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
      } else {
        await API.post(
          ENDPOINTS.CITY_REGENCIES,
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
      setFormData({ province_id: "", name: "" });

      if (editingId) {
        setIsModalOpen(false);
        setEditingId(null);
        await alertSuccess("Kota/Kabupaten berhasil diubah!");
      } else {
        await alertSuccess("Kota/Kabupaten berhasil ditambahkan!", 1500);
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
      `Apakah anda yakin ingin menghapus kota/kabupaten "${name}"?`
    );
    if (!confirm) return;

    try {
      await API.delete(`${ENDPOINTS.CITY_REGENCIES}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess(`Kota/Kabupaten ${name} berhasil dihapus!`);
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
      `Apakah anda yakin ingin menerima kota/kabupaten "${name}"?`
    );
    if (!confirm) return;
    try {
      await API.patch(
        `${ENDPOINTS.CITY_REGENCIES}/${id}`,
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
      await alertSuccess(`Kota/Kabupaten ${name} berhasil diterima!`);
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    }
  };

  // Fetch provinces untuk react-select di modal (single select)
  const fetchProvinceOptions = async () => {
    try {
      const response = await API.get(ENDPOINTS.PROVINCES, {
        params: {
          is_accepted: true,
          search: debouncedProvinceSearch,
          limit: 5,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const mapped = response.data.data.map((item: Province) => ({
        value: item.id,
        label: item.name,
      }));
      setProvinceOptions(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch provinces untuk react-select filter (multi select)
  const fetchFilterProvinceOptions = async () => {
    try {
      const response = await API.get(ENDPOINTS.PROVINCES, {
        params: {
          is_accepted: true,
          search: debouncedFilterProvinceSearch,
          limit: 5,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const mapped = response.data.data.map((item: Province) => ({
        value: item.id,
        label: item.name,
      }));
      setFilterProvinceOptions(mapped);
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    if (isModalOpen) {
      fetchProvinceOptions();
    }
  }, [debouncedProvinceSearch, isModalOpen]);

  useEffect(() => {
    fetchFilterProvinceOptions();
  }, [debouncedFilterProvinceSearch]);

  useEffect(() => {
    if (inputSearch.trim() !== "") {
      if (!debouncedQuery) {
        setCityRegencies([]);
        return;
      }
    }

    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery, selectedProvinces]);

  useEffect(() => {
    fetchData();
  }, [pages.activePages, isReload]);

  return (
    <main className="p-4 sm:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-accent-dark text-sm mb-5">Kota/Kabupaten</h1>
        <div className="mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <Building2 className="w-5 h-5" />
            <h2 className="text-2xl mt-2">Kota/Kabupaten</h2>
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

        {/* Filter and Add Button - Responsive Layout */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-6 items-stretch sm:items-center">
          <div className="flex flex-col gap-2 bg-white w-full sm:w-auto sm:min-w-[250px] p-4 rounded-xl shadow-sm">
            <label htmlFor="select-province" className="font-medium text-sm">
              Pilih Provinsi
            </label>
            <Select
              isMulti
              isClearable
              isSearchable
              options={filterProvinceOptions}
              value={selectedProvinces}
              onChange={(selected: any) => setSelectedProvinces(selected || [])}
              onInputChange={(input: any) => setFilterProvinceSearch(input)}
              placeholder="Pilih provinsi (bisa lebih dari 1)"
              noOptionsMessage={() => "Tidak ada provinsi ditemukan"}
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: "#ffffff",
                  borderColor: "#d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.125rem",
                  minHeight: "42px",
                  boxShadow: state.isFocused
                    ? "0 0 0 2px rgba(var(--accent-rgb, 59, 130, 246), 0.5)"
                    : "none",
                  borderWidth: "1px",
                  "&:hover": {
                    borderColor: "#d1d5db",
                  },
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "2px 8px",
                }),
                input: (base) => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#e0f2fe",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#0c4a6e",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#0c4a6e",
                  ":hover": {
                    backgroundColor: "#0ea5e9",
                    color: "#ffffff",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 50,
                }),
              }}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white bg-accent hover:bg-accent-hover rounded-xl p-3 px-5 flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto text-sm sm:text-base whitespace-nowrap"
          >
            <CirclePlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Tambah Kota/Kabupaten</span>
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
            placeholder="Cari Kota/Kabupaten..."
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
                  Nama Kota/Kabupaten
                </th>
                <th className="text-left p-3 font-medium text-gray-600 text-sm">
                  Provinsi
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
              {cityRegencies && loading !== true ? (
                cityRegencies.map((cityRegency, index) => (
                  <tr
                    key={cityRegency.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4 text-gray-800 text-sm">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800 text-sm">{cityRegency.name}</td>
                    <td className="p-4 text-gray-800 text-sm">
                      {cityRegency.province?.name || "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          cityRegency.is_accepted
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {cityRegency.is_accepted
                          ? "Diterima"
                          : "Belum Diterima"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {!cityRegency.is_accepted && (
                          <button
                            onClick={() =>
                              handleAccept(cityRegency.id, cityRegency.name)
                            }
                            className="p-2 text-green-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingId(cityRegency.id);
                            setFormData({
                              name: cityRegency.name,
                              province_id: cityRegency.province_id,
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cityRegency.id, cityRegency.name)
                          }
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
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    <LoaderData />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {cityRegencies.length === 0 && loading === false && (
          <div className="text-center py-12 col-span-2">
            <NotFoundComponent text="Tidak ada kota/kabupaten yang ditemukan." />
          </div>
        )}
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={loading}
      />

      {/* Modal - Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center h-screen bg-black/25 z-50 p-4">
          <div className="bg-white text-black p-4 sm:p-6 rounded-lg flex flex-col gap-2 w-full max-w-md sm:max-w-lg">
            <div className="rounded-lg justify-between flex">
              <h3 className="text-base sm:text-lg font-semibold">
                {editingId ? "Ubah" : "Tambah"} Kota/Kabupaten
              </h3>
              <X
                onClick={() => {
                  if (isSubmitting) return;
                  if (editingId) {
                    setEditingId(null);
                    setFormData({ province_id: "", name: "" });
                  }
                  setProvinceSearch("");
                  setIsModalOpen(false);
                }}
                className={`w-6 h-6 sm:w-8 sm:h-8 text-red-500 hover:text-red-600 flex-shrink-0 ${
                  isSubmitting ? "pointer-events-none opacity-50" : "cursor-pointer"
                }`}
              />
            </div>
            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
              {/* Field Provinsi dengan React Select */}
              <div className="flex flex-col gap-2">
                <label htmlFor="province" className="text-sm sm:text-base">
                  Pilih Provinsi
                </label>
                <Select
                  isClearable
                  isSearchable
                  isDisabled={isSubmitting}
                  options={provinceOptions}
                  value={
                    provinceOptions.find(
                      (opt) => opt.value === formData.province_id
                    ) || null
                  }
                  onChange={(selected: any) =>
                    setFormData({
                      ...formData,
                      province_id: selected?.value || "",
                    })
                  }
                  onInputChange={(input: any) => setProvinceSearch(input)}
                  placeholder="Pilih provinsi"
                  noOptionsMessage={() => "Tidak ada provinsi ditemukan"}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: state.isDisabled ? "#e5e7eb" : "#ffffff",
                      borderColor: formError.province_id
                        ? "#ef4444"
                        : "#d1d5db",
                      borderRadius: "0.375rem",
                      padding: "0.125rem",
                      minHeight: "42px",
                      boxShadow: state.isFocused
                        ? "0 0 0 2px rgba(var(--accent-rgb, 59, 130, 246), 0.5)"
                        : "none",
                      borderWidth: "1px",
                      cursor: state.isDisabled ? "not-allowed" : "default",
                      opacity: state.isDisabled ? 0.5 : 1,
                      "&:hover": {
                        borderColor: formError.province_id
                          ? "#ef4444"
                          : "#d1d5db",
                      },
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "2px 8px",
                    }),
                    input: (base) => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#9ca3af",
                    }),
                    singleValue: (base, state) => ({
                      ...base,
                      color: state.isDisabled ? "#6b7280" : "#000000",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {formError.province_id && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">
                    {formError.province_id}
                  </p>
                )}
              </div>

              {/* Field Nama Kota/Kabupaten */}
              <div className="flex flex-col gap-2">
                <label htmlFor="cityName" className="text-sm sm:text-base">
                  Nama Kota/Kabupaten
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isSubmitting}
                  id="cityName"
                  type="text"
                  placeholder="Masukkan nama kota/kabupaten"
                  className={`border p-2 rounded-md w-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-accent focus:border-transparent text-sm ${
                    formError.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formError.name && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">
                    {formError.name}
                  </p>
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