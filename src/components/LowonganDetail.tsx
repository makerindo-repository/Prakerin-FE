"use client";

import Image, { ImageProps } from "next/image";
import React, { useState, useEffect } from "react";

// ====== Helper: Image dengan fallback otomatis saat gagal dimuat (403/forbidden/404/dll) ======
interface ImageWithFallbackProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string | null | undefined;
  alt: string;
  fallback: React.ReactNode;
}

function ImageWithFallback({ src, alt, fallback, ...imageProps }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      unoptimized
      {...imageProps}
    />
  );
}
// ================================================================================================
import {
  Bookmark,
  MapPin,
  Users,
  Clock,
  BriefcaseBusiness,
  Calendar,
  GraduationCap,
  CircleDollarSign,
} from "lucide-react";
import {
  getGrade,
  getType,
  getLocation,
  getTypeTest,
} from "@/utils/lowonganLabel";
import { Building } from "lucide-react";
import { getPhotoProfileUrl } from "@/utils/config";
import Cookies from "js-cookie";
import RenderBlocks from "@/components/RenderBlocks";
import Link from "next/link";
import { Lowongan } from "@/types/lowongan";

export default function LowonganDetail({
  data,
  handleClickFavorite,
  getGrade,
  getLocation,
  getType,
  getDurationUnit,
  getTypeTest,
}: {
  data: any;
  handleClickFavorite: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
  getGrade: Function;
  getLocation: Function;
  getType: Function;
  getDurationUnit: Function;
  getTypeTest: Function;
}) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        Pilih lowongan untuk melihat detail.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-8">
        {/* Top Row */}
        <div className="flex justify-between items-start mb-4">
            <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 text-sm">
                {data.duration.duration_value} {getDurationUnit(data.duration.duration_unit)}
            </span>

            <span className="px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 text-sm">
                {getLocation(data.location)}
            </span>

            <span className="px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 text-sm">
                {getGrade(data.grade)}
            </span>
            </div>

            <p className="text-sm text-gray-500">
            Diterbitkan{" "}
            {new Date(data.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
            </p>
        </div>

        <div className="flex justify-between items-start">
            {/* Logo */}
            <div className="mb-6">
                {data.user?.photo_profile ? (
                <div className="w-24 h-24 relative rounded-full overflow-hidden">
                    <ImageWithFallback
                    src={getPhotoProfileUrl(data.user.photo_profile)}
                    alt="Logo"
                    fill
                    className="object-contain"
                    fallback={<Building className="w-full h-full text-accent" />}
                    />
                </div>
                ) : (
                <Building className="w-24 h-24 text-accent" />
                )}
            </div>
            {/* Action Buttons */}
            {(!Cookies.get("authorization") || Cookies.get("authorization") === "student") && (
                <div className="flex justify-end gap-3 mb-6">
                    {Cookies.get("authorization") === "student" && (
                        <button
                            type="button"
                            onClick={(e) => handleClickFavorite(e, data.id)}
                            className={`px-5 py-2 rounded-lg border font-medium transition ${
                            data.save_job_opening
                                ? "bg-cyan-600 text-white border-cyan-600"
                                : "border-cyan-300 text-cyan-600"
                            }`}
                        >
                            Simpan
                        </button>
                    )}

                    <Link
                        href={Cookies.get("authorization") === "student" ? `/dashboard/lowongan/${data.id}/apply` : `/masuk`}
                        className="px-5 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 flex items-center justify-center font-medium transition"
                    >
                        Lamar Sekarang
                    </Link>
                </div>
            )}
        </div>

        {/* Company */}
        <p className="text-xl text-cyan-600 font-semibold mb-3">
            {data.company.name}
        </p>

        {/* Title */}
        <h1 className="text-5xl font-bold text-black mb-5">
            {data.title}
        </h1>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
            <MapPin className="w-5 h-5" />
            <span>
            {data.city_regency?.name}, {data.province?.name}
            </span>
        </div>

        {/* Position + Applicants */}
        <p className="text-cyan-600 font-medium mb-2">
            {data.qouta} Posisi
            {data.applicant_count && ` - ${data.applicant_count} Pelamar`}
        </p>

        {/* Closing */}
        <p className="text-gray-500 mb-8">
            Penutupan:
            <span className="text-red-500 font-semibold ml-2">
            {new Date(data.closing_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
            </span>
        </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="border rounded-2xl p-4 flex gap-3">
                <BriefcaseBusiness className="w-8 h-8 text-cyan-500 my-auto" />
                <div>
                    <p className="font-semibold">Bidang Magang</p>
                    <p className="text-gray-600 text-sm">{data.field.name}</p>
                </div>
            </div>

            <div className="border rounded-2xl p-4 flex gap-3">
                <Calendar className="w-8 h-8 text-cyan-500 my-auto" />
                <div>
                    <p className="font-semibold">Waktu Mulai Magang</p>
                    <p className="text-gray-600 text-sm">
                        {new Date(data.start_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>

            <div className="border rounded-2xl p-4 flex gap-3">
                <CircleDollarSign className="w-8 h-8 text-cyan-500 my-auto" />
                <div>
                    <p className="font-semibold">Status Magang</p>
                    <p className="text-gray-600 text-sm">
                        {data.is_paid ? "Dibayar" : "Tidak Dibayar"}
                    </p>
                </div>
            </div>
        </div>

        {/* Poster/Leaflet Lowongan (opsional, dari perusahaan) */}
        {data.poster && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Poster Lowongan
            </h3>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/storage/job-opening-posters/${data.poster}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/job-opening-posters/${data.poster}`}
                alt={`Poster lowongan ${data.title}`}
                className="w-full max-w-xl rounded-2xl border object-contain"
              />
            </a>
          </div>
        )}

        {/* Content Area - Placeholder for job description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Deskripsi
        </h3>
        <div className="text-gray-600 py-6 mb-6">
        <RenderBlocks data={data.description} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Test
        </h3>
        <div className="py-6 mb-6">
        {data.test &&
            data.test.map((test: any, index: number) => (
            <div key={index} className="bg-white shadow-md my-5 p-5">
                <span className="text-lg font-medium">
                {test.title}{" "}
                <span className="text-gray-400">
                    - {getTypeTest(test.type)}
                </span>
                </span>
                <p>{test.description}</p>
            </div>
            ))}
        </div>
    </div>
  );
}