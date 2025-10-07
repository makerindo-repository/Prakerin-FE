"use client";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Funnel,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "../../../../../utils/config";
import Cookies from "js-cookie";
import { timeAgo } from "@/utils/timeAgo";

interface SaveJobOpening {
  id: string;
  title: string;
  company: {
    name: string;
  };
  city_regency: {
    name: string;
  };
  province: {
    name: string;
  };
  is_paid: boolean;
  updated_at: string;
  save_job_opening: boolean;
}

const LowonganArchivePage: React.FC = () => {
  const [saveJobOpenings, setSaveJobOpenings] = useState<SaveJobOpening[]>([]);

  const fetchSaveJobOpenings = async () => {
    try {
      const response = await API.get(ENDPOINTS.JOB_OPENINGS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        params: {
          is_saved: true,
        },
      });
      if (response.status === 200) {
        setSaveJobOpenings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching saved job openings:", error);
    }
  };

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
      if (response.status === 200 || response.status === 201) {
        await fetchSaveJobOpenings();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSaveJobOpenings();
  }, []);

  return (
    <main className=" p-6">
      <h1 className="text-accent-dark mb-5 text-sm">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/lowongan"}
        >
          Lowongan
        </Link>{" "}
        -&gt; Lowongan Tersimpan
      </h1>
      <div className="flex items-center space-x-2 mb-8 font-extrabold text-accent">
        <BriefcaseBusiness className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Lowongan Tersimpan</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {saveJobOpenings.length !== 0 ? (
          saveJobOpenings.map((job) => (
            <Link
              key={job.id}
              href={`lowongan/${job.id}`}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                {job.title}
              </h3>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">IG</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {job.company.name}
                    </h3>
                    <div className="flex text-sm text-gray-500 space-x-2">
                      <MapPin className="w-4 h-4 my-auto" />
                      <p className="">
                        {job.city_regency.name}, {job.province.name}
                      </p>
                    </div>
                  </div>
                </div>
                {job.is_paid && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Dibayar
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center border-t-2 border-gray-200 pt-3">
                <span className="text-gray-500 text-sm">
                  {timeAgo(job.updated_at)}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleClickFavorite(e, job.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      job.save_job_opening ? "text-blue-500" : "text-gray-400"
                    }`}
                    fill={job.save_job_opening ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500">Tidak ada lowongan yang disimpan.</p>
        )}
      </div>
    </main>
  );
};
export default LowonganArchivePage;
