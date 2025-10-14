import { CircleArrowRight, FileText, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import PieChartCompenent from "../Charts/PieChartCompenent";
import { API, ENDPOINTS } from "../../../utils/config";
import Cookies from "js-cookie";
import RatingSummaryCompenent from "../RatingSummaryCompenent";
import { RatingSummary } from "@/models/feedback";
import { mapRatingToData } from "@/utils/mapRatingToData";
import NotFoundComponent from "../NotFoundComponent";
import { Pages } from "@/models/pagination";

interface Feedback {
  id: string;
  name: string;
  major: string;
  schoolName: string;
  rate: number;
  text: string;
  user?: {
    photo_profile: File | null;
  };
}

const NonStudentFeedback = ({ authorization }: { authorization: string }) => {
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    rating_count: 0,
    average_rating: 0, 
    rating_1: 0,
    rating_2: 0,
    rating_3: 0,
    rating_4: 0,
    rating_5: 0,
  });

  const [fedback, setFeedback] = useState<Feedback[]> ([]);

  const [page, setPage] = useState<Pages>({
    activePages: 1,
    pages: 1,
  });

  const fetchRating = async () => {
    try {
      const rating = await API.get(`${ENDPOINTS.FEEDBACKS}/rating`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      setRatingSummary(rating.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFeedback = async (selectedPage = page.activePages) => {
    try {
      const response = await API.get(`${ENDPOINTS.FEEDBACKS}/ulasan`, {
        params: {
          page: selectedPage,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },

      });
      if (response.status === 200) {
        setFeedback(response.data.data);
        setPage({
          activePages: selectedPage,
          pages: response.data.last_page, // pastikan ini adalah total halaman
        });
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchRating();
  }, []);

  const ratingColors = ["#ff0000", "#ff6600", "#ffcc00", "#66cc00", "#009900"]; // contoh warna

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white rounded-lg shadow-sm p-3 px-5 flex flex-col justify-between">
        <div className="flex  mb-4   justify-between">
          <div className="flex flex-col ">
            <h3 className="font-bold text-lg">
              Penilaian {authorization === "company" ? "Perusahaan" : "Sekolah"}
            </h3>
            <p className="text-sm text-gray-600">
              {authorization === "company"
                ? "Penilaian didapat dari siswa/mahasiswa yang melakukan magang di perusahaan ini"
                : "Penilaian didapat dari siswa/mahasiswa dan perusahaan yang terdaftar sebagai pengguna Prakerin"}
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-1/2 ">
            <RatingSummaryCompenent data={ratingSummary} />
          </div>
          <div className="w-1/2 ">
            <PieChartCompenent
              legend="Presentase Penilaian"
              dataList={mapRatingToData(ratingSummary, ratingColors)}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-t-2xl  bg-accent">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari ulasan..."
              // value={inputSearch}
              // onChange={(e) => setInputSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-white placeholder-teal-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ulasan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penilaian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* {internshipApplications.map((application, index) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.school.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Masih dummy
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${changeStatusColor(
                      application.status
                    )}`}
                  >
                    {changeStatus(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span className="bg-green-500 rounded-full p-1">Unduh</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`lamaran/${application.id}`)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <CircleAlert size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))} */}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {/* {internshipApplications.map((application, index) => (
            <div key={application.id} className="p-4 -b -gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {application.student.name}
                </h3>
                <span className="text-sm text-gray-500">#{index + 1}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center">
                  <Download size={12} className="mr-1" />
                  Unduh
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center">
                  <Eye size={12} className="mr-1" />
                  Lihat
                </button>
              </div>

              <div className="flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Edit size={16} />
                </button>
                <button className="text-red-600 hover:text-red-800 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))} */}
          </div>

          {/* {internshipApplications.length === 0 && ( */}
          <div className="text-center py-12 col-span-2 ">
            <NotFoundComponent text="Tidak ada ulasan yang ditemukan." />
          </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default NonStudentFeedback;
