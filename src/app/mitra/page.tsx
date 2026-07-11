"use client";

import { Suspense } from "react";
import FooterPage from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { 
  Star,
  Search,
  MapPin,
  BriefcaseBusiness,
  ChevronRight,
  ChevronLeft,
  Users,
  GraduationCap
} from "lucide-react";
import { API, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import { useRouter, useSearchParams } from "next/navigation";

interface Partner {
  id: string;
  name: string;
  address: string;
  logo: string;
  type: string;
  openings_count?: number;
  students_count?: number;
  rating?: number;
}

export default function PartnerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerPageContent />
    </Suspense>
  );
}

function PartnerPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inputSearch, setInputSearch] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const searchParams = useSearchParams();
  const keyword = searchParams.get("search") || "";
  const [partners, setPartners] = useState<Partner[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const partnerPerPage = 9;

  const type = searchParams.get("type") || "company";
  const displayedPartners = (partners || []).filter((p) => p.type === type);

  const filteredPartners = displayedPartners.filter((partner) =>
    partner.name.toLowerCase().includes(search.toLowerCase())
  );

  const pageContent = {
    company: {
      title: "Mitra Industri",
      description:
        "Temukan peluang magang dari berbagai industri ternama. Daftar, lamar, dan mulai perjalanan kariermu bersama kami.",
    },
    school: {
      title: "Mitra Sekolah",
      description:
        "Jelajahi jaringan sekolah yang telah bekerja sama dengan Prakerin untuk mendukung pengembangan talenta muda Indonesia.",
    },
    university: {
      title: "Mitra Perguruan Tinggi",
      description:
        "Jelajahi jaringan perguruan tinggi yang telah bekerja sama dengan Prakerin untuk mendukung pengembangan talenta muda Indonesia.",
    },
  };
  const currentContent = pageContent[type as keyof typeof pageContent] ?? pageContent.company;

  const fetchData = async () => {
    try {
      const response = await API.get(ENDPOINTS.PARTNERS);
      setPartners(response.data.data);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setInputSearch(keyword);
    setSearch(keyword);
  }, [keyword]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  const totalPartnerPages = Math.ceil(filteredPartners.length / partnerPerPage);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * partnerPerPage,
    currentPage * partnerPerPage
  );

  return (
    <>
      <Navigation section={""} setSection={() => {}} />
      {isLoading && (
        <div className="fixed w-full inset-0 flex justify-center items-center h-screen z-50 bg-white">
          <Loader width={64} height={64} />
        </div>
      )}

      <main className="relative py-20 min-h-screen bg-white overflow-hidden">
        {/* Background Blobs for Visual Continuity with Landing Page */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-pulse" />
          <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-accent-light/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-accent-dark/5 blur-3xl animate-pulse" />
        </div>

        <div className="w-[85%] max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent mb-4">
              Jejaring Kemitraan Prakerin
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-4 bg-gradient-to-r from-accent via-accent to-accent-dark bg-clip-text text-transparent">
              {currentContent.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
              {currentContent.description}
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex flex-wrap md:justify-start gap-3 mb-8 border-b border-gray-100 pb-5">
            {[
              { id: "company", label: "Mitra Industri" },
              { id: "school", label: "Mitra Sekolah" },
              { id: "university", label: "Mitra Perguruan Tinggi" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  router.push(`/mitra?type=${tab.id}`);
                }}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  type === tab.id
                    ? "bg-gradient-to-r from-accent to-accent-light text-white shadow-md shadow-accent/25"
                    : "bg-slate-50 text-gray-600 hover:bg-slate-100 hover:text-gray-800 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-white/60 backdrop-blur-md shadow-lg shadow-gray-100/50 border border-gray-200/80 p-5 mb-8 rounded-2xl">
            <div className="relative my-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  onChange={(e) => setInputSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearch(inputSearch)}
                  value={inputSearch}
                  placeholder={`Cari nama ${type === 'company' ? 'mitra industri' : type === 'school' ? 'mitra sekolah' : 'perguruan tinggi'} di sini...`}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent rounded-xl bg-white text-gray-800 transition-all duration-200"
                />
              </div>
              <button
                onClick={() => setSearch(inputSearch)}
                className="bg-gradient-to-r from-accent to-accent-light text-white py-3.5 hover:shadow-lg hover:shadow-accent/20 hover:brightness-105 active:scale-95 duration-200 transition-all px-8 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                Cari Mitra
              </button>
            </div>
          </div>

          {/* Partner Cards Grid */}
          {paginatedPartners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPartners.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-150 p-6 shadow-md shadow-gray-100/40 hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Logo Section */}
                    <div className="mb-5 flex items-center justify-start h-14 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 max-w-max">
                      <img
                        src={
                          item.logo
                            ? item.logo.startsWith("pfpupload/")
                              ? getPhotoProfileUrl(item.logo) || ""
                              : `${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`
                            : "/images/default-logo.png"
                        }
                        alt={`${item.name} Logo`}
                        className="h-9 max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/PrakerinID_ico.svg"; // Fallback image
                        }}
                      />
                    </div>

                    {/* Partner Name */}
                    <h3 className="font-bold text-xl text-gray-800 mb-3 hover:text-accent transition-colors duration-200 line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Info Details */}
                    <div className="space-y-2 mb-6">
                      <div className="text-sm text-gray-500 flex items-start gap-2.5">
                        <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" /> 
                        <span className="line-clamp-2">{item.address}</span>
                      </div>
                      
                      {/* Dynamic Openings/Students count */}
                      <div className="text-sm text-gray-500 flex items-center gap-2.5">
                        {item.type === "company" ? (
                          <>
                            <BriefcaseBusiness className="w-5 h-5 text-accent shrink-0" />
                            <span>Jumlah Lowongan:</span>
                            <p className="font-semibold text-accent">{item.openings_count ?? 0}</p>
                          </>
                        ) : item.type === "school" ? (
                          <>
                            <Users className="w-5 h-5 text-accent shrink-0" />
                            <span>Jumlah Siswa:</span>
                            <p className="font-semibold text-accent">{item.students_count ?? 0}</p>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-5 h-5 text-accent shrink-0" />
                            <span>Jumlah Mahasiswa:</span>
                            <p className="font-semibold text-accent">{item.students_count ?? 0}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Divider */}
                    <hr className="border-gray-100 my-4" />

                    {/* Dynamic Rating */}
                    <div className="flex items-center justify-center gap-2.5 bg-slate-50/70 py-2.5 rounded-xl border border-slate-100">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      {item.rating && item.rating > 0 ? (
                        <span className="font-bold text-base text-gray-700">
                          {item.rating.toFixed(1)} / 5.0
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Belum ada penilaian</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 border border-dashed border-gray-200 rounded-3xl backdrop-blur-sm">
              <p className="text-gray-500 text-lg font-medium">Tidak ada mitra ditemukan</p>
              <p className="text-gray-400 text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPartnerPages > 1 && (
            <div className="flex justify-center items-center gap-2 my-16">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-slate-50 hover:text-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all duration-200"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPartnerPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded-full font-semibold text-sm transition-all duration-350 ${
                    currentPage === index + 1
                      ? "bg-gradient-to-r from-accent to-accent-light text-white shadow-md shadow-accent/20"
                      : "text-gray-600 hover:bg-slate-50 hover:text-accent border border-transparent"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPartnerPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-slate-50 hover:text-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all duration-200"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
      <FooterPage />
    </>
  );
}
