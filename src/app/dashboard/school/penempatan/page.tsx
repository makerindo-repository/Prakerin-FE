"use client";
import {
  BriefcaseBusiness,
  Building,
  MapPin,
  Search,
  User,
  CircleArrowRight,
  GraduationCap,
  School,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import NotFoundComponent from "@/components/NotFoundComponent";
import LoaderData from "@/components/loader";

interface Student {
  id: number;
  job?: string;
  photo_profile?: string | null;
  student?: {
    name?: string;
    company?: {
      name?: string;
      user?: {
        photo_profile?: string | null;
      };
      province?: {
        name?: string;
      };
      city_regency?: {
        name?: string;
      };
    }[];
  };
}

type SchoolType = "school" | "university";

const PerusahaanPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedQuery = useDebounce(searchTerm, 500);
  const [data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState({ total_student_internship: "" });
  
  // Institution & role detection
  const [userRole, setUserRole] = useState<string>("");
  const [institutionType, setInstitutionType] = useState<SchoolType>("school");
  const [activeTab, setActiveTab] = useState<SchoolType>("school");

  // Track image errors per item
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Detect role and institution type on mount
  useEffect(() => {
    const roleCookie = Cookies.get("authorization") || "";
    const typeCookie = (Cookies.get("school_type") as SchoolType) || "school";
    setUserRole(roleCookie);
    setInstitutionType(typeCookie);
    setActiveTab(typeCookie);

    // Also fetch fresh profile to ensure accuracy
    API.get(`${ENDPOINTS.USERS}/profile`, {
      headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
    })
      .then((res) => {
        const u = res.data?.data;
        if (u) {
          setUserRole(u.role || roleCookie);
          const detectedType: SchoolType = u.school?.type === "university" ? "university" : "school";
          setInstitutionType(detectedType);
          if (u.role !== "super_admin") {
            setActiveTab(detectedType);
          }
        }
      })
      .catch(() => {});
  }, []);

  const isSuperAdmin = userRole === "super_admin";
  const isUniversity = isSuperAdmin ? activeTab === "university" : institutionType === "university";
  const targetType = isSuperAdmin ? activeTab : institutionType;

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
            school_type: targetType,
          },
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        }),
        API.get(`${ENDPOINTS.USERS}/count`, {
          params: { school_type: targetType },
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        }),
      ]);
      setData(Array.isArray(userRes.data.data) ? userRes.data.data : []);
      setCount(countRes.data.data ?? { total_student_internship: "-" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedQuery, activeTab, institutionType, userRole]);

  const handleTabChange = (tab: SchoolType) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  const labelType = isUniversity ? "Mahasiswa" : "Siswa";

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        Daftar Penempatan {labelType}
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <MapPin className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar Penempatan {labelType}</h2>
        </div>
      </div>

      <div className="lg:flex lg:justify-between items-end mb-5">
        <div className="bg-white p-3 rounded-2xl flex items-center justify-between space-x-5 px-5 mb-5 lg:mb-0 w-full lg:w-max">
          <div className="text-black">
            <h1 className="text-2xl font-extrabold">
              {count.total_student_internship || "-"}
            </h1>
            <span className="text-sm">Total {labelType} Magang</span>
          </div>
          <BriefcaseBusiness className="w-10 h-10 text-accent" />
        </div>
      </div>

      {/* Tab Toggle — only visible for super_admin who manages both types */}
      {isSuperAdmin && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => handleTabChange("school")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "school"
                ? "bg-accent text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-accent hover:text-accent"
            }`}
          >
            <School className="w-4 h-4" />
            Siswa (SMA/SMK)
          </button>
          <button
            onClick={() => handleTabChange("university")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "university"
                ? "bg-accent text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-accent hover:text-accent"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Mahasiswa (Perguruan Tinggi)
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
          <input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            placeholder={`Cari penempatan ${labelType.toLowerCase()}...`}
            className="w-full bg-accent text-white pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-transparent transition-colors placeholder:text-white/70"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">{labelType}</th>
                <th className="text-left p-3 font-medium text-gray-600">Posisi</th>
                <th className="text-left p-3 font-medium text-gray-600">Perusahaan</th>
                <th className="text-left p-3 font-medium text-gray-600">Lokasi</th>
                <th className="text-center p-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 && isLoading !== true ? (
                data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 relative flex-shrink-0 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
                          {item.photo_profile && !imageErrors[`student-${item.id}`] ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.photo_profile}`}
                              alt={`Foto ${labelType}`}
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
                    <td className="p-4 text-gray-800">
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
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${item.student?.company?.[0]?.user?.photo_profile}`}
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
                ))
              ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    <LoaderData />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {data.length === 0 && isLoading === false && (
          <div className="text-center py-12">
            <NotFoundComponent text={`Tidak ada daftar penempatan ${labelType.toLowerCase()} yang ditemukan`} />
          </div>
        )}
      </div>
    </main>
  );
};

export default PerusahaanPage;