"use client";

import React from "react";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import FooterPage from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navbar */}
      <Navigation section={""} setSection={() => {}} />

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Illustration */}
            <div className="relative animate-fade-in-left">
              <div className="relative">
                {/* Large 404 Text */}
                <div className="text-[180px] md:text-[220px] font-extrabold text-center leading-none">
                  <span className="bg-gradient-to-br from-accent/20 via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                    404
                  </span>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 left-0 w-16 h-16 bg-gradient-to-br from-accent/30 to-cyan-200 rounded-full animate-bounce blur-sm"></div>
                <div className="absolute bottom-1/4 right-0 w-12 h-12 bg-gradient-to-br from-blue-200 to-accent/30 rounded-full animate-pulse blur-sm"></div>

                {/* Character/Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-accent/20">
                    <Search className="w-16 h-16 text-accent/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Message */}
            <div className="space-y-6 animate-fade-in-right text-center md:text-left">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                  Halaman Tidak Ditemukan
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin
                  halaman telah dipindahkan atau URL yang Anda masukkan salah.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-cyan-400 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  Kembali ke Beranda
                </Link>

                <Link
                  href="/lowongan"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-accent border-2 border-accent rounded-xl font-semibold hover:bg-accent hover:text-white transform hover:scale-105 transition-all duration-300"
                >
                  <Search className="w-5 h-5" />
                  Cari Lowongan
                </Link>
              </div>

              {/* Suggestions */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Saran untuk Anda:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Periksa kembali URL yang Anda masukkan
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Kembali ke halaman sebelumnya
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Jelajahi lowongan magang yang tersedia
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterPage />

      <style jsx>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
