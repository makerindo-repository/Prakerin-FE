"use client";

import {
  Bookmark,
  BriefcaseBusiness,
  Lock,
  MapPin,
  MessageCircle,
  UserCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import RenderBlocks from "@/components/RenderBlocks";
import Image from "next/image";
import { API, ENDPOINTS } from "../../../../../../utils/config";
import { useRouter } from "next/navigation";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";

interface JobOpening {
  title: string;
  description: any;
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
}

const DetailLowongan = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [jobOpening, setJobOpening] = useState<JobOpening>({
    title: "",
    description: "",
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
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<string>();

  const fetchJobOpening = async () => {
    try {
      console.log(id);
      const response = await API.get(`${ENDPOINTS.JOB_OPENINGS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        console.log("Job Opening:", response.data.data);
        setJobOpening(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching job opening:", error);
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

  const handleDelete = async (id: string) => {
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

      await alertSuccess("Lowongan berhasil dihapus!");
      router.push("/dashboard/lowongan");
    } catch (error) {
      console.error("Error deleting job opening:", error);
      await alertError("Gagal menghapus lowongan");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchJobOpening();
    setUserRole(Cookies.get("authorization"));
  }, []);

  const isCompanyOwner = userRole === "company";

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
                  <UserCircle className="w-16 h-16 text-[var(--color-accent)]" />
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
                    {jobOpening.city_regency.name}, {jobOpening.province.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              {!isCompanyOwner ? (
                <>
                  <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat Perusahaan</span>
                    <Lock className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleClickFavorite(id)}
                    className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 px-4 py-2 border border-gray-300 hover:border-blue-300 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        jobOpening.save_job_opening
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                      fill={
                        jobOpening.save_job_opening ? "currentColor" : "none"
                      }
                    />
                    <span>
                      {jobOpening.save_job_opening ? "Tersimpan" : "Simpan"}
                    </span>
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
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    Ubah Lowongan
                  </Link>
                  <button
                    onClick={() => handleDelete(id)}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? "Menghapus..." : "Hapus"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Content Area - Placeholder for job description */}
          <div className="mt-6 text-gray-600">
            <RenderBlocks data={jobOpening.description} />
          </div>
        </div>
      </div>
    </main>
  );
};
export default DetailLowongan;