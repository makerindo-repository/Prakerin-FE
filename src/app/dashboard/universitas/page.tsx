"use client";
import { Landmark } from "lucide-react";
import AdminUniversitas from "@/components/Sekolah/AdminUniversitas";

const UniversitasPage: React.FC = () => {
  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Data Universitas</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <Landmark className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar Universitas</h2>
        </div>
      </div>

      <AdminUniversitas />
    </main>
  );
};
export default UniversitasPage;