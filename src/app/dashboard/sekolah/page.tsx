"use client";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import AdminSekolah from "@/components/Sekolah/AdminSekolah";
import NonAdminSekolah from "@/components/Sekolah/NonAdminSekolah";
import LoaderData from "@/components/loader";

const SekolahPage: React.FC = () => {
  const [authorization, setAuthorization] = useState<string>("");

  useEffect(() => {
    setAuthorization(Cookies.get("authorization") as string);
  }, []);

  const Role = () => {
    return authorization ? (
      authorization === "super_admin" ? (
        <AdminSekolah />
      ) : (
        <NonAdminSekolah />
      )
    ) : (
      <LoaderData />
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Sekolah/Universitas</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar Sekolah/Universitas</h2>
        </div>
      </div>

      <Role />
    </main>
  );
};
export default SekolahPage;
