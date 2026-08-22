"use client";

import { useEffect } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console — could also send to a monitoring service (e.g. Sentry)
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        {/* Logo */}
        <img
          src="/Logo Prakerin ID Text (2).svg"
          alt="Prakerin.ID"
          className="h-8 mx-auto mb-6 opacity-80"
        />

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Sedang dalam Pemeliharaan
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Kami sedang melakukan pembaruan sistem untuk pengalaman yang lebih
          baik. Halaman akan segera kembali normal — coba muat ulang dalam
          beberapa detik.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </a>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-gray-400">
          Jika masalah berlanjut, silakan hubungi kami melalui{" "}
          <a href="/hubungi-kami" className="text-accent hover:underline">
            halaman kontak
          </a>
          .
        </p>
      </div>
    </div>
  );
}
