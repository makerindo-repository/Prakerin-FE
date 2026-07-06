"use client";

import {
  Search,
  UsersRound,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "@/utils/config";
import useDebounce from "@/hooks/useDebounce";
import TabsComponent from "@/components/TabsCompenent";
import PaginationComponent from "@/components/PaginationComponent";
import NotFoundComponent from "@/components/NotFoundComponent";
import Loader from "@/components/loader";
import Link from "next/link";
import { Pages } from "@/models/pagination";

interface Student {
  id: string;
  status: "ongoing" | "not_started" | "completed";
  student: {
    id: string;
    name: string;
    class: string | null;
  };
  major: {
    name: string;
  } | null;
}

const DetailSekolahPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedQuery = useDebounce(searchTerm, 1000);

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const [isReload, setIsReload] = useState(false);

  const tabs = [
    "Semua",
    "Belum Magang",
    "Sedang Magang",
    "Selesai Magang",
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "not_started":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusName = (status: string): string => {
    switch (status) {
      case "ongoing":
        return "Sedang Magang";
      case "not_started":
        return "Belum Magang";
      case "completed":
        return "Selesai Magang";
      default:
        return "-";
    }
  };

  const fetchStudents = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      let status: string | undefined;

      switch (activeTab) {
        case "Sedang Magang":
          status = "ongoing";
          break;
        case "Belum Magang":
          status = "not_started";
          break;
        case "Selesai Magang":
          status = "completed";
          break;
      }

      const response = await API.get(ENDPOINTS.USERS, {
        params: {
          role: "student",
          school_id: id,
          status,
          search: searchTerm,
          page: pages.activePages,
          limit: 10,
          is_verified: true,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

        console.log("Students:", response.data);
        console.log("school id:", id);
        console.log(response.data.data);

      setStudents(response.data.data);

      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (selectedPage: number) => {
    setPages((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      if (!debouncedQuery) {
        setStudents([]);
        return;
      }
    }

    setPages((prev) => ({
      ...prev,
      activePages: 1,
    }));

    setIsReload((prev) => !prev);
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchStudents();
  }, [pages.activePages, isReload]);

  return (
    <main className="p-6">
    <h1 className="text-accent-dark text-sm mb-5">
      <Link
        className="hover:underline hover:text-accent"
        href={"/dashboard/sekolah/"}
      >
        Sekolah
      </Link>{" "}
      -&gt; Daftar Siswa Sekolah
    </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <UsersRound className="w-5 h-5" />
          <h2 className="text-2xl mt-2">
            Daftar Siswa Sekolah
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <TabsComponent
          data={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            placeholder="Cari siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-accent text-white pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">No</th>
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">Kelas</th>
                <th className="text-left p-3">Jurusan</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {!isLoading ? (
                students.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>

                    <td className="p-4">
                      {item.student?.name}
                    </td>

                    <td className="p-4">
                      {item.student?.class ?? "-"}
                    </td>

                    <td className="p-4">
                      {item.major?.name ?? "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusName(item.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <Loader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {students.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <NotFoundComponent text="Tidak ada siswa ditemukan." />
          </div>
        )}
      </div>

      <PaginationComponent
        activePage={pages.activePages}
        totalPages={pages.pages}
        onPageChange={handleChangePage}
        loading={isLoading}
      />
    </main>
  );
};

export default DetailSekolahPage;