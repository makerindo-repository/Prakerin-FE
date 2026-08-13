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

interface JobOpening {
  id: string;
  title: string;
  poster: string | null;
  company: { name: string };
  city_regency: { name: string };
  province: { name: string };
  is_paid: boolean;
  updated_at: string;
  save_job_opening: boolean;
  user: { photo_profile: string | null };
  is_available: boolean;
}

export function IndustryLowongan() {
  const route = useRouter();
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const fetchJobOpenings = async (selectedPage = page.activePages) => {
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
    fetchJobOpenings();
  }, []);

  return (
    <>
      <div className="flex justify-end mb-6">
        <Link
          href="/dashboard/industry/tambah_lowongan"
          className="text-white bg-accent rounded-xl p-3 px-5 flex items-center space-x-2 shadow-md hover:bg-accent-hover"
        >
          <CirclePlus className="w-5 h-5" />
          <span>Tambah Lowongan</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {jobOpenings &&
          !isLoading &&
          jobOpenings.map((data) => (
            <Link
              href={`/dashboard/lowongan/${data.id}`}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              key={data.id}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {data.title}
                </h3>
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
                  {data.user.photo_profile ? (
                    <div className="w-15 h-15 rounded-full border-white border overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${data.user.photo_profile}`}
                        alt="Logo Perusahaan"
                        className="object-cover rounded-full w-full h-full"
                      />
                    </div>
                  ) : (
                    <UserCircle className="w-15 h-15 text-[var(--color-accent)]" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {data.company.name}
                    </h3>
                    <div className="flex text-sm text-gray-500 space-x-2">
                      <MapPin className="w-4 h-4 my-auto" />
                      <p className="">
                        {data.city_regency?.name ?? "N/A"}, {data.province?.name ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                {data.is_paid && (
                  <p className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Dibayar
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center border-t-2 border-gray-200 pt-3">
                <p className="text-gray-500 text-sm">
                  {timeAgo(data.updated_at)}
                </p>
                {data.is_available && (
                  <p className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Masih tersedia
                  </p>
                )}
              </div>
            </Link>
          ))}

        {isLoading && (
          <div className="text-center py-12 col-span-2 ">
            <Loader width={64} height={64} />
          </div>
        )}

        {jobOpenings.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Tidak ada lowongan magang yang ditemukan." />
          </div>
        )}
      </div>

      <div className="px-6">
        <PaginationComponent
          activePage={page.activePages}
          totalPages={page.pages}
          onPageChange={(p) => fetchJobOpenings(p)}
          loading={isLoading}
          disabled={jobOpenings.length === 0}
        />
      </div>
    </>
  );
}