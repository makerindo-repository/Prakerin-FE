"use client";
import Link from "next/link";
import PrakerinRegistrationSiswaForm from "./AsSiswa";
import { useState } from "react";
import PrakerinRegistrationSekolahForm from "./AsSekolah";
import PrakerinRegistrationIndustryForm from "./AsIndustry";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DaftarPage() {
  const [showForm, setShowForm] = useState<string>("");
  const route = useRouter();

  return (
    <>
      <button
        onClick={() => window.location.href = "/"}
        className="absolute top-4 left-4 p-3 rounded-full hover:bg-accent-hover transition bg-accent cursor-pointer shadow-md"
      >
        <ArrowLeft className="text-white" />
      </button>
      <section
        className={`${
          showForm ? "hidden" : "flex"
        } items-center justify-center min-h-screen bg-background px-4`}
      >
        <div className="w-full max-w-md gap-6 bg-white shadow-2xl p-6 md:p-10 rounded-xl flex flex-col justify-center items-center">
          <img src="PrakerinID_ico.svg" alt="" className="lg:w-50 " />
          <h1 className="text-2xl font-bold">Daftar</h1>
          <form className="w-full">
            <label htmlFor="email" className="block text-sm font-medium">
              Daftar Sebagai
            </label>
            <select
              onChange={(e) => {
                setShowForm(e.target.value);
              }}
              value={showForm}
              id="email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg px-5 cursor-pointer"
            >
              <option value="">Pilih daftar sebagai</option>
              <option value="siswa">Siswa</option>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="sekolah">Sekolah</option>
              <option value="university">Perguruan Tinggi</option>
              <option value="company">Perusahaan</option>
              <option value="teacher" disabled>
                Guru Pembimbing
              </option>
              <option value="company_mentor" disabled>
                Pembimbing Perusahaan
              </option>
            </select>
          </form>
          <div>
            <p className="text-sm ">
              Sudah memiliki akun?{" "}
              <Link href="/masuk" className="text-blue-500">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </section>
      {showForm && renderForm(showForm)}
    </>
  );

  function renderForm(form: string) {
    if (form === "siswa")
      return <PrakerinRegistrationSiswaForm setShowForm={setShowForm} typeStudent="siswa"/>;
    if (form === "mahasiswa")
      return <PrakerinRegistrationSiswaForm setShowForm={setShowForm} typeStudent="mahasiswa"/>;
    if (form === "sekolah")
      return <PrakerinRegistrationSekolahForm setShowForm={setShowForm} typeSchool="school" />;
    if (form === "university")
      return <PrakerinRegistrationSekolahForm setShowForm={setShowForm} typeSchool="university" />;
    if (form === "company")
      return <PrakerinRegistrationIndustryForm setShowForm={setShowForm} />;
    return null;
  }
}
