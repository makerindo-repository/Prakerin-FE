"use client";
import {
  BookOpen,
  CircleArrowRight,
  MapPin,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import NotFoundComponent from "@/components/NotFoundComponent";
import { API, ENDPOINTS } from "../../../utils/config";
import Loader from "../loader";
import TabsComponent from "../TabsCompenent";
import PaginationComponent from "../PaginationComponent";
import { Pages } from "@/models/pagination";

interface Perusahaan {
  id: string;
  photo_profile: string | null;
  name: string;
  city_regency: string | null;
  province: string | null;
  mou: boolean;
}

interface CompanyCount {
  school_count: number;
  mou_count: number;
}

type ActiveTab = "Semua" | "Sudah Kerja Sama" | "Belum Kerja Sama";

const NonAdminSekolah: React.FC = () => {
  const [inputSearch, setInputSearch] = useState<string>("");
  const debouncedQuery = useDebounce(inputSearch, 1000);
  const [perusahaan, setPerushaan] = useState<Perusahaan[]>([]);

  const tabs: ActiveTab[] = ["Semua", "Sudah Kerja Sama", "Belum Kerja Sama"];
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companyCount, setCompanyCount] = useState<CompanyCount>({
    school_count: 0,
    mou_count: 0,
  });

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [isReload, setIsReload] = useState<boolean>(false);

  const fetchCompany = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await API.get(ENDPOINTS.USERS, {
        params: {
          search: inputSearch,
          role: "school",
          is_mou:
            activeTab === "Semua"
              ? undefined
              : activeTab === "Sudah Kerja Sama"
              ? true
              : false,
          page: pages.activePages,
          limit: 8,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Company fetched successfully:", response.data.data);
      const data = response.data.data.map((item: any) => ({
        id: item.id,
        photo_profile: item.photo_profile,
        name: item.name,
        city_regency: item.city_regency.name,
        province: item.province.name,
        mou: item.mou,
      }));

      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
      setPerushaan(data);
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyCount = async () => {
    try {
      const response = await API.get(`${ENDPOINTS.USERS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        console.log("Company Count fetched successfully:", response.data.data);
        setCompanyCount(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching company count:", error);
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
        setPerushaan([]);
        return;
      }
    }

    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchCompany();
  }, [pages.activePages, isReload]);

  useEffect(() => {
    fetchCompanyCount();
  }, []);

  return (
    <>
      <div className="lg:flex lg:justify-between items-end mb-5">
        <div className="flex gap-4 ">
          <div className="bg-white p-3 rounded-2xl flex items-center justify-between space-x-5 px-5 mb-5 lg:mb-0 w-64">
            <div className="text-black">
              <h1 className="text-2xl font-extrabold">
                {companyCount.school_count}
              </h1>
              <span className="text-sm">Total Sekolah</span>
            </div>
            <BookOpen className="w-10 h-10  text-accent" />
          </div>
          <div className="bg-white p-3 rounded-2xl flex items-center justify-between space-x-5 px-5 mb-5 lg:mb-0 w-64">
            <div className="text-black">
              <h1 className="text-2xl font-extrabold">
                {companyCount.mou_count}
              </h1>
              <span className="text-sm">Telah Kerja Sama</span>
            </div>
            <BookOpen className="w-10 h-10  text-yellow-400" />
          </div>
        </div>
        <div>
          <div className="relative flex-1 bg-white rounded-2xl">
            <input
              type="text"
              onChange={(e) => setInputSearch(e.target.value)}
              value={inputSearch}
              placeholder="Cari sekolah/universitas..."
              className="text-gray-600 w-full px-4 py-3 pl-12 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
            />

            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <TabsComponent
          data={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-black">
        {perusahaan && !isLoading ? (
          perusahaan.map((data, index) => (
            <div
              className="relative bg-white flex flex-col md:flex-row space-x-5 p-6 px-10 md:px-5 rounded-2xl justify-between items-end md:items-center 
              overflow-hidden"
              key={index}
            >
              <div className="flex w-full md:w-auto">
                {data.photo_profile ? (
                  <div className="w-15 h-15 relative rounded-full border-white border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${data.photo_profile}`}
                      alt="Logo Perusahaan"
                      fill
                      sizes="100%"
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <BookOpen className="w-15 h-15 text-[var(--color-accent)]" />
                )}

                <div className="ms-3">
                  <h5 className="text-accent font-bold">{data.name}</h5>
                  <span className="flex">
                    <MapPin /> {data.city_regency ?? "-"},{" "}
                    {data.province ?? "-"}
                  </span>
                </div>
              </div>

              <Link
                href={`/dashboard/sekolah/${data.id}`}
                className="bg-accent/10 flex justify-between items-center p-1 px-2 space-x-2 rounded-full cursor-pointer hover:bg-accent/20 transition"
              >
                <span>Detail</span>
                <CircleArrowRight className="w-4 h-4" />
              </Link>

              {/* Tombol pojok kanan atas */}
              {data.mou && (
                <h4 className="absolute text-sm top-0 right-0 bg-accent text-white px-3 py-1 rounded-bl-2xl">
                  Sudah Kerja Sama
                </h4>
              )}
            </div>
          ))
        ) : (
          <div className="md:col-span-2">
            <Loader />
          </div>
        )}

        {perusahaan.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-2">
            <NotFoundComponent text="Tidak ada sekolah yang ditemukan." />
          </div>
        )}
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={isLoading}
      />
    </>
  );
};
export default NonAdminSekolah;
