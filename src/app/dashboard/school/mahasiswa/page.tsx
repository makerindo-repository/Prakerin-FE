"use client";
import {
  CheckSquare,
  ClipboardCopy,
  Edit,
  Plus,
  Search,
  Trash,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
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
  id: string;
  status?: "ongoing" | "not_started" | "completed";
  status_magang?: "ongoing" | "not_started" | "completed";
  status_subscription?: "free" | "premium";
  student: {
    id: string;
    name: string;
    class: string | null;
    status_subscription?: "free" | "premium";
    status_magang?: "ongoing" | "not_started" | "completed";
  } | null;
  major: {
    name: string;
  } | null;
}

const DaftarMahasiswaPage: React.FC = () => {
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
          school_type: "university", // hanya mahasiswa (institusi type=university)
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

  const handleDelete = async (studentId: string | undefined) => {
    if (!studentId) return;

    const confirm = await alertConfirm(
      "Apakah Anda yakin ingin menghapus siswa ini? Menghapus siswa juga akan menghapus akun penggunanya."
    );
    if (!confirm) return;

    try {
      setIsLoading(true);
      await API.delete(`${ENDPOINTS.STUDENTS}/${studentId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await alertSuccess("Siswa berhasil dihapus");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      await alertError("Gagal menghapus siswa");
    } finally {
      setIsLoading(false);
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
    <main className="p-4 sm:p-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-accent-dark text-xs sm:text-sm mb-3 sm:mb-5">
          Daftar Mahasiswa
        </h1>
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <UsersRound className="w-4 h-4 sm:w-5 sm:h-5" />
            <h2 className="text-xl sm:text-2xl mt-1 sm:mt-2">
              Daftar Mahasiswa
            </h2>
          </div>
        </div>

        {/* Tabs - Responsive */}
        <div className="mb-4 sm:mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex space-x-1 bg-gray-100 p-1 rounded-lg min-w-max sm:min-w-0">
            <TabsComponent
              data={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons - Responsive Grid */}
      <div className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-end gap-2 sm:gap-2">
          <button
            onClick={handleDownload}
            className="bg-slate-400 hover:bg-slate-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center cursor-pointer order-3 lg:order-none"
          >
            <ClipboardCopy size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Unduh Template</span>
          </button>
          
          <button
            onClick={handleButtonImport}
            className="bg-green-400 hover:bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center cursor-pointer order-4 lg:order-none"
          >
            <ClipboardCopy size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Import</span>
          </button>

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
          
          <Link
            href="/dashboard/school/mahasiswa/permohonan"
            className="bg-vip hover:bg-orange-400 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center order-2 lg:order-none"
          >
            <ClipboardCopy size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Permohonan</span>
          </Link>
          
          <Link
            href="/dashboard/school/mahasiswa/tambahsiswa"
            className="bg-accent text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center order-1 lg:order-none"
          >
            <Plus size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Tambah Mahasiswa</span>
          </Link>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Cari mahasiswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-accent text-white placeholder-teal-200 pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm sm:text-base"
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600 uppercase text-xs">
                  No
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase text-xs">
                  Nama
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase text-xs">
                  Semester
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase text-xs">
                  Jurusan
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase text-xs">
                  Status Magang
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase text-xs">
                  Status Langganan
                </th>
                <th className="text-left p-3 font-medium text-gray-600 uppercase text-xs">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {students && !isLoading ? (
                students.map((task, index) => {
                  const magangStatus = task.status_magang || task.status || "not_started";
                  const subStatus = task.status_subscription || task.student?.status_subscription || "free";

                  return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800 text-sm">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800 text-sm">{task.student?.name ?? "-"}</td>
                    <td className="p-4 text-gray-800 text-sm">
                      {task.student?.class ? `Semester ${task.student.class}` : "-"}
                    </td>
                    <td className="p-4 text-gray-800 text-sm">
                      {task.major?.name ?? "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          magangStatus
                        )}`}
                      >
                        {getStatusName(magangStatus)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          subStatus === "premium"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {subStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/school/mahasiswa/${task.id}/edit`}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="Ubah"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(task.student?.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus"
                          disabled={!task.student?.id}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-4">
                    <Loader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {students && !isLoading ? (
            students.map((task, index) => (
              <div
                key={index}
                className="border-b last:border-b-0 p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500">
                        #{index + 1 + (pages.activePages - 1) * 10}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm break-words">
                      {task.student?.name ?? "-"}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 flex-shrink-0 ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {getStatusName(task.status)}
                  </span>
                </div>
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="text-gray-500 w-16 flex-shrink-0">Semester:</span>
                    <span className="text-gray-900 font-medium break-words">
                      {task.student?.class ? `Semester ${task.student.class}` : "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-16 flex-shrink-0">Jurusan:</span>
                    <span className="text-gray-900 font-medium break-words">
                      {task.major?.name ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/school/mahasiswa/${task.id}/edit`}
                      className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1"
                    >
                      <Edit size={14} />
                      <span>Ubah</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(task.student?.id)}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1 disabled:opacity-50"
                      disabled={!task.student?.id}
                    >
                      <Trash size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <Loader />
            </div>
          )}
        </div>

        {/* Empty State */}
        {students.length === 0 && !isLoading && (
          <div className="text-center py-8 sm:py-12">
            <NotFoundComponent text="Tidak ada mahasiswa yang ditemukan." />
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
export default DaftarMahasiswaPage;