import { CircleArrowRight, FileText, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import PieChartCompenent from "../Charts/PieChartCompenent";
import { API, ENDPOINTS } from "@/utils/config";
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
    fetchFeedback();
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
                {fedback.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(page.activePages - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* created_at not in model yet — show em-dash until API includes it */}
                      —
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.text || <span className="text-gray-400 italic">Tidak ada ulasan</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < item.rate ? "text-yellow-400" : "text-gray-200"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`#`} className="flex items-center gap-1 text-accent font-medium">
                        <CircleArrowRight size={16} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {fedback.map((item, index) => (
              <div key={item.id} className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <span className="text-sm text-gray-500">#{(page.activePages - 1) * 10 + index + 1}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.text}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < item.rate ? "text-yellow-400" : "text-gray-200"}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {fedback.length === 0 && (
            <div className="text-center py-12 col-span-2">
              <NotFoundComponent text="Tidak ada ulasan yang ditemukan." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NonStudentFeedback;
