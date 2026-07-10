"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import {
  Trophy,
  Star,
  Printer,
  Share2,
  Calendar,
  RefreshCw,
  Award,
  AlertCircle,
  FileDown,
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  role: string;
}

interface StudentAwardData {
  id: string;
  award: {
    name: string;
    description: string | null;
    category: string;
    point_value: number;
  };
  reason: string | null;
  awarded_at: string;
  awarded_by?: { username: string };
}

export default function MyAwardsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [awards, setAwards] = useState<StudentAwardData[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileAndAwards = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const profileRes = await createApiCall({ url: "/users/profile", headers });
      const user = profileRes?.data;
      setProfile(user);

      if (user) {
        const awardsRes = await createApiCall({
          url: `/students/${user.id}/awards`,
          headers
        });
        setAwards(awardsRes?.awards || []);
        setTotalPoints(awardsRes?.total_points || 0);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat penghargaan Anda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndAwards();
  }, []);

  const handlePrintCertificate = (studentAwardId: string, studentName: string, awardName: string) => {
    const token = Cookies.get("userToken");
    // Directly open the pdf download endpoint in a new tab
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/student-awards/${studentAwardId}/certificate?token=${token}`;
    window.open(url, "_blank");
  };

  const handleShare = (awardName: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Penghargaan Saya',
        text: `Saya baru saja mendapatkan penghargaan "${awardName}" di program Prakerin!`,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      alert(`Bagikan Pencapaian: "Saya baru saja mendapatkan penghargaan '${awardName}' di program Prakerin!"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-[#035a70] w-7 h-7" />
            Penghargaan Saya
          </h1>
          <p className="text-gray-500 text-sm">
            Lihat pencapaian lencana dan sertifikat penghargaan yang telah Anda peroleh.
          </p>
        </div>
        <button
          onClick={fetchProfileAndAwards}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Perbarui
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <RefreshCw className="w-8 h-8 text-[#035a70] animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total Points Overview */}
          <div className="bg-gradient-to-r from-[#035a70] to-[#04728d] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl text-yellow-300">
                <Star className="w-8 h-8 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Total Poin Pencapaian</h2>
                <p className="text-white/80 text-xs mt-0.5">Akumulasi poin dari seluruh penghargaan Anda.</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <span className="text-5xl font-black text-yellow-300">{totalPoints}</span>
              <span className="text-sm font-semibold ml-2 text-white/90">Poin</span>
            </div>
          </div>

          {/* Awards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.length > 0 ? (
              awards.map((sa) => (
                <div key={sa.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                      <Trophy className="w-6 h-6 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                      {sa.award.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{sa.award.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      {sa.award.description || "Lencana pencapaian luar biasa."}
                    </p>
                    {sa.reason && (
                      <div className="mt-3 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 text-xs italic text-gray-600">
                        "{sa.reason}"
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-50 pt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sa.awarded_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      <span className="text-yellow-600 font-bold">+{sa.award.point_value} Poin</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrintCertificate(sa.id, profile?.username || "Siswa", sa.award.name)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Sertifikat
                      </button>
                      <button
                        onClick={() => handleShare(sa.award.name)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                        title="Bagikan"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-16 bg-white border border-gray-100 rounded-2xl text-center text-gray-400 font-medium">
                Anda belum menerima penghargaan apapun. Tetap semangat belajar! 🚀
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
