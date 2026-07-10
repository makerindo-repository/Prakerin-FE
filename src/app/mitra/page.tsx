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
  ChevronLeft
} from "lucide-react";
import { API, ENDPOINTS } from "@/utils/config";
import { useRouter, useSearchParams } from "next/navigation";

interface Partner {
  id: string;
  name: string;
  address: string;
  logo: string;
  type: string;
}

export default function PartnerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerPageContent />
    </Suspense>
  )
}

function PartnerPageContent() {
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

  const filteredPartners = displayedPartners.filter((partner) => partner.name.toLowerCase().includes(search.toLowerCase()));
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
      console.log(response.data.data);
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
const paginatedPartners = filteredPartners.slice((currentPage - 1) * partnerPerPage, currentPage * partnerPerPage);

  return (
    <>
      <Navigation section={""} setSection={() => {}} />
      {isLoading && (
        <div className="fixed w-full inset-0 flex justify-center items-center h-screen z-10 bg-white">
          <Loader width={64} height={64} />
        </div>
      )}
      <section className="mt-15">
        <div className="w-[85%] mx-auto">
          <div>
            <h1 className="text-6xl font-bold text-left mb-3 bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
              {currentContent.title}
            </h1>
            <p className="text-black text-xl text-left mb-4 break-words whitespace-normal">
              {currentContent.description}
            </p>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 p-6 mb-4 rounded-xl">
            <div className="relative my-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              <input
                type="text"
                onChange={(e) => setInputSearch(e.target.value)}
                value={inputSearch}
                placeholder="Cari mitra disini..."
                className="w-full pl-4 pr-4 py-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
              />
              <button
                onClick={() => setSearch(inputSearch)}
                className="bg-gradient-to-r from-accent to-accent-light text-white py-3 hover:from-accent-light hover:to-accent-light duration-300 transition-all px-6 py-3 rounded-xl"
              >
                <Search className="w-6 h-6 text-white-400" />
              </button>
            </div>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPartners.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                {/* Logo */}
                <div className="mb-4">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                    alt="Company Logo"
                    className="h-12 object-contain"
                  />
                </div>

                {/* Company Name */}
                <h3 className="font-bold text-lg text-gray-800">
                  {item.name}
                </h3>

                {/* Location */}
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> <span>{item.address}</span>
                </div>
                {/* Openings */}
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <BriefcaseBusiness className="w-5 h-5" /> <span>Jumlah Lowongan:</span><p className="text-blue-500">45</p>
                  {/* Cari cara untuk dapet jumlah lowongan, entah mau diambil dari tabel companies atau partners */}
                </div>

                {/* Gap */}
                <div className="h-6" />

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-2xl bg-gradient-to-r from-accent-dark via-accent to-accent-light bg-clip-text text-transparent">6,7</span>
                  {/* Cari cara untuk dapet rating, entah mau diambil dari tabel companies atau partners */}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2 my-16">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-2 disabled:opacity-40"
            >
              <ChevronLeft />
            </button>

            {Array.from({ length: totalPartnerPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === index + 1
                    ? "bg-gradient-to-r from-accent to-accent-light text-white"
                    : ""
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPartnerPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-2 disabled:opacity-40"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
      <FooterPage />
    </>
  );
}
