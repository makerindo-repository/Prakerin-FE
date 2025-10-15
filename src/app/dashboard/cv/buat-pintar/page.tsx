import UnderConstruction from "@/components/UnderConstruction";
import { FileText } from "lucide-react";
import Link from "next/link";
import React from "react";

const BuatPintarPage = () => {
  // return <UnderConstruction />;
  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/cv"}
        >
          Curiculum Vitae
        </Link>{" "}
        -&gt; CV Pintar
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl">Curiculum Vitae</h2>
        </div>
      </div>
      

    </main>
  );
};

export default BuatPintarPage;
