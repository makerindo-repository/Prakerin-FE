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
} from "lucide-react";

import { useState } from "react";

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

export default function GuidePage() {

    const [selectedGuide, setSelectedGuide] = useState<
        "student" | "school" | "company"
    >("student");

    const pdfs = {
        student: "/doc/placeholder.pdf",
        school: "/doc/placeholder.pdf",
        company: "/doc/placeholder.pdf",
    };

    const guideTitle = {
        student: "Panduan Siswa / Mahasiswa",
        school: "Panduan Sekolah",
        company: "Panduan Perusahaan",
    };

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
                                        className={`w-full rounded-2xl border p-5 transition-all duration-300 flex justify-between items-center
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
                                        className={`w-full rounded-2xl border p-5 transition-all duration-300 flex justify-between items-center
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
                                        className={`w-full rounded-2xl border p-5 transition-all duration-300 flex justify-between items-center

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
                                <button className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-cyan-700">
                                    Hubungi Kami
                                </button>
                            </div>
                        </div>
                        
                        {/* ================= PDF VIEWER ================= */}
                        <div className="lg:col-span-8">
                            <PdfViewer
                                title={guideTitle[selectedGuide]}
                                file={pdfs[selectedGuide]}
                            />
                        </div>
                    </div>
                </div>
            </section>
            <FooterPage />
        </>
    );
}