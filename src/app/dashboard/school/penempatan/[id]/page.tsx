"use client";
import {
  Briefcase,
  Calendar,
  Clock,
  MapIcon,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import Image from "next/image";

interface Student {
  photo_profile: string | null;
  student: {
    name: string;
    class: string;
    status: string;
    major: {
      name: string;
    } | null;
  };
}

const detailPenempatan = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const route = useRouter();
  const [data, setData] = useState<Student>({
    photo_profile: null,
    student: {
      name: "",
      class: "",
      status: "",
      major: {
        name: "",
      },
    },
  });

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

  const fetchData = async () => {
    try {
      const response = await API.get(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log(response.data.data);
      setData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={`/dashboard/school/penempatan`}
        >
          Daftar Penempatan Siswa
        </Link>{" "}
        -&gt; Detail Penempatan Siswa
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <MapPin className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Detail Penempatan Siswa</h2>
        </div>
      </div>
      <div className="max-w-xl mx-auto">
        {/* Main card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 overflow-hidden">
          {/* Card header */}
          <div className="border-b-1 px-6 py-4">
            <h2 className="text-accent text-lg font-semibold">
              Informasi Magang
            </h2>
          </div>

          {/* Card content */}
          <div className="p-6">
            <div className="space-y-5">
              {/* Student info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  {/* <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100"> */}
                  {/* <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div> */}
                  {data.photo_profile ? (
                    <div className="w-16 h-16 relative self-center rounded-full border-white border">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${data.photo_profile}`}
                        alt="Logo Perusahaan"
                        fill
                        sizes="100%"
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 relative flex rounded-full  overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 border-white border">
                      <User className="w-16 h-16 self-center text-[var(--color-accent)]" />
                    </div>
                  )}
                  {/* </div> */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {data.student.name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      Kelas {data.student.class ?? "-"} | Jurusan{" "}
                      {data.student.major?.name ?? "-"}
                    </div>
                    <div className="text-sm text-teal-600 mt-1 cursor-pointer hover:underline">
                      Web Developer Bidang
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100  mt-2 ${getStatusColor(
                      data.student.status
                    )}`}
                  >
                    {getStatusName(data.student.status)}
                  </div>
                </div>
              </div>

              {/* Company info */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                    <div className="text-teal-600">
                      <svg
                        className="w-12 h-12"
                        viewBox="0 0 48 48"
                        fill="currentColor"
                      >
                        <path d="M24 4L6 12v8c0 11.11 7.67 21.47 18 24 10.33-2.53 18-12.89 18-24v-8L24 4zm-4 28l-6-6 2.83-2.83L20 26.34l9.17-9.17L32 20l-12 12z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    PT Makerindo Prima Solusi
                  </h4>
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-4">
                    <MapIcon className="w-4 h-4" />
                    <span>Kabupaten Bandung, Jawa Barat</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Durasi
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        21 Mei 2025 - 21 Agustus 2025
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Role
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Backend Developer
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Tipe Magang
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Fulltime
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-8 flex justify-end">
              <Link
                href="/dashboard/school/penempatan"
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default detailPenempatan;
