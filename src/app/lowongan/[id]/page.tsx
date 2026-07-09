"use client";
import {
  Bookmark,
  Clock4,
  Lock,
  MapPin,
  MessageCircle,
  GraduationCap,
  Users,
  Clock,
  BriefcaseBusiness,
  Calendar,
  UserCircle,
  Building,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { API, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import DescriptionRenderer from "@/components/RenderBlocks";
import RenderBlocks from "@/components/RenderBlocks";
import Cookies from "js-cookie";

// import dayjs from "dayjs";
import { getDurationUnit } from "@/utils/getDurationUnit";
import { getTypeJobOpening } from "@/utils/getTypeJobOpening";
import Image, { ImageProps } from "next/image";
import Loader from "@/components/loader";
import { AxiosError } from "axios";
import { notFound, useRouter } from "next/navigation";

// ====== Helper: Image dengan fallback otomatis saat gagal dimuat (403/forbidden/404/dll) ======
interface ImageWithFallbackProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string | null | undefined;
  alt: string;
  fallback: React.ReactNode;
}

function ImageWithFallback({ src, alt, fallback, ...imageProps }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      unoptimized
      {...imageProps}
    />
  );
}
// ================================================================================================

interface Lowongan {
  id: string;
  title: string;
  description: any;
  grade: string;
  location: string;
  qouta: number;
  type: string;
  start_date: string;
  closing_date: string;
  company: {
    name: string;
  };
  city_regency: {
    name: string;
  };
  province: {
    name: string;
  };
  save_job_opening: boolean;
  user: {
    photo_profile: string;
  };
  duration: {
    duration_unit: string;
    duration_value: number;
  };
  field: {
    name: string;
  };
  test: Test[];
}

interface Test {
  title?: string;
  description?: string;
  type?: Type;
  link?: string;
}

type Type = "practice" | "theory" | "other";

const DetailLowonganPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const [data, setData] = useState<Lowongan>({
    id: "",
    title: "",
    description: "",
    grade: "",
    location: "",
    qouta: 0,
    type: "",
    start_date: "",
    closing_date: "",
    company: {
      name: "",
    },
    city_regency: {
      name: "",
    },
    province: {
      name: "",
    },
    save_job_opening: false,
    user: {
      photo_profile: "",
    },
    field: {
      name: "",
    },
    duration: {
      duration_unit: "",
      duration_value: 0,
    },
    test: [], // ubah menjadi array kosong agar bisa menerima data array
  }); // Replace 'any' with your actual data type
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClickFavorite = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await API.post(
        `${ENDPOINTS.SAVE_JOB_OPENINGS}`,
        {
          job_opening_id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      setData((prev) => ({
        ...prev,
        save_job_opening: !prev.save_job_opening,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const getGrade = (grade: "smk" | "mahasiswa" | "all"): string => {
    switch (grade) {
      case "smk":
        return "SMK";
      case "mahasiswa":
        return "Mahasiswa";
      case "all":
        return "Semua";
      default:
        return "";
    }
  };

  const getType = (type: "full_time" | "part_time"): string => {
    switch (type) {
      case "full_time":
        return "Penuh Waktu (Full-time)";
      case "part_time":
        return "Paruh Waktu (Part-time)";
      default:
        return "";
    }
  };

  const getLocation = (
    location: "onsite" | "remote" | "hybrid" | "field"
  ): string => {
    switch (location) {
      case "onsite":
        return "Kerja di kantor (Onsite/WFO)";
      case "remote":
        return "Kerja di jarak jauh (Remote/WFH)";
      case "hybrid":
        return "Campuran";
      case "field":
        return "Kerja lapangan (Field Work)";
      default:
        return "";
    }
  };

  const getTypeTest = (type: Type | undefined) => {
    if (type === "practice") {
      return "Test Praktik";
    } else {
      return "Test Teori";
    }
  };

  const fetchData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await API.get(`${ENDPOINTS.JOB_OPENINGS}/${id}`);
      setData(response.data.data);
      console.log("Data fetched successfully:", response.data.data);
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          await router.replace("/not-found");
        }
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <section className="flex flex-col items-center text-center justify-center mt-15">
        <h1 className="text-3xl font-bold text-accent mb-5">
          Details Lowongan Magang
        </h1>
        <p className="text-gray-500 text-xl">
          Temukan peluang magang dari berbagai perusahaan ternama. Daftar,
          lamar, dan mulai perjalanan kariermu bersama kami.
        </p>
      </section>

      <main className="p-6 w-8/10 m-auto mt-15">
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader height={64} width={64} />
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    {data.user?.photo_profile ? (
                      <div className="w-15 h-15 relative rounded-full border-white border">
                        <ImageWithFallback
                          src={getPhotoProfileUrl(data.user.photo_profile)}
                          alt="Logo Perusahaan"
                          fill
                          sizes="100%"
                          className="object-cover rounded-full"
                          fallback={<Building className="w-full h-full text-[var(--color-accent)]" />}
                        />
                      </div>
                    ) : (
                      <Building className="w-15 h-15 text-[var(--color-accent)]" />
                    )}

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                        {data && data.title}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-blue-600 font-medium">
                          {data && data.company.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {(data && data.city_regency?.name) ?? "N/A"},{" "}
                          {(data && data.province?.name) ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(!Cookies.get("authorization") || Cookies.get("authorization") === "student") && (
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                      {Cookies.get("authorization") === "student" && (
                        <button
                          type="button"
                          className={`flex items-center justify-center gap-2 hover:text-blue-600 hover:bg-white px-4 py-2 border border-gray-300 hover:border-blue-300 rounded-lg font-medium transition-colors cursor-pointer ${
                            data.save_job_opening
                              ? "text-white border-blue-500 bg-blue-500"
                              : "text-gray-400"
                          }`}
                          onClick={(e) => handleClickFavorite(e, data.id)}
                        >
                          <Bookmark
                            className={`w-4 h-4 `}
                            fill={data.save_job_opening ? "currentColor" : "none"}
                          />
                          <span>Simpan</span>
                        </button>
                      )}

                      <Link
                        href={Cookies.get("authorization") === "student" ? `/dashboard/lowongan/${id}/apply` : `/masuk`}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
                      >
                        Lamar Sekarang
                      </Link>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                <div className="bg-white py-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Lowongan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {/* Tingkat Pendidikan */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <GraduationCap className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Tingkat Pendidikan</p>
                        <p className="font-medium text-gray-900">
                          {getGrade(data.grade as "smk" | "mahasiswa" | "all")}
                        </p>
                      </div>
                    </div>

                    {/* Lokasi Magang */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Lokasi Magang</p>
                        <p className="font-medium text-gray-900">
                          {getLocation(
                            data.location as
                              | "onsite"
                              | "remote"
                              | "hybrid"
                              | "field"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Kuota Magang */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <Users className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Kuota Magang</p>
                        <p className="font-medium text-gray-900">
                          {data.qouta} Orang
                        </p>
                      </div>
                    </div>

                    {/* Jenis Magang */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <Clock className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Jenis Magang</p>
                        <p className="font-medium text-gray-900">
                          {getType(data.type as "full_time" | "part_time")}
                        </p>
                      </div>
                    </div>

                    {/* Bidang Magang */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <BriefcaseBusiness className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Bidang Magang</p>
                        <p className="font-medium text-gray-900">
                          {data.field.name}
                        </p>
                      </div>
                    </div>

                    {/* Durasi Magang */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <Calendar className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Durasi Magang</p>
                        <p className="font-medium text-gray-900">
                          {data.duration.duration_value}{" "}
                          {getDurationUnit(data.duration.duration_unit)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <Calendar className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Waktu Mulai Magang</p>
                        <p className="font-medium text-gray-900">
                          {data.start_date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                      <Calendar className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-500">Batas Pendaftaran</p>
                        <p className="font-medium text-gray-900">
                          {data.closing_date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Area - Placeholder for job description */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Deskripsi
                </h3>
                <div className="text-gray-600 py-6 mb-6">
                  <RenderBlocks data={data.description} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test
                </h3>
                <div className="py-6 mb-6">
                  {data.test &&
                    data.test.map((test, index) => (
                      <div key={index} className="bg-white shadow-md my-5 p-5">
                        <span className="text-lg font-medium">
                          {test.title}{" "}
                          <span className="text-gray-400">
                            - {getTypeTest(test.type)}
                          </span>
                        </span>
                        <p>{test.description}</p>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default DetailLowonganPage;
