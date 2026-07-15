"use client";

import FooterPage from "@/components/Footer";
import Navigation from "@/components/Navigation";

import dynamic from "next/dynamic";

import Image from "next/image";

import {
    BookOpen,
    User,
    School,
    Building2,
    Headphones,
    ChevronRight,
    FileX,
} from "lucide-react";

import { useEffect, useState } from "react";
import { API } from "@/utils/config";
import Loader from "@/components/loader";

/*
|--------------------------------------------------------------------------
| Dynamic Import
|--------------------------------------------------------------------------
|
| PdfViewer tidak boleh dirender saat SSR.
|
*/

const PdfViewer = dynamic(
    () => import("./PdfViewer"),
    {
        ssr: false,
    }
);

interface Guide {
    id: string;
    type: string;
    title: string;
    description: string | null;
    file_path: string;
    created_at: string;
}

type GuideCategory = "student" | "school" | "company";

export default function GuidePage() {

    const [selectedGuide, setSelectedGuide] = useState<GuideCategory>("student");
    const [guide, setGuide] = useState<Guide | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const guideTitle: Record<GuideCategory, string> = {
        student: "Panduan Siswa / Mahasiswa",
        school: "Panduan Sekolah",
        company: "Panduan Perusahaan",
    };

    useEffect(() => {
        const fetchGuide = async () => {
            setIsLoading(true);
            try {
                // Publik, gak butuh login — ambil panduan terbaru yang
                // sudah dipublikasikan untuk kategori yang dipilih.
                const response = await API.get("/api/v1/guides", {
                    params: { type: selectedGuide },
                });
                const guides: Guide[] = response.data.data || [];
                setGuide(guides[0] || null);
            } catch (error) {
                console.error("Error fetching guide:", error);
                setGuide(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGuide();
    }, [selectedGuide]);

    const fileUrl = guide
        ? `${process.env.NEXT_PUBLIC_API_URL || "https://api.prakerin.id"}/storage/${guide.file_path}`
        : "";

    return (
        <>
            <Navigation
                section=""
                setSection={() => {}}
            />
            <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">

                {/* Blur */}
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-200 opacity-30 blur-[160px]" />
                <div className="w-[88%] mx-auto pt-16 pb-20">

                    {/* HERO */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-14">
                        <div>
                            <h1 className="mt-7 text-6xl font-black leading-tight text-slate-900 bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
                                Panduan Penggunaan
                            </h1>
                            <p className="mt-5 text-xl leading-relaxed text-slate-500">
                                Temukan panduan lengkap mengenai seluruh fitur
                                Prakerin.id untuk siswa, sekolah maupun
                                perusahaan.
                            </p>
                        </div>
                        <div className="hidden lg:flex justify-end">
                            <Image
                                src="/images/help-center.png"
                                alt="Help Center"
                                width={430}
                                height={430}
                                priority
                            />
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* SIDEBAR */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-2xl font-bold">
                                    Kategori Panduan
                                </h2>
                                <p className="text-slate-500 mt-2 mb-7">
                                    Pilih kategori panduan yang ingin dipelajari.
                                </p>
                                <div className="space-y-4">

                                    {/* STUDENT */}
                                    <button
                                        onClick={() => setSelectedGuide("student")}
                                        className={`w-full rounded-2xl border p-5 transition-all duration-300 flex justify-between items-center cursor-pointer
                                        ${
                                            selectedGuide === "student"
                                                ? "border-accent bg-cyan-50"
                                                : "border-slate-200 hover:border-accent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                            ${
                                                selectedGuide === "student"
                                                    ? "bg-accent text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}>
                                                <User size={22} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold">
                                                    Siswa / Mahasiswa
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    Panduan peserta
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight />
                                    </button>
                                    {/* SCHOOL */}
                                    <button
                                        onClick={() => setSelectedGuide("school")}
                                        className={`w-full rounded-2xl border p-5 transition-all duration-300 flex justify-between items-center cursor-pointer
                                        ${
                                            selectedGuide === "school"
                                                ? "border-accent bg-cyan-50"
                                                : "border-slate-200 hover:border-accent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                            ${
                                                selectedGuide === "school"
                                                    ? "bg-accent text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}>
                                                <School size={22} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold">
                                                    Sekolah
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    Panduan sekolah
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight />
                                    </button>

                                    {/* COMPANY */}
                                    <button
                                        onClick={() => setSelectedGuide("company")}
                                        className={`w-full rounded-2xl border p-5 transition-all duration-300 flex justify-between items-center cursor-pointer

                                        ${
                                            selectedGuide === "company"
                                                ? "border-accent bg-cyan-50"
                                                : "border-slate-200 hover:border-accent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                            ${
                                                selectedGuide === "company"
                                                    ? "bg-accent text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}>
                                                <Building2 size={22} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold">
                                                    Perusahaan
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    Panduan perusahaan
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight />
                                    </button>
                                </div>
                            </div>

                            {/* HELP */}
                            <div className="mt-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-700 p-6 text-white shadow-xl">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Headphones size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mt-5">
                                    Butuh Bantuan?
                                </h3>
                                <p className="mt-3 text-cyan-100">
                                    Hubungi tim kami apabila mengalami
                                    kendala ketika menggunakan Prakerin.id.
                                </p>
                                <a
                                    href="mailto:makerdotindo@gmail.com"
                                    className="mt-6 block text-center w-full rounded-xl bg-white py-3 font-semibold text-cyan-700 hover:bg-cyan-50 transition-colors"
                                >
                                    Hubungi Kami
                                </a>
                            </div>
                        </div>
                        
                        {/* ================= PDF VIEWER ================= */}
                        <div className="lg:col-span-8">
                            {isLoading ? (
                                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm h-[600px] flex items-center justify-center">
                                    <Loader />
                                </div>
                            ) : guide ? (
                                <PdfViewer
                                    title={guide.title}
                                    file={fileUrl}
                                />
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-white shadow-sm h-[600px] flex flex-col items-center justify-center text-center p-10">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                        <FileX className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">
                                        {guideTitle[selectedGuide]} Belum Tersedia
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                        Dokumen panduan untuk kategori ini belum diunggah oleh admin. Silakan cek kategori lain atau kembali lagi nanti.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <FooterPage />
        </>
    );
}