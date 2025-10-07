"use client";
import {
  CircleAlert,
  Download,
  Edit,
  Eye,
  FileText,
  Handshake,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useDebounce from "@/hooks/useDebounce";
import { API, ENDPOINTS } from "../../../../utils/config";
import Link from "next/link";
import NotFoundComponent from "@/components/NotFoundComponent";
import TabsComponent from "@/components/TabsCompenent";
import { AxiosError } from "axios";
import { alertError } from "@/libs/alert";
import Loader from "@/components/loader";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";

interface KerjaSama {
  id: string;
  start_date: string;
  end_date: string;
  status: TypeStatus;
  file: string;
  company?: {
    id: string;
    name: string;
  };
  school?: {
    id: string;
    name: string;
  };
}

type TypeStatus = "pending" | "accepted" | "rejected" | "";
type ActiveTab = "Semua" | "Diterima" | "Tertunda" | "Ditolak";

const lamaranPage: React.FC = () => {
  const router = useRouter();
  const [authorization, setAuthorization] = useState<string>();
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 1000);
  const [data, setData] = useState<KerjaSama[]>([]);
  const tabs: ActiveTab[] = ["Semua", "Diterima", "Tertunda", "Ditolak"];
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<Pages>({ activePages: 1, pages: 1 });
  const [isReload, setIsReload] = useState(false);

  const fetchData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    let type: string | undefined = undefined;
    switch (activeTab) {
      case "Semua":
        type = undefined;
        break;
      case "Diterima":
        type = "accepted";
        break;
      case "Tertunda":
        type = "pending";
        break;
      case "Ditolak":
        type = "rejected";
        break;
    }

    try {
      const response = await API.get(ENDPOINTS.MOUS, {
        params: {
          search: inputSearch,
          type: type,
          limit: 10,
          page: pages.activePages,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log(response.data);
      setData(response.data.data);
      setPages({
        activePages: response.data.current_page,
        pages: response.data.last_page,
      });
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        await alertError(responseError);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = (status: TypeStatus): string => {
    switch (status) {
      case "pending":
        return "Tertunda";
      case "accepted":
        return "Diterima";
      case "rejected":
        return "Ditolak";
      default:
        return "";
    }
  };

  const changeStatusColor = (status: TypeStatus): string => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "accepted":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "";
    }
  };

  const handleDownload = async (mouId: string) => {
    console.log("Downloading CV with ID:", mouId);
    try {
      const response = await API.get(`${ENDPOINTS.MOUS}/${mouId}/download`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        responseType: "blob",
      });
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        const nameCv = data.find((item) => {
          return item.id === mouId;
        });

        link.setAttribute(
          "download",
          `${
            authorization === "company"
              ? nameCv?.school?.name
              : nameCv?.company?.name
          }.pdf`
        );

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error("Error downloading CV:", error.response.data.errors);
    }
  };
  const handlePreview = async (mouId: string) => {
    try {
      const response = await API.get(`${ENDPOINTS.MOUS}/${mouId}/preview`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        responseType: "blob",
      });

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // Buka di tab baru
      window.open(fileURL, "_blank");
    } catch (error: any) {
      console.error("Error previewing CV:", error.response?.data || error);
    }
  };

  const handleChangePage = (selectedPage: number) => {
    setPages((prev) => ({
      ...prev,
      activePages: selectedPage,
    }));
  };

  useEffect(() => {
    setAuthorization(Cookies.get("authorization"));
  });

  useEffect(() => {
    if (inputSearch.trim() !== "") {
      if (!debouncedQuery) {
        setData([]);
        return;
      }
    }
    setPages((prev) => ({ ...prev, activePages: 1 }));
    setIsReload(!isReload);
  }, [debouncedQuery, activeTab]);

  useEffect(() => {
    fetchData();
  }, [pages.activePages, isReload]);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Kerja Sama</h1>
      <div className="flex items-center mb-8  space-x-2 font-extrabold text-accent">
        <Handshake className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Kerja Sama</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6 gap-2">
          <TabsComponent
            data={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      <div className="rounded-t-2xl bg-accent">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={`Cari kerja sama melalui nama ${
              authorization === "school" ? "perusahaan" : "sekolah/universitas"
            }...`}
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-white  focus:outline-none focus:ring-2 focus:ring-accent-light rounded-t-2xl"
          />
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {authorization === "school" ? "Perusahaan" : "Sekolah/Universitas"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Mulai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Berakhir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unduh Dokumen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lihat Dokumen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data && !isLoading ? (
                data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1 + (pages.activePages - 1) * 10}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {authorization === "company"
                        ? item.school?.name
                        : item.company?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.start_date ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.end_date ?? "-"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${changeStatusColor(
                        item.status
                      )}`}
                    >
                      {changeStatus(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <button
                        type="button"
                        className="bg-green-500 rounded-full py-1 px-2 cursor-pointer hover:bg-green-600"
                        onClick={() => handleDownload(item.id)}
                      >
                        Unduh
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white ">
                      <button
                        type="button"
                        className="bg-accent rounded-full py-1 px-2 cursor-pointer hover:bg-accent-hover"
                        onClick={() => handlePreview(item.id)}
                      >
                        Lihat
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/mou/${item.id}`}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <CircleAlert size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    <Loader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {data.map((item, index) => (
            <div key={item.id} className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {authorization === "company"
                    ? item.school?.name
                    : item.company?.name}
                </h3>
                <span className="text-sm text-gray-500">#{index + 1}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center">
                  <Download size={12} className="mr-1" />
                  Unduh
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center">
                  <Eye size={12} className="mr-1" />
                  Lihat
                </button>
              </div>

              <div className="flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Edit size={16} />
                </button>
                <button className="text-red-600 hover:text-red-800 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Anda belum memiliki kerja sama." />
          </div>
        )}
      </div>
      <PaginationComponent
        activePage={pages.activePages}
        loading={isLoading}
        onPageChange={handleChangePage}
        totalPages={pages.pages}
      />
    </main>
  );
};
export default lamaranPage;
