"use client";

import {
  ArrowRight,
  Building,
  Factory,
  FileText,
  Globe,
  Lock,
  MapPin,
  Phone,
  UserCircle,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { timeAgo } from "@/utils/timeAgo";
import Link from "next/link";
import Image from "next/image";
import RenderBlocks from "@/components/RenderBlocks";
import Loader from "@/components/loader";

// PENTING: field relasi (city_regency, province, sector) bisa null
// kalau datanya belum diisi di sisi perusahaan/backend. `company` (detail
// perusahaan itu sendiri) juga dibuat optional untuk jaga-jaga kalau
// backend pernah mengirim payload tak lengkap.
interface Company {
  email: string;
  photo_profile?: string | null;
  mou: boolean;
  company: {
    name: string;
    description: string | null;
    address: string;
    phone_number: string | null;
    website: string | null;
  } | null;
  city_regency: {
    name: string;
  } | null;
  province: {
    name: string;
  } | null;
  sector: {
    name: string;
  } | null;
  job_openings: {
    id: string;
    title: string;
    updated_at: string;
  }[];
}

const DetailPerusahaanPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCompanyDetail = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      if (response.status === 200) {
        console.log("Company Detail:", response.data.data);
        setCompany(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Id:", id);
    fetchCompanyDetail();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/perusahaan/"}
        >
          Perusahaan
        </Link>{" "}
        -&gt; Detail Perusahaan
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <Building className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Detail Perusahaan</h2>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {isLoading || !company ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-end lg:flex-row lg:items-start lg:justify-between gap-4 pb-5 mb-5 border-b-1 border-gray-200">
              <div className="flex items-start space-x-4">
                {company.photo_profile ? (
                  <div className="w-16 h-16 relative rounded-full border-white border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${company.photo_profile}`}
                      alt="Logo Perusahaan"
                      fill
                      sizes="100%"
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <UserCircle className="w-16 h-16 text-[var(--color-accent)]" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {company.company?.name ?? "-"}
                  </h2>
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {company.city_regency?.name ?? "-"},{" "}
                      {company.province?.name ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    {company.company?.website ? (
                      <Link
                        href={company.company.website}
                        className="text-sm text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {company.company.website.replace(/^https?:\/\//, "")}
                      </Link>
                    ) : (
                      <Link
                        href="http://makerindo.co.id"
                        className="text-sm text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        makerindo.co.id
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${company.email}&su=Halo&body=Isi%20pesan%20di%20sini`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-vip text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                >
                  <span className="">Chat Perusahaan</span>
                  <Lock className="w-4" />
                </Link>
                {Cookies.get("authorization") === "school" && !company.mou && (
                  <Link
                    href={`/dashboard/perusahaan/${id}/mou`}
                    className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                  >
                    <span className="">Ajukan Mou</span>
                    <FileText className="w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Info Perusahaan Section */}
            <div className="bg-white py-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Perusahaan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* Alamat */}
                {company.company?.address && (
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                    <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Alamat</p>
                      <p className="font-medium text-gray-900">
                        {company.company.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sektor */}
                {company.sector?.name && (
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                    <Factory className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Sektor</p>
                      <p className="font-medium text-gray-900">
                        {company.sector.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Telepon */}
                {company.company?.phone_number && (
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                    <Phone className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Telepon</p>
                      <p className="font-medium text-gray-900">
                        {company.company.phone_number}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Deskripsi
            </h3>
            <div className="text-gray-700 text-sm leading-relaxed mb-10">
              <RenderBlocks data={company.company?.description ?? null} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Lowongan Magang di Perusahaan ini
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {company.job_openings?.length ? (
                company.job_openings.map((jobOpening) => (
                  <Link
                    href={`/dashboard/lowongan/${jobOpening.id}`}
                    key={jobOpening.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {jobOpening.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {timeAgo(jobOpening.updated_at)}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-6 h-6 rounded-full border border-red-500 flex items-center justify-center group-hover:border-red-400 transition-colors">
                          <ArrowRight className="w-4  text-red-500" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">
                  Tidak ada lowongan yang tersedia di perusahaan ini.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default DetailPerusahaanPage;
