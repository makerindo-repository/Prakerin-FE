"use client";
import {
  BookOpen,
  Building,
  CalendarClock,
  CalendarDays,
  Globe,
  Handshake,
  Lock,
  MapPin,
  UserCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { API, ENDPOINTS } from "@/utils/config";
import RenderBlocks from "@/components/RenderBlocks";
import Image from "next/image";
import { AxiosError } from "axios";
import { alertConfirm, alertSuccess } from "@/libs/alert";
import Loader from "@/components/loader";

interface KerjaSama {
  start_date: string;
  end_date: string;
  status: TypeStatus;
  file: string;
  is_company_accepted: boolean | null;
  is_school_accepted: boolean | null;
  reason: string | null;
  message: any;
  user: {
    photo_profile: string;
    email: string;
  };
  province: {
    name: string;
  };
  city_regency: {
    name: string;
  };
  partner: {
    name: string;
    website: string;
  };
}

interface FormData {
  reason: string;
}

interface FormError {
  reason?: string;
}

type TypeStatus = "pending" | "accepted" | "rejected" | "";

const lamaranPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [authorization, setAuthorization] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<KerjaSama>({
    start_date: "",
    end_date: "",
    status: "",
    file: "",
    is_company_accepted: null,
    is_school_accepted: null,
    reason: null,
    message: "",
    user: {
      photo_profile: "",
      email: "",
    },
    province: {
      name: "",
    },
    city_regency: {
      name: "",
    },
    partner: {
      name: "",
      website: "",
    },
  });

  const [formData, setFormData] = useState<FormData>({
    reason: "",
  });
  const [formError, setFormError] = useState<FormError>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const mou = API.get(`${ENDPOINTS.MOUS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const preview = API.get(`${ENDPOINTS.MOUS}/${id}/preview`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        responseType: "blob", // penting!
      });

      const response = await Promise.all([mou, preview]);

      console.log("Data", response);
      setData(response[0].data.data);

      const fileBlob = new Blob([response[1].data], {
        type: "application/pdf",
      });
      const fileUrl = URL.createObjectURL(fileBlob);

      setPreviewUrl(fileUrl); // ini nanti dipakai di <embed>
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError({});
    try {
      await API.patch(`${ENDPOINTS.MOUS}/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await fetchData();
      setIsModalOpen(false);
      await alertSuccess("Berhasil menolak kerja sama!");
    } catch (error: AxiosError | unknown) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async () => {
    const confirm = await alertConfirm(
      "Apakah anda yakin ingin menerima kerja sama ini?"
    );

    if (!confirm) return;

    try {
      await API.patch(`${ENDPOINTS.MOUS}/${id}`, null, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await fetchData();
      await alertSuccess("Berhasil menerima kerja sama!");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setAuthorization(Cookies.get("authorization"));
    fetchData();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/mou"}
        >
          Kerja Sama
        </Link>{" "}
        -&gt; Detail Kerja Sama
      </h1>

      <div className="flex items-center mb-8  space-x-2 font-extrabold text-accent">
        <Handshake className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Detail Kerja Sama</h2>
      </div>

      {/* Description Section */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-end lg:flex-row lg:items-start lg:justify-between gap-4 pb-5 border-b-1 border-gray-200">
              <div className="flex items-start space-x-4">
                {data.user.photo_profile ? (
                  <div className="w-16 h-16 relative rounded-full border-white border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${data.user.photo_profile}`}
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
                    {data.partner.name ?? "-"}
                  </h2>
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {data.city_regency.name ?? "-"},{" "}
                      {data.province.name ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    {data.partner.website ? (
                      <Link
                        href={data.partner.website}
                        className="text-sm text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {data.partner.website.replace(/^https?:\/\//, "")}
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
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${data.user.email}&su=Halo&body=Isi%20pesan%20di%20sini`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-vip text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                >
                  <span>
                    Chat{" "}
                    {authorization === "company" ? "Sekolah" : "Perusahaan"}
                  </span>
                  <Lock className="w-4" />
                </Link>

                {((authorization === "school" &&
                  data.is_school_accepted === null) ||
                  (authorization === "company" &&
                    data.is_company_accepted === null)) && (
                  <>
                    <button
                      onClick={handleAccept}
                      className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                      <span className="">Terima</span>
                      <Handshake className="w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                      <span className="">Tolak</span>
                      <Handshake className="w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Info Sekolah Section */}
            <div className="bg-white py-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Kerja Sama
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* Alamat */}
                {data.start_date && (
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                    <CalendarDays className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Tanggal Dimulai</p>
                      <p className="font-medium text-gray-900">
                        {data.start_date}
                      </p>
                    </div>
                  </div>
                )}

                {/* NPSN */}
                {data.end_date && (
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                    <CalendarClock className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-500">Tanggal Berakhir</p>
                      <p className="font-medium text-gray-900 ">
                        {data.end_date}
                      </p>
                    </div>
                  </div>
                )}

                {/* No Telepon */}
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                  <Building className="w-5 h-5 text-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-500">Status Kerja Sama</p>
                    <p className="font-medium text-gray-900">
                      {data.is_company_accepted === true
                        ? authorization === "company"
                          ? "Anda menerima kerja sama"
                          : `${data.partner.name} menerima kerja sama`
                        : data.is_company_accepted === null
                        ? authorization === "company"
                          ? "Menunggu balasan dari anda"
                          : `Menunggu balasan dari ${data.partner.name}`
                        : authorization === "company"
                        ? "Anda menolak kerja sama"
                        : `${data.partner.name} menolak kerja sama`}
                    </p>
                  </div>
                </div>
                {/* No Telepon */}
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                  <BookOpen className="w-5 h-5 text-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-500">Status Kerja Sama</p>
                    <p className="font-medium text-gray-900">
                      {data.is_school_accepted === true
                        ? authorization === "school"
                          ? "Anda menerima kerja sama"
                          : `${data.partner.name} menerima kerja sama`
                        : data.is_school_accepted === null
                        ? authorization === "school"
                          ? "Menunggu balasan dari anda"
                          : `Menunggu balasan dari ${data.partner.name}`
                        : authorization === "school"
                        ? "Anda menolak kerja sama"
                        : `${data.partner.name} menolak kerja sama`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Deskripsi
            </h3>
            <div className="text-gray-700 text-sm leading-relaxed space-y-3 mb-5">
              <RenderBlocks data={data.message} />
            </div>

            {/* Content Area - Placeholder for job description */}
            {data.reason && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Alasan {data.is_company_accepted ? "Perusahaan" : "Sekolah"}{" "}
                  Menolak
                </h3>
                <div className="my-6 text-gray-600">
                  <p>{data.reason}</p>
                </div>
              </>
            )}

            {/* Content Area - Placeholder for job description */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Surat Kerja Sama
            </h3>
            <div className="my-6 text-gray-600">
              <div className="w-full rounded-md border">
                {/* PDF preview */}
                {previewUrl && (
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center h-screen bg-black/25 z-50">
          <div className="bg-white text-black p-6 rounded-lg flex flex-col gap-2 min-w-sm lg:min-w-xl">
            <div className=" rounded-lg justify-between flex">
              <h3 className="text-lg font-semibold">Menolak</h3>
              <X
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="w-8 h-8 cursor-pointer text-red-500 hover:text-red-600"
              />
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Deskripsi Tes */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Menolak
                </label>
                {formError.reason && (
                  <p className="mt-1 text-sm text-red-500">
                    {formError.reason}
                  </p>
                )}
                <textarea
                  onChange={(e) => setFormData({ reason: e.target.value })}
                  value={formData.reason}
                  placeholder="Masukkan alasan anda menolak kerja sama ini"
                  className={`resize-none w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                    formError.reason ? "border-red-500" : "border-gray-300"
                  }`}
                ></textarea>
              </div>

              <div className="flex justify-end ">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent-hover"
                >
                  {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default lamaranPage;
