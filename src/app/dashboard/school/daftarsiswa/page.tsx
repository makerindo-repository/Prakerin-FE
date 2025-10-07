"use client";
import {
  CheckSquare,
  ClipboardCopy,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { API, ENDPOINTS } from "../../../../../utils/config";
import Cookies from "js-cookie";
import TabsComponent from "@/components/TabsCompenent";
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import NotFoundComponent from "@/components/NotFoundComponent";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";
import Loader from "@/components/loader";

interface Student {
  id: number;
  status: "ongoing" | "not_started" | "completed";
  student: {
    name: string;
    class: string | null;
  };
  major: {
    name: string;
  } | null;
}

const DaftarSiswaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debouncedQuery = useDebounce(searchTerm, 1000);
  const [students, setStudents] = useState<Student[]>([]);
  const tabs = ["Semua", "Belum Magang", "Sedang Magang", "Selesai Magang"];
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });
  const [isReload, setIsReload] = useState<boolean>(false);

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
        return "";
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
        default:
          status = undefined;
      }

      const response = await API.get(`${ENDPOINTS.USERS}`, {
        params: {
          is_verified: true,
          page: pages.activePages,
          limit: 10,
          role: "student",
          status: status,
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log(response.data.data);
      setStudents(response.data.data);
      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await API.get(
        `${ENDPOINTS.USERS}/student/import/template`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", `prakerin-siswa-template.csv`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const handleButtonImport = async () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log("panggil");
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "text/csv") {
      e.target.value = "";
      await alertError("File harus CSV!");
      return;
    }

    const confirm = await alertConfirm(
      "Apakah anda yakin ingin mengimport siswa?"
    );
    if (!confirm) {
      e.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      await API.post(`${ENDPOINTS.USERS}/student/import`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchStudents();
      await alertSuccess("Berhasil ditambahkan");
    } catch (error) {
      console.error(error);
    } finally {
      e.target.value = "";
    }
  };

  const handleChangePage = (selectedPage: number) => {
    console.log(selectedPage);
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

    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchStudents();
  }, [pages.activePages, isReload]);

  return (
    <main className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-accent-dark text-sm mb-5">Daftar Siswa/Mahasiswa</h1>
        <div className="mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <UsersRound className="w-5 h-5" />
            <h2 className="text-2xl mt-2">Daftar Siswa/Mahasiswa</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6 gap-2">
          <TabsComponent
            data={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mb-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={handleDownload}
            className=" bg-slate-400 hover:bg-slate-500 colors text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer"
          >
            <ClipboardCopy size={16} className="mr-1" />
            Untuh Template Import
          </button>
          <button
            onClick={handleButtonImport}
            className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer"
          >
            <ClipboardCopy size={16} className="mr-1" />
            Import
          </button>

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
          <Link
            href="/dashboard/school/daftarsiswa/permohonan"
            className="bg-vip hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
          >
            <ClipboardCopy size={16} className="mr-1" />
            Permohonan Pendaftaran
          </Link>
          <Link
            href="/dashboard/school/daftarsiswa/tambahsiswa"
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
          >
            <Plus size={16} className="mr-1" />
            Tambah Siswa/Mahasiswa
          </Link>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari siswa/mahasiswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-accent text-white placeholder-teal-200 pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-teal-300"
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
                  Nama
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Kelas
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Jurusan
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students && !isLoading ? (
                students.map((task, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800">{task.student.name}</td>
                    <td className="p-4 text-gray-800">
                      {task.student.class ?? "-"}
                    </td>
                    <td className="p-4 text-gray-800">
                      {task.major?.name ?? "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusName(task.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4">
                    <Loader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State (if no tasks) */}
        {students.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Tidak ada siswa/mahasiswa yang ditemukan." />
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
export default DaftarSiswaPage;
