"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Search,
  Loader2,
  Building,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  MapPin,
  Clock,
  Briefcase
} from "lucide-react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import Link from "next/link";
import { alertError } from "@/libs/alert";

interface MatchResult {
  job_opening_id: string;
  title: string;
  company_name: string;
  match_score: number;
  explanation: string;
}

export default function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [suggestedPrompts] = useState([
    "Saya ingin magang sebagai Frontend Developer menggunakan React di Bandung",
    "Mencari lowongan UI/UX Designer yang berlokasi di Jakarta secara WFO",
    "Magang bidang Network Engineer atau IT Support untuk lulusan SMK",
    "Posisi Mobile App Developer dengan durasi magang 3 bulan"
  ]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const response = await createApiCall({
        url: "/ai-analytics/search",
        method: "POST",
        data: { query: searchQuery },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      if (response && response.success && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
        if (response && response.message) {
          alertError(response.message);
        }
      }
    } catch (err: any) {
      console.error(err);
      alertError(err?.response?.data?.message || "Terjadi kesalahan saat memproses pencarian AI.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-blue-500 bg-blue-50 border-blue-200";
    return "text-amber-500 bg-amber-50 border-amber-200";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-xs sm:text-sm text-gray-400 font-medium tracking-wider uppercase">AI Core</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="p-2.5 bg-gradient-to-tr from-[#035a70] to-[#04829e] rounded-xl text-white shadow-md shadow-[#035a70]/10">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                Asisten Pencarian AI
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Temukan lowongan magang terbaik menggunakan kecerdasan buatan berbasis deskripsi minat Anda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SEARCH INPUT ─── */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Ketik keahlian Anda, lokasi yang diinginkan, dan minat Anda... (Contoh: Saya menguasai React dan ingin magang WFH)"
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#035a70]/20 focus:border-[#035a70] transition-all resize-none"
            disabled={loading}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="absolute right-3.5 bottom-3.5 p-2 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-lg transition-colors disabled:opacity-50"
            aria-label="Cari dengan AI"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Suggestion Prompts */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coba cari dengan contoh ini:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleSearch(p);
                }}
                disabled={loading}
                className="text-xs px-3.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SEARCH RESULTS ─── */}
      <div className="space-y-6">
        {loading && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#035a70]" />
              <Brain className="w-5 h-5 text-[#035a70] absolute animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Menghubungkan ke Gemini AI...</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Kami sedang mencocokkan profil minat Anda dengan database lowongan magang aktif kami.
              </p>
            </div>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Tidak Ada Hasil yang Cocok</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Maaf, AI kami tidak menemukan lowongan magang yang cocok dengan deskripsi tersebut saat ini. Silakan coba kueri yang lain.
              </p>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Hasil Pencocokan AI Terbaik</h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 border border-teal-200 text-[#035a70] rounded-full flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {results.length} Rekomendasi Ditemukan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-150 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-gray-800 text-lg group-hover:text-[#035a70] transition-colors leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                          <Building className="w-3.5 h-3.5" />
                          {item.company_name}
                        </p>
                      </div>
                      
                      <div className={`px-2.5 py-1 text-xs font-bold border rounded-full shrink-0 ${getScoreColor(item.match_score)}`}>
                        {item.match_score}% Match
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(item.match_score)}`}
                        style={{ width: `${item.match_score}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed pt-1">
                      {item.explanation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-end">
                    <Link
                      href={`/dashboard/lowongan/${item.job_opening_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#035a70] group-hover:text-[#04829e] transition-colors cursor-pointer"
                    >
                      Detail Lowongan
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
