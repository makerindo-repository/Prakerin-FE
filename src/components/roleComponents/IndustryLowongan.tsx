import {
  Bookmark,
  Building,
  CirclePlus,
  MapPin,
  UserCircle,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "../../../utils/config";
import Cookies from "js-cookie";
import { timeAgo } from "@/utils/timeAgo";
import Link from "next/link";
import NotFoundComponent from "../NotFoundComponent";
import Loader from "../loader";

interface JobOpening {
  id: string;
  title: string;
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

  const fetchJobOpenings = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await API.get(ENDPOINTS.JOB_OPENINGS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        setJobOpenings(response.data.data || []);
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
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                {data.title}
              </h3>
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
    </>
  );
}
