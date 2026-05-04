"use client";

import {
  Bookmark,
  BriefcaseBusiness,
  Lock,
  MapPin,
  MessageCircle,
  Users,
  Clock,
  Calendar,
  GraduationCap,
  Building,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "../../../../../utils/config";
import Cookies from "js-cookie";
import RenderBlocks from "@/components/RenderBlocks";
import Image from "next/image";
import { getDurationUnit } from "@/utils/getDurationUnit";
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";


interface JobOpening {
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

const DetailLowongan = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authorization, setAuthorization] = useState<string>("");
  const [jobOpening, setJobOpening] = useState<JobOpening>({
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
  });

  const fetchJobOpening = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await API.get(`${ENDPOINTS.JOB_OPENINGS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        console.log("Job Opening:", response.data.data);
        setJobOpening(response.data.data);
      }
      else {
        console.error("Non-200 response:", response.status, response.data);
      }
    } catch (error: any) {
      console.error("Error fetching job opening:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        error: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickFavorite = async (id: string) => {
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
      if (response.status === 200 || response.status === 201) {
        setJobOpening((prevJob) => ({
          ...prevJob,
          save_job_opening: !prevJob.save_job_opening,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobOpening();
    }
    setAuthorization(Cookies.get("authorization") as string);
  }, [id]);

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

  const getTypeTest = (type: Type | undefined): string => {
    if (type === "practice") {
      return "Test Praktik";
    } else {
      return "Test Teori";
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

  const handleDelete = async () => {
    try {
      const isConfirm = await alertConfirm(
        "Apakah anda yakin ingin menghapus lowongan ini?"
      );
      if (!isConfirm) return;

      setIsDeleting(true);
      await API.delete(`${ENDPOINTS.JOB_OPENINGS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      router.push("/dashboard/lowongan");
      await alertSuccess("Lowongan berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting job opening:", error);
      await alertError("Gagal menghapus lowongan");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/lowongan"}
        >
          Lowongan
        </Link>{" "}
        -&gt; Detail Lowongan
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <BriefcaseBusiness className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Detail Lowongan</h2>
        </div>
      </div>
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader height={64} width={64} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {jobOpening.user.photo_profile ? (
                      <div className="w-16 h-16 relative rounded-full border-white border">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${jobOpening.user.photo_profile}`}
                          alt="Logo Perusahaan"
                          fill
                          sizes="100%"
                          className="object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <Building className="w-16 h-16 text-[var(--color-accent)]" />
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                      {jobOpening.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-blue-600 font-medium">
                        {jobOpening.company.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {jobOpening.city_regency?.name ?? "N/A"},{" "}
                        {jobOpening.province?.name ?? "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                  {authorization === "student" ? (
                    <>
                      <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat Perusahaan</span>
                        <Lock className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        className={`flex items-center justify-center gap-2 hover:text-blue-600 hover:bg-white px-4 py-2 border border-gray-300 hover:border-blue-300 rounded-lg font-medium transition-colors cursor-pointer ${
                          jobOpening.save_job_opening
                            ? "text-white border-blue-500 bg-blue-500"
                            : "text-gray-400"
                        }`}
                        onClick={() => handleClickFavorite(id)}
                      >
                        <Bookmark
                          className={`w-4 h-4 `}
                          fill={
                            jobOpening.save_job_opening
                              ? "currentColor"
                              : "none"
                          }
                        />
                        <span>Simpan</span>
                      </button>

                      <Link
                        href={`${id}/apply`}
                        className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Lamar Sekarang
                      </Link>
                    </>                       
                  ) : (
                    <>
                      <Link
                        href={`/dashboard/lowongan/${id}/ubah`}
                        className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Ubah Lowongan
                      </Link>
                  <button
                    onClick={() => handleDelete()}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? "Menghapus..." : "Hapus"}</span>
                  </button>
                    </>
                  )}
                </div>
              </div>

              {/* Info Lowongan Section */}
              <div className="bg-white py-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Lowongan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Tingkat Pendidikan */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <GraduationCap className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Tingkat Pendidikan</p>
                      <p className="font-medium text-gray-900">
                        {getGrade(
                          jobOpening.grade as "smk" | "mahasiswa" | "all"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Lokasi Magang */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Lokasi Magang</p>
                      <p className="font-medium text-gray-900">
                        {getLocation(
                          jobOpening.location as
                            | "onsite"
                            | "remote"
                            | "hybrid"
                            | "field"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Kuota Magang */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <Users className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Kuota Magang</p>
                      <p className="font-medium text-gray-900">
                        {jobOpening.qouta} Orang
                      </p>
                    </div>
                  </div>

                  {/* Jenis Magang */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <Clock className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Jenis Magang</p>
                      <p className="font-medium text-gray-900">
                        {getType(jobOpening.type as "full_time" | "part_time")}
                      </p>
                    </div>
                  </div>

                  {/* Bidang Magang */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <BriefcaseBusiness className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Bidang Magang</p>
                      <p className="font-medium text-gray-900">
                        {jobOpening.field.name}
                      </p>
                    </div>
                  </div>

                  {/* Durasi Magang */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <Calendar className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Durasi Magang</p>
                      <p className="font-medium text-gray-900">
                        {jobOpening.duration.duration_value}{" "}
                        {getDurationUnit(jobOpening.duration.duration_unit)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <Calendar className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Waktu Mulai Magang</p>
                      <p className="font-medium text-gray-900">
                        {jobOpening.start_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm transition">
                    <Calendar className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Batas Pendaftaran</p>
                      <p className="font-medium text-gray-900">
                        {jobOpening.closing_date}
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
                <RenderBlocks data={jobOpening.description} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test</h3>
              <div className="py-6 mb-6">
                {jobOpening.test &&
                  jobOpening.test.map((test, index) => (
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
  );
};
export default DetailLowongan;
