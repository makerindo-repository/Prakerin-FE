"use client";

import ContactPage from "@/components/Contact";
import FooterPage from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { API, ENDPOINTS } from "@/utils/config";

const cards = [
  {
    title: "Menambah Pengalaman",
    desc: "Jaminan Pengalaman dengan industry industry yang terpercaya dan ter pantau dengan baik",
    bgImage: "/images/pengalaman.jpeg",
    gradient: "bg-gradient-to-t from-black/50 from-20% to-white/0",
  },
  {
    title: "Meningkatkan Wawasan",
    desc: "Menambah wawasan baru terkait ragam dunia industry yang ada",
    bgImage: "/images/wawasan.jpeg",
    gradient: "bg-gradient-to-t from-black/50 from-20% to-white/0",
  },
  {
    title: "Mudah",
    desc: "Memudah kan para Siswa atau Mahasiswa yang mencari tempat magang yang bagus dan berkualitas",
    bgImage: "/images/mudah.jpeg",
    gradient: "bg-gradient-to-t from-black/50 from-20% to-white/0",
  },
];

export default function AboutPage() {
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState(false);

  const prev = () => {
    setActive((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const next = () => {
    setActive((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setActive((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
      }, 4000); // 4 detik

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const [homepages, setHomepages] = useState<any>();

  const fetchData = async () => {
    try {
      const response = await API.get(ENDPOINTS.HOMEPAGES);
      setHomepages(response.data.data.homepages);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Navigation section={""} setSection={() => {}} />
      {isLoading && (
        <div className="fixed w-full inset-0 flex justify-center items-center h-screen z-10 bg-white">
          <Loader width={64} height={64} />
        </div>
      )}

      {/* Section 1: Tentang Kami */}
      <section className="grid grid-cols-1 md:grid-cols-10 gap-6 mt-10 w-[85%] mx-auto">
        {/* Title row */}
        <h1 className="md:col-span-10 py-4 text-6xl font-bold text-left mb-3 bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
          Tentang kami
        </h1>

        {/* Content row */}
        <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-10 gap-10">
          {/* Heading */}
          <div className="md:col-span-4">
            <h3 className="text-gray-700 text-xl md:text-2xl font-bold mt-6">
              Solusi Magang Terpercaya bagi Mahasiswa dan Talenta Muda
            </h3>
          </div>

          {/* Description */}
          <div className="md:col-span-6 text-gray-600 flex items-center">
            <p>
              Prakerin adalah sebuah platform magang digital yang dibuat untuk
              memudahkan mahasiswa dan talenta muda Indonesia dalam menemukan
              pengalaman kerja nyata. Kami menyediakan berbagai peluang magang
              terverifikasi dari perusahaan terpercaya, lengkap dengan bimbingan,
              pelatihan, dan dukungan untuk membangun karier profesionalmu sejak
              dini.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Our Story & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-10 md:grid-rows-2 md:max-h-100 gap-4 mt-10 w-[85%] mx-auto">
        <div
          className="md:col-span-4 row-span-2 relative overflow-hidden rounded-2xl shadow-xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel container - ShadCN style */}

          <div className="relative w-full h-80 md:h-full">
            {/* All slides container */}
            <div
              className="flex transition-transform duration-500 ease-out h-full"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {cards.map((card, index) => (
                <div key={index} className="relative flex-none w-full h-full">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${card.bgImage})`,
                    }}
                  />

                  {/* Content overlay */}
                  <div className="relative z-10 flex flex-col h-full text-white">
                    {/* Content area */}
                    <div className={`${card.gradient} p-5 pb-12 mt-auto`}>
                      <h1 className="text-xl md:text-2xl font-bold mb-3">
                        {card.title}
                      </h1>
                      <p className="text-sm md:text-base leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Fixed arrows (di luar track agar tidak ikut geser) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-5 z-2">
              <button
                onClick={() => {
                  setIsPaused(true);
                  prev();
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                className="pointer-events-auto p-2 rounded-full w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition-colors duration-200 backdrop-blur-sm cursor-pointer"
                aria-label="Sebelumnya"
              >
                <ArrowLeft />
              </button>
              <button
                onClick={() => {
                  setIsPaused(true);
                  next();
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                className="pointer-events-auto p-2 rounded-full w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition-colors duration-200 backdrop-blur-sm cursor-pointer"
                aria-label="Berikutnya"
              >
                <ArrowRight />
              </button>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsPaused(true);
                  setActive(index);
                  setTimeout(() => setIsPaused(false), 3000); // Resume after 3 seconds
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === active
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="bg-cyan-200 border border-cyan-400 hover:bg-cyan-300 col-span-1 md:col-span-6 rounded-2xl grid grid-flow-col grid-rows-5 min-h-[150px] mt-4 md:mt-0">
          <div className="col-span-2 p-5 row-span-3">
            <h1 className="text-xl md:text-2xl font-bold text-blue-500">Visi</h1>
            <p className="text-s md:text-s text-gray-600">
              Menjadi platform magang digital terpercaya yang menjadi jembatan
              utama antara mahasiswa, talenta muda, dan dunia kerja profesional
              di Indonesia.
            </p>
          </div>
        </div>
        <div className="bg-blue-200 border border-blue-400 hover:bg-blue-300 col-span-1 md:col-span-6 rounded-2xl grid grid-flow-col grid-rows-5 min-h-[150px] mt-4 md:mt-0">
          <div className="col-span-2 p-5 row-span-3">
            <h1 className="text-xl md:text-2xl font-bold text-blue-500">Our Mission</h1>
            <p className="text-s md:text-s text-gray-600">
              1. Menyediakan peluang magang terverifikasi dari perusahaan
              terpercaya di berbagai bidang industri.
              <br />
              2. Membekali mahasiswa dan talenta muda dengan pelatihan,
              bimbingan, dan pengalaman kerja nyata.
              <br />
              3. Membangun ekosistem karier digital yang mendukung pertumbuhan
              profesional sejak dini.
              <br />
              4. Menjadi mitra strategis perusahaan dalam menemukan talenta muda
              potensial.
            </p>
          </div>
        </div>
      </section>
      <ContactPage homepages={homepages} />
      <FooterPage />
    </>
  );
}
