"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideControlsProps {
  page: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
  itemsOnThisSlide: number;
  totalItems: number;
}

/**
 * Kontrol navigasi slide (Sebelumnya/Berikutnya + "Slide X dari Y") — dipakai
 * di bawah grid Mitra Sekolah, Mitra Perusahaan, dan Ulasan di halaman Isi
 * Halaman, supaya daftar yang panjang dipecah per 20 item alih-alih
 * ditumpuk semua sekaligus di satu halaman.
 */
export default function SlideControls({
  page,
  totalPages,
  onChange,
  itemsOnThisSlide,
  totalItems,
}: SlideControlsProps) {
  if (totalPages <= 1) return null;

  const start = page * itemsOnThisSlide + 1;
  const end = Math.min(start + itemsOnThisSlide - 1, totalItems);

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        Menampilkan {start}–{end} dari {totalItems} data
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-medium text-gray-600 min-w-[90px] text-center">
          Slide {page + 1} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Slide berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
