"use client";
import { Search, UserCircle, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { API, ENDPOINTS } from "../../../../utils/config";
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
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Siswa/Mahasiswa Magang</h1>
      <div className="flex items-center  space-x-2 font-extrabold text-accent mb-6">
        <UsersRound className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Siswa/Mahasiswa Magang</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <TabsComponent
          data={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="justify-end flex mb-6">
        <div className="relative bg-white rounded-2xl ">
          <input
            type="text"
            onChange={(e) => setInputSearch(e.target.value)}
            value={inputSearch}
            placeholder="Cari siswa/mahasiswa..."
            className="text-gray-600 w-full px-4 py-3 pl-12 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
          />

          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {isLoading && (
          <div className="text-center py-12 col-span-2 ">
            <Loader width={64} height={64} />
          </div>
        )}

        {data.length !== 0 && !isLoading && (
          <>
            {data.map((item) => (
              <Link
                href={`/dashboard/siswa-magang/${item.id}`}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                key={item.id}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {item.photo_profile ? (
                      <div className="w-15 h-15 relative rounded-full border-white border">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.photo_profile}`}
                          alt="Logo Perusahaan"
                          fill
                          sizes="100%"
                          className="object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <UserCircle className="w-15 h-15 text-[var(--color-accent)]" />
                    )}
                    <div className="flex-col flex gap-1">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {item.student.name}
                        </h4>
                        <h5 className="text-gray-700">{item.field}</h5>
                      </div>
                      <p className="text-sm text-gray-500">
                        Kontak : {item.email} |{" "}
                        {item.student.phone_number ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {data.length !== 0 && !isLoading && (
              <div className="lg:col-span-2">
                <PaginationComponent
                  activePage={page.activePages}
                  loading={isLoading}
                  onPageChange={handlePageChange}
                  totalPages={page.pages}
                />
              </div>
            )}
          </>
        )}
        {data.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Anda belum memiliki siswa/mahasiswa magang." />
          </div>
        )}
      </div>

      {/* Pagination Section */}
      <PaginationComponent
        activePage={page.activePages}
        loading={isLoading}
        onPageChange={handlePageChange}
        totalPages={page.pages}
      />
    </main>
  );
};
export default SiswMagangPage;
