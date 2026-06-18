"use client";
import { Search, UserCircle, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { API, ENDPOINTS } from "@/utils/config";
import Image from "next/image";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";
import TabsComponent from "@/components/TabsCompenent";
import Loader from "@/components/loader";
import useDebounce from "@/hooks/useDebounce";

interface StudentIntership {
  id: string;
  email: string;
  photo_profile: string | null;
  student: {
    name: string;
    phone_number: string | null;
  };
  school: {
    name: string;
  };
  internship: {
    role: string;
  };
  field: string;
}

type ActiveTab = "Semua" | "Sedang Magang" | "Sudah Magang";

const SiswMagangPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });
  const [data, setData] = useState<StudentIntership[]>([]);
  const tabs: ActiveTab[] = ["Semua", "Sedang Magang", "Sudah Magang"];
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");

  const [inputSearch, setInputSearch] = useState<string>("");
  const debouncedQuery = useDebounce(inputSearch, 1000);

  const fetchData = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await API.get(ENDPOINTS.USERS, {
        params: {
          page: page.activePages,
          limit: 10,
          role: "student",
          search: inputSearch,
          is_completed:
            activeTab === "Semua"
              ? undefined
              : activeTab === "Sudah Magang"
              ? 1
              : 0,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log(response.data.data);
      setPage({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
      setData(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isReload, setIsReload] = useState<boolean>(false);

  const handlePageChange = (selectedPage: number) => {
    setPage((prev) => ({
      ...prev,
      activePage: selectedPage,
    }));
  };

  useEffect(() => {
    if (inputSearch.trim() !== "") {
      if (!debouncedQuery) {
        setData([]);
        return;
      }
    }

    setPage((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchData();
  }, [page.activePages, isReload]);

  return (
    <main className="p-4 sm:p-6">
      {/* Header Section */}
      <h1 className="text-accent-dark text-sm mb-5">Siswa/Mahasiswa Magang</h1>
      <div className="flex items-center space-x-2 font-extrabold text-accent mb-6">
        <UsersRound className="w-5 h-5" />
        <h2 className="text-xl sm:text-2xl mt-2">Siswa/Mahasiswa Magang</h2>
      </div>

      {/* Tabs Section */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <TabsComponent
          data={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Search Section */}
      <div className="flex justify-end mb-6">
        <div className="relative bg-white rounded-2xl w-full sm:w-auto sm:min-w-[300px]">
          <input
            type="text"
            onChange={(e) => setInputSearch(e.target.value)}
            value={inputSearch}
            placeholder="Cari siswa/mahasiswa..."
            className="text-gray-600 w-full px-4 py-3 pl-10 sm:pl-12 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 text-sm sm:text-base"
          />
          <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 col-span-1 lg:col-span-2">
            <Loader width={64} height={64} />
          </div>
        )}

        {/* Data Cards */}
        {data.length !== 0 && !isLoading && (
          <>
            {data.map((item) => (
              <Link
                href={`/dashboard/siswa-magang/${item.id}`}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                key={item.id}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start sm:items-center space-x-3 w-full">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      {item.photo_profile ? (
                        <div className="w-12 h-12 sm:w-15 sm:h-15 relative rounded-full border-2 border-white overflow-hidden">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.photo_profile}`}
                            alt={item.student.name}
                            fill
                            sizes="(max-width: 640px) 48px, 60px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <UserCircle className="w-12 h-12 sm:w-15 sm:h-15 text-accent" />
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-col flex gap-1 min-w-0 flex-1">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                          {item.student.name}
                        </h4>
                        <h5 className="text-gray-700 text-sm sm:text-base truncate">
                          {item.field}
                        </h5>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        <p className="truncate">
                          <span className="font-medium">Kontak:</span> {item.email}
                        </p>
                        {item.student.phone_number && (
                          <p className="truncate">
                            <span className="font-medium">HP:</span> {item.student.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}

        {/* Empty State */}
        {data.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-1 lg:col-span-2">
            <NotFoundComponent text="Anda belum memiliki siswa/mahasiswa magang." />
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {data.length !== 0 && !isLoading && (
        <div className="mt-6">
          <PaginationComponent
            activePage={page.activePages}
            loading={isLoading}
            onPageChange={handlePageChange}
            totalPages={page.pages}
          />
        </div>
      )}
    </main>
  );
};
export default SiswMagangPage;