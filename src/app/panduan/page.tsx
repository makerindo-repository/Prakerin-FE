"use client";

import FooterPage from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { API, ENDPOINTS } from "@/utils/config";


export default function GuidePage() {
//   const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedGuide, setSelectedGuide] = useState<"student" | "school" | "company">("student");
    const pdfs = {
        student: "/doc/placeholder.pdf",
        school: "/doc/placeholder.pdf",
        company: "/doc/placeholder.pdf",
    };

    return (
        <>
        <Navigation section={""} setSection={() => {}} />
        {/* {isLoading && (
            <div className="fixed w-full inset-0 flex justify-center items-center h-screen z-10 bg-white">
            <Loader width={64} height={64} />
            </div>
        )} */}

        {/* Section 1: Tentang Kami */}
        <section className="w-[85%] mx-auto">
            <h1 className="text-6xl font-bold text-left mb-3 bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent">
                Panduan
            </h1>
            <p className="text-black text-xl text-left mb-4">
                Akses panduan penggunaan untuk memahami setiap fitur dengan mudah. Ikuti langkah-langkah yang tersedia dan mulai gunakan platform secara optimal
            </p>

            <div className="grid grid-cols-1 md:grid-cols-10 gap-6 mb-16">
            {/* Left side */}
            <div className="md:col-span-4">
                <div className="space-y-3">
                <button onClick={() => setSelectedGuide("student")}
                className={`w-full text-left px-4 py-3 rounded-lg border hover:border-accent transition ${selectedGuide === "student" ? "border-accent" : "border-gray-300"}`}>
                    Siswa / Mahasiswa
                </button>

                <button onClick={() => setSelectedGuide("school")}
                className={`w-full text-left px-4 py-3 rounded-lg border hover:border-accent transition ${selectedGuide === "school" ? "border-accent" : "border-gray-300"}`}>
                    Sekolah
                </button>

                <button onClick={() => setSelectedGuide("company")}
                className={`w-full text-left px-4 py-3 rounded-lg border hover:border-accent transition ${selectedGuide === "company" ? "border-accent" : "border-gray-300"}`}>
                    Perusahaan
                </button>
                </div>
            </div>

            {/* Right side */}
            <div className="md:col-span-6">
                <div className="border rounded-xl overflow-hidden h-[800px]">
                <iframe
                    src={pdfs[selectedGuide]}
                    className="w-full h-full"
                />
                </div>
            </div>
            </div>
        </section>
        <FooterPage />
        </>
    );
}
