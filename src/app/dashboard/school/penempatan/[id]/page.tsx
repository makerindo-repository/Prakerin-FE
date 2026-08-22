"use client";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Laptop,
  MapPin,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import Image from "next/image";
import Loader from "@/components/loader";

interface InternshipDetail {
  id: string;
  start_date: string | null;
  end_date: string | null;
  is_completed: boolean;
  role: string | null;
  type: "full_time" | "part_time" | null;
  location: "onsite" | "remote" | "hybrid" | null;
  company: {
    id: string;
    name: string;
    address: string | null;
    photo_profile: string | null;
    city_regency: {
      name: string;
      province: { name: string } | null;
    } | null;
  } | null;
}

interface StudentDetail {
  id: string;
  username: string;
  email: string;
  photo_profile: string | null;
  student: {
    name: string;
    class: string | null;
    status: "ongoing" | "not_started" | "completed";
    major: { name: string } | null;
  } | null;
  internship: InternshipDetail | null;
}

const DetailPenempatanPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [data, setData] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setData(response.data.data);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusMeta = (status?: string) => {
    switch (status) {
      case "ongoing":
        return { label: "Sedang Magang", className: "bg-green-100 text-green-800" };
      case "completed":
        return { label: "Selesai Magang", className: "bg-blue-100 text-blue-800" };
      case "not_started":
      default:
        return { label: "Belum Magang", className: "bg-yellow-100 text-yellow-800" };
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start && !end) return "-";
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const typeLabel = (type: string | null) =>
    type === "full_time" ? "Full Time" : type === "part_time" ? "Part Time" : "-";

  const locationLabel = (loc: string | null) =>
    loc === "onsite" ? "Onsite" : loc === "remote" ? "Remote" : loc === "hybrid" ? "Hybrid" : "-";

  const student = data?.student;
  const internship = data?.internship;
  const status = statusMeta(student?.status);
  const hasInternship = !!internship;

  const isUniversity = (Cookies.get("school_type") as string) === "university" || (data as any)?.student?.school?.type === "university";
  const labelType = isUniversity ? "Mahasiswa" : "Siswa";
  const majorLabel = isUniversity ? "Prodi belum diatur" : "Jurusan belum diatur";

  return (
    <main className="p-4 sm:p-6 md:p-8">
      <h1 className="text-accent-dark text-xs sm:text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href="/dashboard/school/penempatan"
        >
          Daftar Penempatan {labelType}
        </Link>{" "}
        -&gt; Detail Penempatan {labelType}
      </h1>

      <div className="mb-8 flex items-center gap-2 font-extrabold text-accent">
        <MapPin className="w-5 h-5" />
        <h2 className="text-xl sm:text-2xl mt-1">Detail Penempatan {labelType}</h2>
      </div>

      {isLoading ? (
        <div className="max-w-xl mx-auto">
          <Loader />
        </div>
      ) : !data ? (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
          Data {labelType.toLowerCase()} tidak ditemukan.
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Kartu info siswa/mahasiswa - selalu tampil */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-accent text-lg font-semibold">Informasi {labelType}</h2>
            </div>
            <div className="p-6 flex items-center gap-4">
              {data.photo_profile ? (
                <div className="w-16 h-16 relative rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${data.photo_profile}`}
                    alt={student?.name ?? "Foto profil"}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-accent" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {student?.name ?? "-"}
                </h3>
                <div className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {isUniversity ? "Semester / Kelas" : "Kelas"} {student?.class ?? "-"} · {student?.major?.name ?? majorLabel}
                  </span>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          {/* Kartu magang, atau empty state kalau belum magang */}
          {hasInternship ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-accent text-lg font-semibold">Informasi Magang</h2>
                {internship?.is_completed && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Selesai
                  </span>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                    {internship?.company?.photo_profile ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${internship.company.photo_profile}`}
                        alt={internship.company?.name ?? "Logo perusahaan"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Building2 className="w-9 h-9 text-accent" />
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {internship?.company?.name ?? "-"}
                  </h4>
                  {internship?.company?.city_regency && (
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {internship.company.city_regency.name}
                        {internship.company.city_regency.province
                          ? `, ${internship.company.city_regency.province.name}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Durasi</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDuration(internship?.start_date ?? null, internship?.end_date ?? null)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Posisi</div>
                      <div className="text-sm font-medium text-gray-900">
                        {internship?.role ?? "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Tipe Magang</div>
                      <div className="text-sm font-medium text-gray-900">
                        {typeLabel(internship?.type ?? null)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Laptop className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Lokasi Kerja</div>
                      <div className="text-sm font-medium text-gray-900">
                        {locationLabel(internship?.location ?? null)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
                <Search className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Belum Ada Penempatan Magang
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                {student?.name ?? "Siswa ini"} belum mendapatkan tempat magang. Ajak siswa untuk
                mulai melamar lowongan yang tersedia.
              </p>
              <Link
                href="/dashboard/lowongan"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium text-sm"
              >
                <Briefcase className="w-4 h-4" />
                Lihat Lowongan Magang
              </Link>
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href="/dashboard/school/penempatan"
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-colors"
            >
              Kembali
            </Link>
          </div>
        </div>
      )}
    </main>
  );
};

export default DetailPenempatanPage;