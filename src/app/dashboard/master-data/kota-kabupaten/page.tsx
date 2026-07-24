"use client";
import { ArrowUpDown, Building2, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import LoaderData from "@/components/loader";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });

interface Pages {
  activePages: number;
  pages: number;
}

interface Field {
  id: string;
  external_id?: string;
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

interface SyncStatus {
  total_provinces: number;
  last_sync: {
    source: string;
    status: string;
    completed_at: string | null;
    cities_created: number;
    cities_updated: number;
  } | null;
}

type SortOption = "code_asc" | "code_desc" | "name_asc" | "name_desc";

const KotaKabupatenPage: React.FC = () => {
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 500);

  const [sortOption, setSortOption] = useState<SortOption>("code_asc");

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [cityRegencies, setCityRegencies] = useState<Field[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // React-select filter (multi select)
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

  const getSortParams = (option: SortOption) => {
    switch (option) {
      case "code_asc":
        return { sort_by: "code", sort_direction: "asc" };
      case "code_desc":
        return { sort_by: "code", sort_direction: "desc" };
      case "name_asc":
        return { sort_by: "name", sort_direction: "asc" };
      case "name_desc":
        return { sort_by: "name", sort_direction: "desc" };
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await API.get("/api/v1/regional-sync/status");
      if (response.data?.data) {
        setSyncStatus(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
    }
  };

  const fetchFilterProvinces = async () => {
    try {
      const response = await API.get(ENDPOINTS.PROVINCES, {
        params: {
          search: debouncedFilterProvinceSearch,
          limit: 20,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const data = response.data.data || response.data || [];
      const options = data.map((prov: any) => ({
        value: prov.id,
        label: prov.name,
      }));
      setFilterProvinceOptions(options);
    } catch (error) {
      console.error("Fetch filter provinces error:", error);
    }
  };

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const provinceIds = selectedProvinces.map((p) => p.value);
      const sortParams = getSortParams(sortOption);

      const response = await API.get(ENDPOINTS.CITY_REGENCIES, {
        params: {
          search: inputSearch,
          province_id: provinceIds,
          limit: 10,
          page: pages.activePages,
          is_limit: true,
          ...sortParams,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      setCityRegencies(response.data.data || []);
      setPages({
        activePages: response.data.current_page || 1,
        pages: response.data.last_page || 1,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  useEffect(() => {
    fetchFilterProvinces();
  }, [debouncedFilterProvinceSearch]);

  useEffect(() => {
    setPages((prev) => ({ ...prev, activePages: 1 }));
  }, [debouncedQuery, selectedProvinces, sortOption]);

  useEffect(() => {
    fetchData();
  }, [pages.activePages, debouncedQuery, selectedProvinces, sortOption]);

  return (
    <main className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-accent-dark text-sm mb-5">Master Data / Kota & Kabupaten</h1>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <Building2 className="w-6 h-6" />
            <h2 className="text-2xl mt-1">Kota & Kabupaten (Standar Kemendagri)</h2>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Data Otomatis Terintegrasi (Read-Only)</span>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Data Kota & Kabupaten Resmi Indonesia (Kemendagri)
              </p>
              <p className="text-xs text-gray-600">
                Diperbarui secara otomatis via Artisan Command (`php artisan sync:regional-data`).
              </p>
            </div>
          </div>
          {syncStatus?.last_sync && (
            <div className="text-right text-xs text-gray-600">
              <p>
                Status: <span className="font-semibold text-green-600 capitalize">{syncStatus.last_sync.status}</span>
              </p>
              <p>
                Terakhir disinkronisasi:{" "}
                <span className="font-medium text-gray-800">
                  {syncStatus.last_sync.completed_at
                    ? new Date(syncStatus.last_sync.completed_at).toLocaleString("id-ID")
                    : "-"}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Multi-select Province Filter */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Filter Berdasarkan Provinsi:
          </label>
          <Select
            isMulti
            options={filterProvinceOptions}
            value={selectedProvinces}
            onChange={(selected: any) => {
              setSelectedProvinces(selected || []);
              setPages((prev) => ({ ...prev, activePages: 1 }));
            }}
            onInputChange={(input: any) => setFilterProvinceSearch(input)}
            placeholder="Pilih atau cari provinsi..."
            className="react-select-container text-sm"
            classNamePrefix="react-select"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-accent rounded-t-2xl p-2 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari Kota/Kabupaten..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="w-full text-white pl-10 pr-4 py-2 bg-transparent focus:outline-none placeholder:text-blue-200"
            />
          </div>

          <div className="flex items-center space-x-2 px-2 pb-2 md:pb-0">
            <ArrowUpDown className="w-4 h-4 text-blue-200" />
            <span className="text-xs text-blue-100 font-medium whitespace-nowrap">Urutkan:</span>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setPages((prev) => ({ ...prev, activePages: 1 }));
              }}
              className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-accent-light cursor-pointer"
            >
              <option value="code_asc">Kode Kemendagri (Urut Terkecil)</option>
              <option value="code_desc">Kode Kemendagri (Urut Terbesar)</option>
              <option value="name_asc">Abjad A - Z</option>
              <option value="name_desc">Abjad Z - A</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600 w-16">No</th>
                <th className="text-left p-3 font-medium text-gray-600">Kode Kemendagri</th>
                <th className="text-left p-3 font-medium text-gray-600">Kota / Kabupaten</th>
                <th className="text-left p-3 font-medium text-gray-600">Provinsi</th>
                <th className="text-left p-3 font-medium text-gray-600">Status Sync</th>
              </tr>
            </thead>
            <tbody>
              {cityRegencies && loading !== true ? (
                cityRegencies.map((city, index) => (
                  <tr key={city.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-sm">
                      {city.external_id || "-"}
                    </td>
                    <td className="p-4 text-gray-800 font-medium">{city.name}</td>
                    <td className="p-4 text-gray-700">
                      {city.province?.name || "-"}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Kemendagri
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    <LoaderData />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {cityRegencies.length === 0 && loading === false && (
          <div className="text-center py-12">
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
    </main>
  );
};

export default KotaKabupatenPage;