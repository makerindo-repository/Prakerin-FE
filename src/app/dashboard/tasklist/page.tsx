"use client";
import {
  CheckSquare,
  CirclePlus,
  ClipboardCheck,
  Info,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import NotFoundComponent from "@/components/NotFoundComponent";
import TabsComponent from "@/components/TabsCompenent";
import Loader from "@/components/loader";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";
import { AxiosError } from "axios";
import { alertError } from "@/libs/alert";

interface Task {
  id: number;
  title: string;
  due_date: string;
  internship: {
    student: {
      name: string;
    };
  };
  status: "in_progress" | "pending" | "completed" | "cancelled";
}

type ActiveTab = "Semua" | "Belum" | "Sedang" | "Selesai" | "Dibatalkan";

const TasklistPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 500);
  const [tasks, setTasks] = useState<Task[]>([]);
  const tabs: ActiveTab[] = [
    "Semua",
    "Belum",
    "Sedang",
    "Selesai",
    "Dibatalkan",
  ];
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authorization, setAuthorization] = useState<string>();

  const [pages, setPages] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Belum";
      case "in_progress":
        return "Sedang";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
    }
  };

  const getDeadline = (deadline?: string) => {
    if (!deadline) return "-";
    const deadlineArray = deadline.split("-");
    return deadlineArray.length === 3
      ? `${deadlineArray[2]}-${deadlineArray[1]}-${deadlineArray[0]}`
      : deadline;
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      let filteredStatus = "all";
      switch (activeTab) {
        case "Belum":
          filteredStatus = "pending";
          break;
        case "Sedang":
          filteredStatus = "in_progress";
          break;
        case "Selesai":
          filteredStatus = "completed";
          break;
        case "Semua":
          filteredStatus = "all";
          break;
        case "Dibatalkan":
          filteredStatus = "cancelled";
          break;
      }

      const response = await API.get(ENDPOINTS.TASKS, {
        params: {
          search: inputSearch,
          status: filteredStatus,
          limit: 10,
          page: pages.activePages,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      setTasks(Array.isArray(response.data?.data) ? response.data.data : []);
      setPages({
        activePages: response.data?.current_page || 1,
        pages: response.data?.last_page || 1,
      });
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
      setTasks([]);
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
    fetchTasks();
  }, [debouncedQuery, pages.activePages, activeTab]);

  useEffect(() => {
    setAuthorization(Cookies.get("authorization") || "");
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Dashboard -&gt; Tasklist</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <ClipboardCheck className="w-5 h-5" />
          <h2 className="text-2xl">Daftar Tugas</h2>
        </div>

        {authorization === "company" && (
          <Link
            href="/dashboard/tasklist/tambah"
            className="flex items-center justify-center space-x-2 p-3 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all duration-200 cursor-pointer shadow-sm hover:shadow text-sm font-semibold w-full sm:w-auto"
          >
            <CirclePlus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-150 space-y-4">
          <TabsComponent
            data={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama tugas..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-accent focus:bg-white transition-all text-gray-700"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                <th className="p-4 font-semibold">No</th>
                <th className="p-4 font-semibold">Nama Tugas</th>
                {authorization === "company" && (
                  <th className="p-4 font-semibold">Pemagang</th>
                )}
                <th className="p-4 font-semibold">Tenggat Waktu</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {tasks && !isLoading ? (
                tasks.map((task, index) => (
                  <tr key={task.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800 text-sm">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="p-4 text-gray-800 text-sm">{task.title}</td>
                    {authorization === "company" && (
                      <td className="p-4 text-gray-800 text-sm">
                        {task.internship?.student?.name ?? "-"}
                      </td>
                    )}
                    <td className="p-4 text-gray-600 text-sm">
                      {getDeadline(task.due_date)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatus(task.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/tasklist/${task.id}`}
                        className="w-fit h-fit text-blue-600 hover:text-blue-600/75 rounded-full transition-colors cursor-pointer inline-block"
                      >
                        <Info className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={authorization === "company" ? 6 : 5}
                    className="text-center p-4 text-gray-600"
                  >
                    <Loader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {tasks && !isLoading ? (
            <div className="divide-y">
              {tasks.map((task, index) => (
                <div key={task.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="text-xs text-gray-500 mb-1">
                        #{index + 1 + (pages.activePages - 1) * 10}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm break-words">
                        {task.title}
                      </h3>
                    </div>
                    <Link
                      href={`/dashboard/tasklist/${task.id}`}
                      className="flex-shrink-0 text-blue-600 hover:text-blue-600/75 rounded-full transition-colors"
                    >
                      <Info className="w-5 h-5" />
                    </Link>
                  </div>

                  {authorization === "company" && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">Pemagang: </span>
                      <span className="text-sm text-gray-800">
                        {task.internship?.student?.name ?? "-"}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center text-gray-600">
                      <span className="mr-1">📅</span>
                      {getDeadline(task.due_date)}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatus(task.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <Loader />
            </div>
          )}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <NotFoundComponent text="Anda belum memiliki tugas." />
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
export default TasklistPage;