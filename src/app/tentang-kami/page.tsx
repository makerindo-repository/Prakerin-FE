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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Loader width={64} height={64} />
      </div>
    )}

    {/* ================= HERO ================= */}
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">

      {/* Background Decoration */}
      <div className="absolute -top-44 -right-32 w-[450px] h-[450px] rounded-full bg-cyan-300/20 blur-[120px]" />
      <div className="absolute top-56 -left-40 w-[350px] h-[350px] rounded-full bg-sky-200/20 blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-blue-200/10 blur-[120px]" />
      <div className="w-[90%] max-w-7xl mx-auto py-24">
       
        <div className="grid lg:grid-cols-2 gap-16 mt-10 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
                Solusi Magang
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
                Terpercaya
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
                Talenta Muda
              </span>
            </h1>
            <p className="mt-8 text-lg text-gray-600 leading-9 max-w-2xl">
              Prakerin.id merupakan platform magang digital yang
              menghubungkan mahasiswa, siswa, lulusan baru, dan talenta
              muda Indonesia dengan perusahaan terpercaya melalui proses
              yang lebih cepat, aman, dan transparan.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-5">
              <div className="rounded-3xl border border-sky-100 bg-white shadow-lg p-6 hover:-translate-y-2 duration-300">
                <h2 className="text-4xl font-extrabold text-sky-600">
                  20+
                </h2>
                <p className="mt-2 text-gray-500">
                  Perusahaan Partner
                </p>
              </div>
              <div className="rounded-3xl border border-sky-100 bg-white shadow-lg p-6 hover:-translate-y-2 duration-300">
                <h2 className="text-4xl font-extrabold text-sky-600">
                  100+
                </h2>
                <p className="mt-2 text-gray-500">
                  Talenta Bergabung
                </p>
              </div>
              <div className="rounded-3xl border border-sky-100 bg-white shadow-lg p-6 hover:-translate-y-2 duration-300">
                <h2 className="text-4xl font-extrabold text-sky-600">
                  95%
                </h2>
                <p className="mt-2 text-gray-500">
                  Kepuasan Pengguna
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-full h-full rounded-[40px] bg-gradient-to-br from-sky-400 to-cyan-300 opacity-20 blur-xl" />
            <div
              className="relative overflow-hidden rounded-[40px] shadow-2xl border border-white/60"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${active * 100}%)`,
                }}
              >
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="relative flex-none w-full h-[650px]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
                      style={{
                        backgroundImage: `url(${card.bgImage})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute bottom-0 p-10 text-white">
                      <div className="inline-flex px-4 py-2 rounded-full bg-white/20 backdrop-blur-lg mb-5">
                        Prakerin.id
                      </div>
                      <h2 className="text-4xl font-bold mb-4">
                        {card.title}
                      </h2>
                      <p className="leading-8 text-white/90">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <button
                onClick={() => {
                  setIsPaused(true);
                  prev();
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/40 duration-300"
              >
                <ArrowLeft />
              </button>
              <button
                onClick={() => {
                  setIsPaused(true);
                  next();
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/40 duration-300"
              >
                <ArrowRight />
              </button>

              {/* Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {cards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`transition-all rounded-full ${
                      active === index
                        ? "w-10 h-3 bg-white"
                        : "w-3 h-3 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ================= OUR VISION ================= */}
      <section className="relative py-24 bg-white overflow-hidden">

        {/* Decoration */}
        <div className="absolute left-0 top-20 w-80 h-80 rounded-full bg-sky-100 blur-[120px] opacity-60" />
        <div className="absolute right-0 bottom-10 w-96 h-96 rounded-full bg-cyan-100 blur-[140px] opacity-60" />
        <div className="w-[90%] max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-5 py-2 font-semibold">
              KENAPA PRAKERIN.ID
            </span>
            <h2 className="text-5xl font-extrabold mt-6 text-gray-900">
              Membangun Masa Depan Karier
            </h2>
            <p className="text-gray-500 mt-5 max-w-3xl mx-auto leading-8">
              Kami percaya bahwa setiap talenta muda berhak
              mendapatkan kesempatan berkembang melalui pengalaman kerja
              profesional yang berkualitas.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">

            {/* VISI */}
            <div className="group rounded-[32px] bg-gradient-to-br from-cyan-400 to-sky-600 p-[1px] shadow-2xl">
              <div className="rounded-[32px] bg-white p-10 h-full transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-8">
                  👁️
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Visi
                </h3>
                <p className="text-gray-600 leading-9 text-lg">
                  Menjadi platform magang digital terpercaya yang menjadi
                  penghubung utama antara mahasiswa, talenta muda, sekolah,
                  universitas, serta perusahaan dalam menciptakan ekosistem
                  karier yang lebih modern, transparan, dan berkelanjutan.
                </p>
              </div>
            </div>

            {/* MISSION */}
            <div className="group rounded-[32px] bg-gradient-to-br from-blue-500 to-cyan-400 p-[1px] shadow-2xl">
              <div className="rounded-[32px] bg-white p-10 h-full transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-8">
                  🚀
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-8">
                  Misi Kami
                </h3>
                <div className="space-y-6">
                  {[
                    "Menyediakan peluang magang terverifikasi dari perusahaan terpercaya di berbagai industri.",
                    "Membekali mahasiswa dan talenta muda dengan pengalaman kerja nyata.",
                    "Menghubungkan dunia pendidikan dengan kebutuhan industri modern.",
                    "Menjadi partner strategis perusahaan dalam menemukan talenta terbaik.",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-5 items-start"
                    >
                      <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-600 leading-8">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VALUE ================= */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900">
              Nilai yang Kami Junjung
            </h2>
            <p className="mt-5 text-gray-500">
              Komitmen kami dalam membangun platform magang terbaik di Indonesia.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-[28px] bg-white shadow-xl p-10 hover:-translate-y-3 duration-300">
              <div className="text-5xl mb-6">
                🤝
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Terpercaya
              </h3>
              <p className="text-gray-600 leading-8">
                Seluruh perusahaan yang bergabung melalui proses verifikasi
                sehingga mahasiswa lebih aman saat memilih tempat magang.
              </p>
            </div>
            <div className="rounded-[28px] bg-white shadow-xl p-10 hover:-translate-y-3 duration-300">
              <div className="text-5xl mb-6">
                💡
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Inovatif
              </h3>
              <p className="text-gray-600 leading-8">
                Menghadirkan solusi digital yang memudahkan proses pencarian,
                pendaftaran, hingga monitoring kegiatan magang.
              </p>
            </div>
            <div className="rounded-[28px] bg-white shadow-xl p-10 hover:-translate-y-3 duration-300">
              <div className="text-5xl mb-6">
                🌎
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Berdampak
              </h3>
              <p className="text-gray-600 leading-8">
                Membantu meningkatkan kualitas SDM Indonesia melalui
                pengalaman kerja profesional sejak dini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRANSITION ================= */}
      <section className="relative overflow-hidden">
        <svg
          className="w-full h-28 text-sky-50"
          viewBox="0 0 1440 120"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,64L80,69.3C160,75,320,85,480,74.7C640,64,800,32,960,32C1120,32,1280,64,1360,80L1440,96L1440,120L0,120Z" />
        </svg>
      </section>
      <ContactPage homepages={homepages} />
    <FooterPage />
  </>
  );
}