"use client";

import {
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Inbox,
  Search,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "../../utils/config";
import Loading from "./masuk/loading";
import Image from "next/image";
import NotFoundComponent from "@/components/NotFoundComponent";

interface Partner {
  id: string;
  name: string;
  address: string;
  logo: string;
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

  const handleSearch = () => {
    if (inputSearch.trim() !== "") {
      router.push(`/lowongan?search=${encodeURIComponent(inputSearch)}`);
    }
  };

  return (
    <>
      <section id="beranda" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6  animate-slide-in-left">
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
                className="absolute right-4 bg-accent-dark w-8 h-8  rounded-full text-white hover:bg-prakerin-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ArrowRight className=" w-6 h-6 m-auto" />
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

            <div className="relative animate-slide-in-right mt-8 md:mt-0 ">
              <div className="bg-white rounded-2xl  shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/video/video1.mp4" type="video/mp4" />
                    {/* Fallback untuk browser yang tidak support video */}
                    Browser Anda tidak mendukung video HTML5.
                  </video>
                </div>
              </div>
            </div>

            {/* <div className="relative animate-slide-in-right mt-8 md:mt-0">
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-prakerin rounded-full flex items-center justify-center mx-auto mb-4">
                      <video width={100} height={100} autoPlay loop muted>
                        <source
                          src="/rick-roll-video-meme-template-video-1da252ec.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                    <p className="text-gray-600 text-xs md:text-base">
                      Video Preview
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full"></div>
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full"></div>
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    3 mentors online
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      <section id="mitra" className="py-16 ">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              {homepages?.["title-landing-3"] ?? "-"}
            </h2>
            <p className="text-gray-600 mb-5">
              {homepages?.["subtitle-landing-3"] ?? "-"}
            </p>
            <div className="w-[170px] h-0 border-2 border-accent"></div>
          </div>

          {/* Ini Card */}
          <div className="relative">
            {/* Efek gradasi di sisi kiri & kanan */}
            <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>

            {/* Wrapper scroll */}
            <div className="overflow-x-auto scrollbar-hide scroll-smooth relative min-h-[260px]">
              {partners && partners.length > 0 ? (
                <div className="flex gap-6 md:gap-8 pb-4 snap-x snap-mandatory">
                  {partners.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-[240px] md:min-w-[280px] flex-shrink-0 text-center transition-all duration-300 transform hover:scale-105 bg-white border border-gray-100 shadow-md hover:shadow-lg rounded-2xl p-6 snap-center cursor-pointer"
                    >
                      {/* Logo Mitra */}
                      <div className="w-32 h-32 bg-gradient-to-br from-accent/10 to-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${item.logo}`}
                          alt={item.name}
                          fill
                          sizes="100%"
                          className="object-fill rounded-full transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Detail Mitra */}
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-sm">{item.address}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                  <NotFoundComponent text="Tidak ada mitra yang ditemukan." />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Judul Section */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
              {homepages?.["title-landing-4"] ?? "-"}
            </h2>
            <p className="text-gray-600 mb-5">
              {homepages?.["subtitle-landing-4"] ?? "-"}
            </p>
            <div className="w-[170px] h-0 border-2 border-accent"></div>
          </div>

          {/* Testimoni */}
          <div className="relative">
            {/* Gradasi sisi kiri & kanan (opsional, biar lebih estetik) */}
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>

            {/* Scroll Wrapper */}
            <div className="overflow-x-auto scrollbar-hide scroll-smooth">
              <div className="flex gap-6 md:gap-8 pb-6 px-4 snap-x snap-mandatory">
                {comments.length !== 0 ? (
                  comments.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-[300px] max-w-[320px] h-[320px] bg-white rounded-2xl shadow-lg 
                           p-8 flex flex-col items-center text-center 
                           flex-shrink-0 snap-center transition-all duration-300 
                           hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Foto Profil */}
                      <div
                        className="w-24 h-24 bg-gradient-to-br from-accent/10 to-blue-100 
                                rounded-full mx-auto mb-4 flex items-center justify-center 
                                relative overflow-hidden shadow-inner"
                      >
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/comment-prakerin/${item.photo_profile}`}
                          alt={item.name}
                          fill
                          sizes="100%"
                          className="object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Komentar */}
                      <p className="text-gray-700 mb-4 italic leading-relaxed">
                        “{item.comment}”
                      </p>

                      {/* Nama dan Posisi */}
                      <span className="font-semibold text-prakerin">
                        {item.name} – {item.position}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col justify-center items-center w-full h-[320px]">
                    <NotFoundComponent text="Tidak ada ulasan yang ditemukan." />
                  </div>
                )}
              </div>
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
    </>
  );
}
