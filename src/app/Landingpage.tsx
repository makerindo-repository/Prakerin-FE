"use client";

import { ArrowRight, CheckCircle2, Inbox, Search, Users2, ChevronLeft, ChevronRight, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Partner {
  id: string;
  name: string;
  address: string;
  logo: string;
  type: string;
}

interface CommentPrakerin {
  id: string;
  photo_profile: string | null;
  user?: {
    photo_profile?: string | null;
  };
  name: string;
  position: string;
  comment: string;
  created_at: string;
}

interface JobOpening {
  id: string;
  title: string;
  grade: string;
  location: "onsite" | "remote" | "hybrid";
  is_paid: boolean;
  is_available: boolean;
  qouta: number;

  start_date: string;
  closing_date: string;
  created_at: string;
  updated_at: string;

  company: {
    id: string;
    name: string;
  };

  province: {
    id: string;
    name: string;
  };

  city_regency: {
    id: string;
    name: string;
  };

  field: {
    id: string;
    name: string;
  };

  duration: {
    id: string;
    duration_value: number;
    duration_unit: string;
  };

  user: {
    id: string;
    username: string;
    photo_profile: string | null;
    email: string;
  };
}

interface ProvinceAndCityRegencyAndField {
  id: string;
  name: string;
}

interface Duration {
  id: string;
  duration_value: number;
  duration_unit: string;
}

interface Filter {
  province_id: string;
  city_regency_id: string;
  grade: string;
  field_id: string;
  duration_id: string;
}


export default function LandingPage({
  homepages,
  partners,
  comments,
  jobOpenings,
}: {
  homepages: any;
  partners: Partner[];
  comments: CommentPrakerin[];
  jobOpenings: JobOpening[]
}) {
  const router = useRouter();

  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const commentsPerPage = 3;
  const [schoolPage, setSchoolPage] = useState(1);
  const schoolPerPage = 8;
  const [universityPage, setUniversityPage] = useState(1);
  const universityPerPage = 8;
  const [companyPage, setCompanyPage] = useState(1);
  const companyPerPage = 8;
  const [jobPage, setJobPage] = useState(1);
  const jobsPerPage = 6;

  const [inputSearch, setInputSearch] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [partnerTab, setPartnerTab] = useState<"school" | "university">("school");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeComment, setActiveComment] = useState<CommentPrakerin | null>(null);
  const [truncatedComments, setTruncatedComments] = useState<Record<string, boolean>>({});
  const commentRefs = useState<Map<string, HTMLParagraphElement>>(new Map())[0];
  const observers = useState<Map<string, ResizeObserver>>(new Map())[0];

  const [filterData, setFilterData] = useState<Filter>({
    province_id: "",
    city_regency_id: "",
    grade: "",
    field_id: "",
    duration_id: "",
  });

  const [provinces, setProvinces] = useState<ProvinceAndCityRegencyAndField[]>(
    []
  );
  const [cityRegencies, setCityRegencies] = useState<
    ProvinceAndCityRegencyAndField[]
  >([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [fields, setFields] = useState<ProvinceAndCityRegencyAndField[]>([]);

  const registerCommentRef = (el: HTMLParagraphElement | null
    , id: string) => {
    const cleanup = () => {
      const existing = observers.get(id);
      if (existing) existing.disconnect();
      observers.delete(id);
      commentRefs.delete(id);
    };

    if (!el) {
      cleanup();
      return;
    }

    cleanup();
    commentRefs.set(id, el);

    const checkTruncate = () => {
      try {
        const truncated = el.scrollHeight > el.clientHeight + 1;
        setTruncatedComments((prev) =>
          prev[id] === truncated ? prev : { ...prev, [id]: truncated }
        );
      } catch {}
    };

    checkTruncate();
    const ro = new ResizeObserver(() => checkTruncate());
    ro.observe(el);
    observers.set(id, ro);
  };

  const handleSearch = () => {
    if (inputSearch.trim() !== "") {
      router.push(`/lowongan?search=${encodeURIComponent(inputSearch)}`);
    }
  };
  const handleFilterChange = (
    key: keyof Filter,
    value: string
  ) => {
    setFilterData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const schoolPartners = (partners || []).filter((p) => p.type === "school");
  const universityPartners = (partners || []).filter((p) => p.type === "university");
  const companyPartners = (partners || []).filter((p) => p.type === "company");

  // "sElAlU DuPlIcAtE UnTuK InFiNiTe eFfEcT YaNg sEaMlEsS" MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW MEOW
  const totalCommentPages = Math.ceil(comments.length / commentsPerPage);
  const paginatedComments = comments.slice((currentCommentPage - 1) * commentsPerPage, currentCommentPage * commentsPerPage);
  const totalSchoolPages = Math.ceil(schoolPartners.length / schoolPerPage);
  const paginatedSchoolPartners = schoolPartners.slice((schoolPage - 1) * schoolPerPage, schoolPage * schoolPerPage);
  const totalUniversityPages = Math.ceil(universityPartners.length / universityPerPage);
  const paginatedUniversityPartners = universityPartners.slice((universityPage - 1) * universityPerPage, universityPage * universityPerPage);
  const totalCompanyPages = Math.ceil(companyPartners.length / companyPerPage);
  const paginatedCompanyPartners = companyPartners.slice((companyPage - 1) * companyPerPage, companyPage * companyPerPage);
  const totalJobPages = Math.ceil(jobOpenings.length / jobsPerPage);
  const paginatedJobOpenings = jobOpenings.slice((jobPage - 1) * jobsPerPage, jobPage * jobsPerPage);

  const activePartners =
    partnerTab === "school"
      ? paginatedSchoolPartners
      : paginatedUniversityPartners;

  const activePage =
    partnerTab === "school"
      ? schoolPage
      : universityPage;

  const activeTotalPages =
    partnerTab === "school"
      ? totalSchoolPages
      : totalUniversityPages;

  return (
    <div className="snap-y snap-mandatory">
      {/* Beranda */}
      <section id="beranda" className="w-[85%] mx-auto px-4 pt-4 snap-start scroll-mt-40">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-in-left">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent leading-tight">
              {homepages?.["title-landing-1"] ?? "-"}
            </h1>
            <p className="text-gray-600 text-lg">
              Temukan peluang magang dari berbagai perusahaan terkemuka. Daftar,
              lamar, dan mulai perjalanan kariermu bersama kami.
            </p>
            <Link
              href="/tentang-kami"
              className="px-8 py-2 font-semibold bg-gradient-to-r from-accent to-accent-light text-white rounded-lg hover:from-accent-light hover:to-accent-light duration-300 transition-all"
            >
              Tentang Kami
            </Link>
          </div>

          <div className="hidden md:block relative animate-slide-in-right">
            <img src="/Hiring.png" alt="" />
          </div>
        </div>
      </section>

      {/* Kenapa harus magang? */}
      <section className="w-full bg-gradient-to-br from-accent to-cyan-200 text-white px-4 py-8 md:px-12 md:py-10 snap-start">
        <div className="container mx-auto w-[85%]">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {homepages?.["title-landing-2"] ?? "-"}
            </h2>
            <p className="text-base md:text-lg opacity-90">
              {homepages?.["subtitle-landing-2"] ?? "-"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4 animate-fade-in-up">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {homepages?.["title-content-landing-2-1"] ?? "-"}
                  </h3>
                  <p className="opacity-90 text-sm md:text-base">
                    {homepages?.["desc-content-landing-2-1"] ?? "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 animate-fade-in-up animate-delay-200">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {homepages?.["title-content-landing-2-2"] ?? "-"}
                  </h3>
                  <p className="opacity-90 text-sm md:text-base">
                    {homepages?.["desc-content-landing-2-2"] ?? "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 animate-fade-in-up animate-delay-400">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Inbox className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {homepages?.["title-content-landing-2-3"] ?? "-"}
                  </h3>
                  <p className="opacity-90 text-sm md:text-base">
                    {homepages?.["desc-content-landing-2-3"] ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-in-right mt-8 md:mt-0">
              <div className="bg-white rounded-2xl shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden">
                  <img src="/images/pengalaman.jpeg" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ulasan */}
      <section id="ulasan" className="py-16 w-[85%] mx-auto snap-start">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              {homepages?.["title-landing-4"] ?? "-"}
            </h2>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600 text-sm font-semibold">{comments.length} ulasan</p>
            {/* <Link href="/" className="font-semibold text-blue-600">Lainnya →</Link> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comments.length !== 0 ? (
              <>
                <style suppressHydrationWarning>{`
                  .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  }
                `}</style>

                <div className="contents">
                  {paginatedComments.map((item, index) => {
                    const isLong = !!truncatedComments[item.id];
                    return (
                      <div
                        key={`comment-${item.id}-${index}`}
                        className="h-[260px] bg-white rounded-2xl shadow-lg 
                          p-6 transition-all duration-300 
                          hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Profile header */}
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className="w-16 h-16 bg-gradient-to-br from-accent/10 to-blue-100 
                              rounded-full relative overflow-hidden shadow-inner shrink-0"
                          >
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/comment-prakerin/${item.user?.photo_profile || item.photo_profile}`}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover rounded-full bg-white"
                            />
                          </div>

                          <div className="text-left">
                            <p className="font-bold text-prakerin break-words">
                              {item.name}
                            </p>
                            <p className="text-xs text-blue-500 break-words">
                              {item.position}
                            </p>
                            <p className="text-xs text-gray-500 break-words">
                                {new Date(item.created_at).toLocaleDateString("id-ID", {day: "numeric", month: "long", year: "numeric",})}
                            </p>
                          </div>
                        </div>

                        {/* Review */}
                        <p
                          ref={(el) => registerCommentRef(el, item.id)}
                          className="text-gray-700 italic leading-relaxed break-words whitespace-pre-wrap overflow-hidden line-clamp-3 text-left"
                        >
                          "{item.comment}"
                        </p>

                        {isLong && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveComment(item);
                              setShowCommentModal(true);
                            }}
                            className="mt-2 text-accent font-semibold text-sm hover:underline cursor-pointer"
                          >
                            Lihat selengkapnya
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center w-full h-[320px]">
                <p className="text-gray-500">
                  Tidak ada ulasan yang ditemukan.
                </p>
              </div>
            )}
          </div>
          {totalCommentPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() =>
                  setCurrentCommentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentCommentPage === 1}
                className="text-accent disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalCommentPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCommentPage(index + 1)}
                    className={`w-3 h-3 rounded-full transition ${
                      currentCommentPage === index + 1
                        ? "bg-accent"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentCommentPage((prev) =>
                    Math.min(prev + 1, totalCommentPages)
                  )
                }
                disabled={currentCommentPage === totalCommentPages}
                className="text-accent disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Magang */}
      <section className="py-4 w-[85%] mx-auto snap-start">
        <div className="mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
            Lowongan Magang
          </h2>
          <p className="text-gray-600">
            Temukan peluang magang dari berbagai perusahaan ternama. Daftar, lamar, dan mulai perjalanan kariermu bersama kami
          </p>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600 text-sm font-semibold">{jobOpenings.length} lowongan</p>
          <Link href="/lowongan" className="font-semibold text-blue-600">Cari Lowongan →</Link>
        </div>
        <div className="bg-white shadow-sm border border-gray-200 p-6 mb-4 rounded-xl">
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Cari posisi..."
              className="w-full pl-4 pr-4 py-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4">
            {/* Provinsi */}
            <div className="relative">
              <select
              value={filterData.province_id} onChange={(e) => handleFilterChange("province_id", e.target.value)}
              className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-400 rounded-xl w-full"
              >
                <option value="">Provinsi</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Kotkab */}
            <div className="relative">
              <select
              value={filterData.city_regency_id} onChange={(e) => handleFilterChange("city_regency_id", e.target.value)} disabled={!filterData.province_id}
              className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-400 rounded-xl w-full"
              >
                <option value="">Kota / Kabupaten</option>
                {cityRegencies.map((cityreg) => (
                  <option key={cityreg.id} value={cityreg.id}>
                    {cityreg.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Tingkat */}
            <div className="relative">
              <select
              value={filterData.grade} onChange={(e) => handleFilterChange("grade", e.target.value)}
              className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-400 rounded-xl w-full"
              >
                <option value="">Tingkat</option>
                <option value="smk">Tingkat SMK</option>
                <option value="mahasiswa">Tingkat Mahasiswa</option>
                <option value="all">Semua Tingkat</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Bidang */}
            <div className="relative">
              <select
              value={filterData.field_id} onChange={(e) => handleFilterChange("field_id", e.target.value)}
              className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-400 rounded-xl w-full"
              >
                <option value="">Bidang</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Durasi */}
            <div className="relative">
              <select value={filterData.duration_id} onChange={(e) => handleFilterChange("duration_id", e.target.value)}
              className="appearance-none border border-gray-200 px-4 py-3 pr-10 text-gray-400 rounded-xl w-full"
              >
                <option value="">Durasi</option>
                {durations.map((duration) => (
                  <option key={duration.id} value={duration.id}>
                    {duration.duration_value} {duration.duration_unit}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setSearch(inputSearch)}
              className="bg-gradient-to-r from-accent to-accent-light text-white py-3 hover:from-accent-light hover:to-accent-light duration-300 transition-all px-6 py-3 rounded-xl"
            >
              <Search className="w-6 h-6 text-white-400" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedJobOpenings.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 shadow-sm p-5 flex flex-col rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-15 h-15 relative">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/profile/${job.user.photo_profile}`}
                    alt={job.company.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Berakhir:{" "}
                  <span className="text-red-500">
                    {new Date(job.closing_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <p className="text-sm text-blue-500 mb-4">{job.company.name}</p>
              <h2 className="text-xl font-bold">{job.title}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-6 mt-4 text-sm">
                <MapPin className="w-4 h-4" /> {job.city_regency.name}, {job.province.name}
            </div>
              <div className="flex items-center gap-2 text-blue-600 mb-6 text-sm">
                {job.qouta} Posisi
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full capitalize">
                    {job.location}
                </span>
              </div>
              <div className="border-t-4 border-gray-200 mb-4 mt-10"></div>
              {/* Push footer down */}
              <div className="mt-auto">
                <p className="text-sm text-gray-500 mb-4">
                    Diposting{" "}
                    {new Date(job.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
                <button className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-light text-white py-3 hover:from-accent-light hover:to-accent-light duration-300 transition-all">
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mitra Sekolah dan Perusahaan */}
      <section id="mitra" className="py-10 bg-gray-100 w-[90%] mx-auto rounded-2xl snap-start">
        {/* School */}
        <div className="w-[85%] mx-auto mb-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-8">
            {/* Left text */}
            <div className="w-[50%]">
              <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
                Mitra Sekolah dan Perguruan Tinggi Kami
              </h2>
              <p className="text-gray-600">
                Bergabunglah dengan sekolah dan perguruan tinggi terbaik yang telah mempercayai kami dalam program magang siswa
              </p>
              <Link
                href="/mitra"
                className="pb-3 font-semibold transition-colors duration-200 border-b-3 border-transparent ml-auto text-accent">
                  Selengkapnya →
              </Link>
            </div>
            {/* Right cards */}
            <div>
              <div className="flex gap-8 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setPartnerTab("school")}
                  className={`pb-3 font-semibold transition-colors duration-200 border-b-3 ${
                    partnerTab === "school"
                      ? "text-accent border-accent"
                      : "text-gray-400 border-transparent hover:text-accent"
                  }`}
                >
                  Sekolah
                </button>

                <button
                  onClick={() => setPartnerTab("university")}
                  className={`pb-3 font-semibold transition-colors duration-200 border-b-3 ${
                    partnerTab === "university"
                      ? "text-accent border-accent"
                      : "text-gray-400 border-transparent hover:text-accent"
                  }`}
                >
                  Universitas
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activePartners.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-center"
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                      alt={item.name}
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
              {activeTotalPages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-8">
                  <button
                    onClick={() => {
                      if (partnerTab === "school") {
                        setSchoolPage((prev) => Math.max(prev - 1, 1));
                      } else {
                        setUniversityPage((prev) => Math.max(prev - 1, 1));
                      }
                    }}
                    disabled={schoolPage === 1}
                    className="text-accent disabled:opacity-30"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: activeTotalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (partnerTab === "school") {
                            setSchoolPage(index + 1);
                          } else {
                            setUniversityPage(index + 1);
                          }
                        }}
                        className={`h-3 rounded-full transition-all ${
                          activePage === index + 1
                            ? "w-8 bg-accent"
                            : "w-3 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (partnerTab === "school") {
                        setSchoolPage((prev) =>
                          Math.min(prev + 1, totalSchoolPages)
                        );
                      } else {
                        setUniversityPage((prev) =>
                          Math.min(prev + 1, totalUniversityPages)
                        );
                      }
                    }}
                    disabled={schoolPage === totalSchoolPages}
                    className="text-accent disabled:opacity-30"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Company */}
        <div className="w-[85%] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-8">
            {/* Left cards */}
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paginatedCompanyPartners.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-center"
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                      alt={item.name}
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
              {totalCompanyPages > 1 && (
                <div className="flex justify-start items-center gap-4 mt-8">
                  <button
                    onClick={() =>
                      setCompanyPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={companyPage === 1}
                    className="text-accent disabled:opacity-30"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalCompanyPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCompanyPage(index + 1)}
                        className={`h-3 rounded-full transition-all ${
                          companyPage === index + 1
                            ? "w-8 bg-accent"
                            : "w-3 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setCompanyPage((prev) =>
                        Math.min(prev + 1, totalCompanyPages)
                      )
                    }
                    disabled={companyPage === totalCompanyPages}
                    className="text-accent disabled:opacity-30"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
            {/* Right text */}
            <div className="w-[50%] text-right ml-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
                Mitra Perusahaan Kami
              </h2>
              <p className="text-gray-600">
                Wujudkan magang di perusahaan impian anda!
              </p>
              <Link
                href="/mitra"
                className="pb-3 font-semibold transition-colors duration-200 border-b-3 border-transparent ml-auto text-accent">
                  Selengkapnya →
              </Link>
            </div>
          </div>
        </div>
        {/* CTA */}
        <div className="bg-gradient-to-r from-accent to-accent-light md:m-15 md:rounded-3xl text-white md:py-8 py-2">
          <div className="container flex flex-col md:flex-row items-center justify-between mx-auto md:px-20 px-4 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {homepages?.["title-landing-5"] ?? "-"}
              </h2>
              <p className="text-lg opacity-90">
                {homepages?.["subtitle-landing-5"] ?? "-"}
              </p>
            </div>
            <Link
              href="/daftar"
              className="bg-white text-accent px-8 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg w-full md:w-auto cursor-pointer"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 w-[85%] mx-auto">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4 text-center">
              {homepages?.["title-landing-6"] ?? "-"}
            </h2>
            <p className="text-gray-600 text-center">
              {homepages?.["subtitle-landing-7"] ?? "-"}
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Bagaimana cara mendaftar magang di Prakerin?
                </h3>
                <p className="text-gray-600">
                  Anda dapat mendaftar melalui website kami dengan mengisi
                  formulir pendaftaran dan melengkapi dokumen yang diperlukan.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Apa saja syarat untuk mendaftar magang?
                </h3>
                <p className="text-gray-600">
                  Syarat umum meliputi usia minimal 18 tahun, memiliki KTP, dan
                  sedang menempuh pendidikan di perguruan tinggi atau sekolah
                  menengah.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Berapa lama durasi magang di Prakerin?
                </h3>
                <p className="text-gray-600">
                  Durasi magang bervariasi tergantung program, mulai dari 1
                  bulan hingga 6 bulan.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Apakah ada biaya untuk mendaftar magang?
                </h3>
                <p className="text-gray-600">
                  Tidak ada biaya pendaftaran. Semua layanan kami gratis bagi
                  peserta magang.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto container px-4 text-center mt-8">
          <p className="mb-4">
            Punya pertanyaan lebih lanjut?
          </p>
          <Link
            href="#"
            className="inline-block px-8 py-2 font-semibold bg-gradient-to-r from-accent to-accent-light text-white rounded-lg hover:from-accent-light hover:to-accent-light duration-300 transition-all"
          >
            Hubungi Kami
          </Link>
        </div>
      </section>

      {/* Modal Ulasan Penuh */}
      {showCommentModal && activeComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              aria-label="Tutup"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={() => setShowCommentModal(false)}
            >
              ×
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-100 shadow bg-white">
                {(activeComment.user?.photo_profile || activeComment.photo_profile) && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/comment-prakerin/${activeComment.user?.photo_profile || activeComment.photo_profile}`}
                    alt={activeComment.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeComment.name}
                </h3>
                <p className="text-sm text-accent mb-2">
                  {activeComment.position}
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                "{activeComment.comment}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
