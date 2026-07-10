"use client";

import React, { useEffect, useState } from "react";
import { createApiCall, getPhotoProfileUrl } from "@/utils/config";
import {
  Trophy,
  Star,
  Search,
  RefreshCw,
  Award,
  ChevronLeft,
  Medal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface LeaderboardUser {
  student_user_id: string;
  student_name: string | null;
  username: string;
  photo_profile: string | null;
  total_points: number;
  awards_count: number;
  top_awards?: Array<{ name: string; category: string }>;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = "/awards/leaderboard";
      if (categoryFilter) {
        url += `?category=${categoryFilter}`;
      }
      const res = await createApiCall({ url });
      setLeaderboard(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [categoryFilter]);

  const filteredLeaderboard = leaderboard.filter((item) => {
    const name = item.student_name || item.username || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-yellow-200 border-yellow-300";
      case 2:
        return "bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-slate-100 border-slate-200";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-100 border-amber-500";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getRankStarColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-amber-700";
    return "text-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#035a70] to-[#04728d] text-white py-12 px-6 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors mb-3"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              <Trophy className="text-yellow-300 w-9 h-9 fill-current animate-bounce" />
              Leaderboard Prestasi
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              Daftar peringkat siswa magang berprestasi berdasarkan total akumulasi poin lencana penghargaan.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-6 py-4 rounded-2xl border border-white/10">
            <Sparkles className="text-yellow-300 w-7 h-7" />
            <div className="text-right">
              <span className="text-2xl font-black block text-yellow-300">{leaderboard.length}</span>
              <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Siswa Berprestasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-25 space-y-6">
        {/* Filters Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Cari nama siswa berprestasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] w-full sm:w-44"
            >
              <option value="">Semua Kategori</option>
              <option value="achievement">Achievement</option>
              <option value="excellence">Excellence</option>
              <option value="participation">Participation</option>
              <option value="special">Special Award</option>
            </select>

            <button
              onClick={fetchLeaderboard}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              title="Perbarui"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Podium Top 3 (Only if leaderboard is populated) */}
        {filteredLeaderboard.length >= 3 && search === "" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Rank 2 (Silver) */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center order-2 md:order-1 md:mt-6 relative">
              <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
                Rank 2
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden relative shadow-sm">
                <img
                  src={getPhotoProfileUrl(filteredLeaderboard[1].photo_profile) || "/default_avatar.png"}
                  alt={filteredLeaderboard[1].student_name || filteredLeaderboard[1].username}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-gray-800 mt-4 text-base">{filteredLeaderboard[1].student_name || filteredLeaderboard[1].username}</h3>
              <span className="text-[10px] text-gray-500 font-semibold mt-0.5">@{filteredLeaderboard[1].username}</span>
              <div className="text-2xl font-black text-slate-500 mt-2">{filteredLeaderboard[1].total_points} Poin</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{filteredLeaderboard[1].awards_count} Penghargaan diraih</div>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="bg-gradient-to-b from-yellow-50/50 to-white rounded-2xl shadow-xl border-2 border-yellow-200 p-8 flex flex-col items-center text-center order-1 md:order-2 transform md:-translate-y-4 relative">
              <div className="absolute -top-3 px-4 py-1 bg-yellow-400 text-white text-xs font-extrabold rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 fill-current" />
                Juara 1
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden relative shadow-md">
                <img
                  src={getPhotoProfileUrl(filteredLeaderboard[0].photo_profile) || "/default_avatar.png"}
                  alt={filteredLeaderboard[0].student_name || filteredLeaderboard[0].username}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-black text-gray-900 mt-4 text-lg">{filteredLeaderboard[0].student_name || filteredLeaderboard[0].username}</h3>
              <span className="text-xs text-yellow-600 font-bold mt-0.5">@{filteredLeaderboard[0].username}</span>
              <div className="text-3xl font-black text-yellow-500 mt-3">{filteredLeaderboard[0].total_points} Poin</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">{filteredLeaderboard[0].awards_count} Penghargaan diraih</div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center order-3 md:order-3 md:mt-10 relative">
              <div className="absolute top-4 left-4 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Rank 3
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-amber-600 overflow-hidden relative shadow-sm">
                <img
                  src={getPhotoProfileUrl(filteredLeaderboard[2].photo_profile) || "/default_avatar.png"}
                  alt={filteredLeaderboard[2].student_name || filteredLeaderboard[2].username}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-gray-800 mt-4 text-base">{filteredLeaderboard[2].student_name || filteredLeaderboard[2].username}</h3>
              <span className="text-[10px] text-gray-500 font-semibold mt-0.5">@{filteredLeaderboard[2].username}</span>
              <div className="text-2xl font-black text-amber-700 mt-2">{filteredLeaderboard[2].total_points} Poin</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{filteredLeaderboard[2].awards_count} Penghargaan diraih</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table List */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100">
            <RefreshCw className="w-8 h-8 text-[#035a70] animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <th className="py-3.5 px-6 font-bold text-center w-16">Peringkat</th>
                    <th className="py-3.5 px-6 font-bold">Nama Lengkap</th>
                    <th className="py-3.5 px-6 font-bold text-center">Jumlah Lencana</th>
                    <th className="py-3.5 px-6 font-bold">Lencana Terpopuler</th>
                    <th className="py-3.5 px-6 font-bold text-right">Skor Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard.map((item, index) => {
                      const rank = index + 1;
                      return (
                        <tr key={item.student_user_id} className="hover:bg-gray-50/50">
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${getRankBadgeColor(rank)}`}>
                              {rank}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                                <img
                                  src={getPhotoProfileUrl(item.photo_profile) || "/default_avatar.png"}
                                  alt={item.student_name || item.username}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 block text-sm">
                                  {item.student_name || item.username}
                                </span>
                                <span className="text-xs text-gray-400 block mt-0.5">@{item.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-[#035a70]">
                            {item.awards_count}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-1.5 flex-wrap">
                              {item.top_awards && item.top_awards.length > 0 ? (
                                item.top_awards.map((aw, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1"
                                    title={aw.name}
                                  >
                                    <Star className={`w-3 h-3 fill-current ${getRankStarColor(rank)}`} />
                                    {aw.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-black text-lg text-gray-800">
                            {item.total_points}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                        Tidak ada data siswa berprestasi ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
