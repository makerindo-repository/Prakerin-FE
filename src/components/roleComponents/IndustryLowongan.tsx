import {
  Bookmark,
  Building,
  CirclePlus,
  MapPin,
  UserCircle,
  X,
  XCircle,
  FileText,
  Image as ImageIcon,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { timeAgo } from "@/utils/timeAgo";
import Link from "next/link";
import NotFoundComponent from "../NotFoundComponent";
import Loader from "../loader";
import PaginationComponent from "@/components/PaginationComponent";
import { Pages } from "@/models/pagination";
import useDebounce from "@/hooks/useDebounce";

interface JobOpening {
  id: string;
  title: string;
  poster: string | null;
  company?: { name: string };
  city_regency?: { name: string };
  province?: { name: string };
  is_paid: boolean;
  updated_at: string;
  save_job_opening?: boolean;
  user?: { photo_profile: string | null };
  is_available: boolean;
  qouta?: number;
  grade?: string;
  type?: string;
}

export function IndustryLowongan() {
  const route = useRouter();
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [role, setRole] = useState<string>("");
  const [page, setPage] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const fetchJobOpenings = async (selectedPage = page.activePages, searchQuery = debouncedSearch) => {
    setIsLoading(true);
    try {
      const response = await API.get(ENDPOINTS.JOB_OPENINGS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        params: {
          page: selectedPage,
          limit: 6,
          dashboard: true,
          search: searchQuery,
        },
      });
      if (response.status === 200) {
        setJobOpenings(response.data.data || []);
        setPage({
          activePages: selectedPage,
          pages: response.data.last_page || 1,
        });
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setRole(Cookies.get("authorization") || "");
  }, []);

  useEffect(() => {
    fetchJobOpenings(1, debouncedSearch);
  }, [debouncedSearch]);

  const isCompany = role === "company";

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={role === "super_admin" ? "Cari lowongan atau nama perusahaan..." : "Cari judul lowongan..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-xs"
          />
        </div>

        {isCompany && (
          <Link
            href="/dashboard/industry/tambah_lowongan"
            className="text-white bg-accent rounded-xl p-3 px-5 flex items-center justify-center space-x-2 shadow-md hover:bg-accent-hover transition-all"
          >
            <CirclePlus className="w-5 h-5" />
            <span>Tambah Lowongan</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobOpenings &&
          !isLoading &&
          jobOpenings.map((data) => (
            <Link
              href={`/dashboard/lowongan/${data.id}`}
              className="bg-white rounded-xl p-6 shadow-xs border border-gray-200/80 hover:shadow-md hover:border-accent/40 transition-all flex flex-col justify-between"
              key={data.id}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-accent transition-colors">
                      {data.title}
                    </h3>
                    {data.grade && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {data.grade === "all" ? "Semua Tingkat" : data.grade.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {data.poster && (
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      {data.poster.toLowerCase().endsWith(".pdf") ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-red-400" />
                        </div>
                      ) : (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/job-opening-posters/${data.poster}`}
                          alt={`Poster ${data.title}`}
                          className="object-cover w-full h-full"
                        />
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 flex items-center justify-center py-0.5">
                        <ImageIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {data.user?.photo_profile ? (
                      <div className="w-12 h-12 rounded-full border border-gray-100 overflow-hidden shrink-0">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${data.user.photo_profile}`}
                          alt="Logo Perusahaan"
                          className="object-cover rounded-full w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Building className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-800 text-base">
                        {data.company?.name ?? "Perusahaan"}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {data.city_regency?.name ?? "Indonesia"}, {data.province?.name ?? ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {data.is_paid && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        Dibayar
                      </span>
                    )}
                    {data.qouta && (
                      <span className="text-xs text-gray-500 font-medium">
                        Kuota: {data.qouta}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
                <p className="text-gray-400 text-xs font-medium">
                  Diperbarui {timeAgo(data.updated_at)}
                </p>
                {data.is_available ? (
                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-200">
                    Masih tersedia
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-red-200">
                    Ditutup
                  </span>
                )}
              </div>
            </Link>
          ))}

        {isLoading && (
          <div className="text-center py-12 col-span-1 lg:col-span-2">
            <Loader width={48} height={48} />
          </div>
        )}

        {jobOpenings.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-1 lg:col-span-2">
            <NotFoundComponent text="Tidak ada lowongan magang yang ditemukan." />
          </div>
        )}
      </div>

      <div className="mt-6">
        <PaginationComponent
          activePage={page.activePages}
          totalPages={page.pages}
          loading={isLoading}
          onPageChange={(selectedPage) => {
            fetchJobOpenings(selectedPage, debouncedSearch);
          }}
        />
      </div>
    </>
  );
}