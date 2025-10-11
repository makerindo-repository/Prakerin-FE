"use client";

import { ArrowRight, CheckCircle2, Inbox, Search, Users2 } from "lucide-react";
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
  photo_profile: string;
  name: string;
  position: string;
  comment: string;
}

export default function LandingPage({
  homepages,
  partners,
  comments,
}: {
  homepages: any;
  partners: Partner[];
  comments: CommentPrakerin[];
}) {
  const router = useRouter();

  const [inputSearch, setInputSearch] = useState<string>("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeComment, setActiveComment] = useState<CommentPrakerin | null>(
    null
  );
  const [truncatedComments, setTruncatedComments] = useState<
    Record<string, boolean>
  >({});
  const commentRefs = useState<Map<string, HTMLParagraphElement>>(new Map())[0];
  const observers = useState<Map<string, ResizeObserver>>(new Map())[0];

  // Refs untuk scroll sections
  const schoolScrollRef = useRef<HTMLDivElement>(null);
  const companyScrollRef = useRef<HTMLDivElement>(null);
  const commentScrollRef = useRef<HTMLDivElement>(null);

  // State untuk pause scroll
  const [schoolPaused, setSchoolPaused] = useState(false);
  const [companyPaused, setCompanyPaused] = useState(false);
  const [commentPaused, setCommentPaused] = useState(false);

  const registerCommentRef = (el: HTMLParagraphElement | null, id: string) => {
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

  // Infinite scroll logic untuk auto scroll dan drag scroll
  useEffect(() => {
    const setupInfiniteScroll = (
      ref: React.RefObject<HTMLDivElement>,
      isPaused: boolean,
      speed: number = 1
    ) => {
      const container = ref.current;
      if (!container) return;

      let animationId: number;
      let isDragging = false;
      let startX: number;
      let scrollLeftStart: number;

      // Auto scroll
      const autoScroll = () => {
        if (container && !isPaused && !isDragging) {
          container.scrollLeft += speed;

          // Reset infinite scroll - saat mencapai setengah, reset ke awal
          const halfWidth = container.scrollWidth / 2;
          if (container.scrollLeft >= halfWidth - 10) {
            container.scrollLeft = 1;
          }
        }

        animationId = requestAnimationFrame(autoScroll);
      };

      // Handle scroll event untuk infinite loop
      const handleScrollEvent = () => {
        const halfWidth = container.scrollWidth / 2;

        // Jika scroll melewati setengah, reset ke awal
        if (container.scrollLeft >= halfWidth - 10) {
          container.scrollLeft = 1;
        }
        // Jika scroll ke kiri sampai mentok, lompat ke ujung kanan
        else if (container.scrollLeft <= 1) {
          container.scrollLeft = halfWidth - container.clientWidth - 10;
        }
      };

      // Mouse drag handlers
      const handleMouseDown = (e: MouseEvent) => {
        isDragging = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeftStart = container.scrollLeft;
        container.style.cursor = "grabbing";
        container.style.userSelect = "none";
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        container.scrollLeft = scrollLeftStart - walk;
      };

      const handleMouseUp = () => {
        isDragging = false;
        container.style.cursor = "grab";
        container.style.userSelect = "auto";
      };

      const handleMouseLeave = () => {
        if (isDragging) {
          isDragging = false;
          container.style.cursor = "grab";
          container.style.userSelect = "auto";
        }
      };

      // Set initial cursor
      container.style.cursor = "grab";

      // Start auto scroll immediately
      animationId = requestAnimationFrame(autoScroll);

      // Add event listeners
      container.addEventListener("scroll", handleScrollEvent, {
        passive: true,
      });
      container.addEventListener("mousedown", handleMouseDown);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseup", handleMouseUp);
      container.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        container.removeEventListener("scroll", handleScrollEvent);
        container.removeEventListener("mousedown", handleMouseDown);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseup", handleMouseUp);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    const cleanupSchool = setupInfiniteScroll(
      schoolScrollRef as React.RefObject<HTMLDivElement>,
      schoolPaused,
      1.5
    );
    const cleanupCompany = setupInfiniteScroll(
      companyScrollRef as React.RefObject<HTMLDivElement>,
      companyPaused,
      1.8
    );
    const cleanupComment = setupInfiniteScroll(
      commentScrollRef as React.RefObject<HTMLDivElement>,
      commentPaused,
      1.2
    );

    return () => {
      cleanupSchool?.();
      cleanupCompany?.();
      cleanupComment?.();
    };
  }, [schoolPaused, companyPaused, commentPaused]);

  const handleSearch = () => {
    if (inputSearch.trim() !== "") {
      router.push(`/lowongan?search=${encodeURIComponent(inputSearch)}`);
    }
  };

  const schoolPartners = (partners || []).filter((p) => p.type === "school");
  const companyPartners = (partners || []).filter((p) => p.type === "company");

  // Selalu duplicate untuk infinite effect yang seamless
  const schoolScrollList = [...schoolPartners, ...schoolPartners];
  const companyScrollList = [...companyPartners, ...companyPartners];
  const commentScrollList = [...comments, ...comments];

  return (
    <>
      <section id="beranda" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-in-left">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent leading-tight">
              {homepages?.["title-landing-1"] ?? "-"}
            </h1>
            <p className="text-gray-600 text-lg">
              Temukan peluang magang dari berbagai perusahaan terkemuka. Daftar,
              lamar, dan mulai perjalanan kariermu bersama kami.
            </p>

            <div className="relative items-center rounded-full shadow-md border border-gray-200 bg-gray-200/50 flex mt-8">
              <input
                type="text"
                onChange={(e) => setInputSearch(e.target.value)}
                value={inputSearch}
                placeholder="Cari lowongan magang impian anda..."
                className="w-full pl-12 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 rounded-full"
              />
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <button
                onClick={handleSearch}
                className="absolute right-4 bg-accent-dark w-8 h-8 rounded-full text-white hover:bg-prakerin-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ArrowRight className="w-6 h-6 m-auto" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <button
                onClick={() => setInputSearch("Magang Popular")}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm"
              >
                Magang Popular
              </button>
              <button
                onClick={() => setInputSearch("Digital Marketing")}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm"
              >
                Digital Marketing
              </button>
              <button
                onClick={() => setInputSearch("Backend Developer")}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm"
              >
                Backend Developer
              </button>
              <button
                onClick={() => setInputSearch("Frontend Developer")}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm"
              >
                Frontend Developer
              </button>
            </div>
          </div>

          <div className="hidden md:block relative animate-slide-in-right">
            <img src="/Hiring.svg" alt="" />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-accent to-cyan-200 text-white md:rounded-3xl px-4 py-12 md:p-20 m-0 md:m-15">
        <div className="container mx-auto">
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
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/video/video1.mp4" type="video/mp4" />
                    Browser Anda tidak mendukung video HTML5.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mitra Sekolah */}
      <section
        id="mitra-sekolah"
        className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              Mitra Sekolah dan Perguruan Tinggi Kami
            </h2>
            <p className="text-gray-600 mb-5">
              Bergabunglah dengan sekolah-sekolah terbaik yang telah mempercayai
              kami dalam program magang siswa
            </p>
            <div className="w-[170px] h-0 border-2 border-accent"></div>
          </div>

          <div className="relative">
            <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-blue-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-indigo-50 to-transparent pointer-events-none z-10"></div>

            <div
              ref={schoolScrollRef}
              onMouseEnter={() => setSchoolPaused(true)}
              onMouseLeave={() => setSchoolPaused(false)}
              className="overflow-x-auto overflow-y-hidden scrollbar-hide relative min-h-[260px]"
              style={{ scrollBehavior: "auto" }}
            >
              {schoolPartners && schoolPartners.length > 0 ? (
                <>
                  <style suppressHydrationWarning>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>

                  <div className="flex gap-6 px-12 w-max">
                    {schoolScrollList.map((item, index) => (
                      <div
                        key={`school-${item.id}-${index}`}
                        className="min-w-[240px] md:min-w-[280px] flex-shrink-0 text-center 
                       transition-all duration-300 transform hover:scale-105 
                       bg-white border border-blue-100 shadow-md hover:shadow-lg 
                       rounded-2xl p-6 cursor-pointer"
                      >
                        <div
                          className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 
                          rounded-full mx-auto mb-4 flex items-center justify-center 
                          relative overflow-hidden shadow-inner"
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                            alt={item.name}
                            fill
                            sizes="128px"
                            className="object-fill rounded-full transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-500 text-sm">{item.address}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                  <p className="text-gray-500">
                    Tidak ada mitra sekolah yang ditemukan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mitra Perusahaan */}
      <section id="mitra-perusahaan" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              Mitra Perusahaan Kami
            </h2>
            <p className="text-gray-600 mb-5">
              {homepages?.["subtitle-landing-3"] ??
                "Wujudkan magang di perusahaan impian anda!"}
            </p>
            <div className="w-[170px] h-0 border-2 border-accent"></div>
          </div>

          <div className="relative">
            <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>

            <div
              ref={companyScrollRef}
              onMouseEnter={() => setCompanyPaused(true)}
              onMouseLeave={() => setCompanyPaused(false)}
              className="overflow-x-auto overflow-y-hidden scrollbar-hide relative min-h-[260px]"
              style={{ scrollBehavior: "auto" }}
            >
              {companyPartners && companyPartners.length > 0 ? (
                <div className="flex gap-6 px-12 w-max">
                  {companyScrollList.map((item, index) => (
                    <div
                      key={`company-${item.id}-${index}`}
                      className="min-w-[240px] md:min-w-[280px] flex-shrink-0 text-center 
                       transition-all duration-300 transform hover:scale-105 
                       bg-white border border-gray-100 shadow-md hover:shadow-lg 
                       rounded-2xl p-6 cursor-pointer"
                    >
                      <div
                        className="w-32 h-32 bg-gradient-to-br from-accent/10 to-cyan-100 
                          rounded-full mx-auto mb-4 flex items-center justify-center 
                          relative overflow-hidden shadow-inner"
                      >
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                          alt={item.name}
                          fill
                          sizes="128px"
                          className="object-fill rounded-full transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-sm">{item.address}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                  <p className="text-gray-500">
                    Tidak ada mitra perusahaan yang ditemukan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ulasan */}
      <section id="ulasan" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              {homepages?.["title-landing-4"] ?? "-"}
            </h2>
            <p className="text-gray-600 mb-5">
              {homepages?.["subtitle-landing-4"] ?? "-"}
            </p>
            <div className="w-[170px] h-0 border-2 border-accent"></div>
          </div>

          <div className="relative">
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>

            <div
              ref={commentScrollRef}
              onMouseEnter={() => setCommentPaused(true)}
              onMouseLeave={() => setCommentPaused(false)}
              className="overflow-x-auto overflow-y-hidden scrollbar-hide relative min-h-[340px]"
              style={{ scrollBehavior: "auto" }}
            >
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

                  <div className="flex gap-6 px-12 w-max">
                    {commentScrollList.map((item, index) => {
                      const isLong = !!truncatedComments[item.id];
                      return (
                        <div
                          key={`comment-${item.id}-${index}`}
                          className="min-w-[300px] max-w-[320px] h-[320px] bg-white rounded-2xl shadow-lg 
                             p-8 flex flex-col items-center text-center 
                             flex-shrink-0 transition-all duration-300 
                             hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                        >
                          <div
                            className="w-24 h-24 bg-gradient-to-br from-accent/10 to-blue-100 
                                  rounded-full mx-auto mb-4 flex items-center justify-center 
                                  relative overflow-hidden shadow-inner shrink-0"
                          >
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/comment-prakerin/${item.photo_profile}`}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-cover rounded-full transition-transform duration-500 group-hover:scale-110 bg-white"
                            />
                          </div>

                          <p
                            ref={(el) => registerCommentRef(el, item.id)}
                            className="text-gray-700 mb-2 italic leading-relaxed break-words whitespace-pre-wrap overflow-hidden line-clamp-3"
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
                              className="text-accent font-semibold text-sm hover:underline cursor-pointer"
                            >
                              Lihat selengkapnya
                            </button>
                          )}

                          <span className="font-semibold text-prakerin break-words">
                            {item.name} – {item.position}
                          </span>
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
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br to-accent from-cyan-200 md:m-15 md:rounded-3xl text-white md:py-16 py-10">
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
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              {homepages?.["title-landing-6"] ?? "-"}
            </h2>
            <p className="text-gray-600 mb-5">
              {homepages?.["subtitle-landing-7"] ?? "-"}
            </p>
            <div className="w-[170px] h-0 border-2 border-accent"></div>
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
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/comment-prakerin/${activeComment.photo_profile}`}
                  alt={activeComment.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
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
    </>
  );
}
