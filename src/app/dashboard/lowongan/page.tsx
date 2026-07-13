"use client";
import { Briefcase, BriefcaseBusiness } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import SiswaLowongan from "@/components/roleComponents/SiswaLowongan";
import { IndustryLowongan } from "@/components/roleComponents/IndustryLowongan";

const LowonganPage: React.FC = () => {
  const [role, setRole] = useState<string>();
  useEffect(() => {
    setRole(Cookies.get("authorization"));
  }, []);
  const RolePage: React.FC = () => {
    if (role === "company" || role === "super_admin") return <IndustryLowongan />;
    if (role === "student") return <SiswaLowongan />;
    if (role === "school") return null;
  };
  return (
    <main className="p-4 sm:p-6 md:p-8">
      <h1 className="text-accent-dark text-xs sm:text-sm mb-3 sm:mb-5">
        Lowongan
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 font-extrabold text-accent">
        <Briefcase className="w-5 h-5" />
        <h2 className="text-xl sm:text-2xl mt-1 sm:mt-2">Lowongan Magang</h2>
      </div>
      <div className="mt-4 sm:mt-6">
        <RolePage />
      </div>
    </main>
  );
};
export default LowonganPage;
