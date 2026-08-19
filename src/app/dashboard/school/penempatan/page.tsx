"use client";
import {
  BriefcaseBusiness,
  Building,
  MapPin,
  Search,
  User,
  CircleArrowRight,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";

interface Student {
  id: number;
  job?: string;
  photo_profile: string | null;
  student: {
    name: string;
    company: {
      name: string;
      user: {
        photo_profile: string | null;
      };
      province: {
        name: string;
      };
      city_regency: {
        name: string;
      };
    }[];
  };
}

const PerusahaanPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedQuery = useDebounce(searchTerm, 500);
  const [data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState({ total_student_internship: "" });

  // Track image errors per item
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userRes, countRes] = await Promise.all([
        API.get(`${ENDPOINTS.USERS}`, {
          params: {
            is_verified: true,
            page: 1,
            limit: 10,
            role: "student",
            status: "ongoing",
            search: debouncedQuery,
          },
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        }),
        API.get(`${ENDPOINTS.USERS}/count`, {
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        }),
      ]);
      setData(userRes.data.data ?? []);
      setCount(countRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedQuery]);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        Daftar Penempatan Siswa/Mahasiswa
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <MapPin className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar Penempatan Siswa/Mahasiswa</h2>
        </div>
      </div>

      <div className="lg:flex lg:justify-between items-end mb-5">
        <div className="bg-white p-3 rounded-2xl flex items-center justify-between space-x-5 px-5 mb-5 lg:mb-0">
          <div className="text-black">
            <h1 className="text-2xl font-extrabold">
              {count.total_student_internship}
            </h1>
            <span className="text-sm">Total Siswa/Mahasiswa Magang</span>
          </div>
          <BriefcaseBusiness className="w-10 h-10 text-accent" />
        </div>
        <div className="relative flex-1 bg-white rounded-2xl shadow-md">
          <input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            placeholder="Cari penempatan siswa/mahasiswa..."
            className="text-gray-600 w-full px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent rounded-2xl transition-all duration-300"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/5 text-gray-700 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold whitespace-nowrap">Siswa/Mahasiswa</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Role</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Perusahaan</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Lokasi</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 relative flex-shrink-0 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
                          {item.photo_profile && !imageErrors[`student-${item.id}`] ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.photo_profile}`}
                              alt="Foto Siswa"
                              fill
                              sizes="40px"
                              className="object-cover rounded-full"
                              onError={() =>
                                setImageErrors((prev) => ({
                                  ...prev,
                                  [`student-${item.id}`]: true,
                                }))
                              }
                            />
                          ) : (
                            <User className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {item.student?.name ?? "Nama Tidak Tersedia"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.job ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          {item.job}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 relative flex-shrink-0 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
                          {item.student?.company?.[0]?.user?.photo_profile &&
                          !imageErrors[`company-${item.id}`] ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.student.company[0].user.photo_profile}`}
                              alt="Logo Perusahaan"
                              fill
                              sizes="32px"
                              className="object-cover rounded-full"
                              onError={() =>
                                setImageErrors((prev) => ({
                                  ...prev,
                                  [`company-${item.id}`]: true,
                                }))
                              }
                            />
                          ) : (
                            <Building className="w-4 h-4 text-accent" />
                          )}
                        </div>
                        <div className="font-medium text-gray-700">
                          {item.student?.company?.[0]?.name ?? "Belum ada perusahaan"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="line-clamp-1">
                          {item.student?.company?.[0]?.city_regency?.name ?? "-"},{" "}
                          {item.student?.company?.[0]?.province?.name ?? "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/dashboard/school/penempatan/${item.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
                        title="Lihat Detail"
                      >
                        <CircleArrowRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
          <p className="text-gray-500">
            Tidak ada daftar penempatan siswa/mahasiswa yang ditemukan
          </p>
        </div>
      )}
    </main>
  );
};

export default PerusahaanPage;