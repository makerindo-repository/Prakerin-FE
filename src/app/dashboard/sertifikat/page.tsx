"use client";
import { CircleArrowRight, MapPin, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import UnderConstruction from "@/components/UnderConstruction";
import { useRouter } from "next/navigation";

interface Perusahaan {
  image?: File | null;
  name: string;
  kota: string;
  provinsi: string;
}

interface Certificate {
  id: string;
}

const SertifikatPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const router = useRouter();
  const [perusahaan, setPerushaan] = useState<Perusahaan[]>([
    {
      kota: "Bandung",
      name: "Makerindo Prima Solusi",
      provinsi: "Jawa Barat",
    },
    // {
    //   kota: "Bandung",
    //   name: "Makerindo Prima Solusi",
    //   provinsi: "Jawa Barat",
    // },
    // {
    //   kota: "Bandung",
    //   name: "Makerindo Prima Solusi",
    //   provinsi: "Jawa Barat",
    // },
    // {
    //   kota: "Bandung",
    //   name: "Makerindo Prima Solusi",
    //   provinsi: "Jawa Barat",
    // },
    // {
    //   kota: "Bandung",
    //   name: "Makerindo Prima Solusi",
    //   provinsi: "Jawa Barat",
    // },
    // {
    //   kota: "Bandung",
    //   name: "Makerindo Prima Solusi",
    //   provinsi: "Jawa Barat",
    // },
  ]);

  const fetchCertificates = async () => {
    try {
      const response = await API.get(ENDPOINTS.CERTIFICATES, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        setCertificates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // return <UnderConstruction />;

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-accent-dark text-sm mb-5">Sertifikat</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <MessageSquareText className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Sertifikat Magang</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 text-black">
        {perusahaan.length !== 0 ? (
          perusahaan.map((data, i) => (
            <div
              className="bg-white flex flex-col md:flex-row space-x-5 p-5 px-10 md:px-5 rounded-2xl justify-between items-end md:items-center"
              key={i}
            >
              <div className="flex w-full md:w-auto">
                <img src="/Makerindo_PS.png" alt="Icon" className="w-15 h-15" />
                <div className="ms-3 ">
                  <h5 className="text-accent font-bold">{data.name}</h5>
                  <span className="flex">
                    <MapPin /> {data.kota}, {data.provinsi}
                  </span>
                </div>
              </div>
              <div className="flex space-x-5">
                <button onClick={() => router.push("sertifikat/10b8756c-abd6-419c-97c1-350eeb86ef22")} className="bg-accent/30 text-accent flex justify-between items-center p-1 px-2 space-x-2 rounded-full">
                  <span>Lihat Sertifikat</span>
                  <CircleArrowRight className="w-4 h-4" />
                </button>
                <button className="bg-green-500/30 text-green-500 flex justify-between items-center p-1 px-2 space-x-2 rounded-full">
                  <span>Download</span>
                  <CircleArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            Tidak ada sertifikat tersedia.
          </p>
        )}
      </div>
    </main>
  );
};
export default SertifikatPage;
