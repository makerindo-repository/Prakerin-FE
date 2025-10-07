"use client";
import {
  BriefcaseBusiness,
  FileText,
  Globe,
  Lock,
  MapPin,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useLayoutEffect, useRef, useState } from "react";
import { API, ENDPOINTS } from "../../../../../../utils/config";
import Cookies from "js-cookie";
import RenderBlocks from "@/components/RenderBlocks";
import Image from "next/image";
import Loader from "@/components/loader";
import { AxiosError } from "axios";

interface Application {
  user: {
    photo_profile: File | null;
    email: string;
  };
  student: {
    name: string;
    class: string | null;
    skill: string | null;
  };
  major: {
    name: string | null;
  } | null;
  job_opening: {
    title: string;
    // division: string;
    // location: string;
    // type: string;
    duration: string;
  };
  test: {
    pivot: {
      test_id: string;
    };
    title: string;
  }[];
  cover_letter: string;
  cv_id: string;
  status: Status;
}

interface FormData {
  status: "accepted" | "rejected";
  file: File | null;
}

type Status = "in_progress" | "accepted" | "rejected" | "";

const detailLamaran = ({ params }: { params: Promise<{ id: string }> }) => {
  const [isShowModalAccept, setIsShowModalAccept] = useState(false);
  const [isShowModalReject, setIsShowModalReject] = useState(false);
  const [previewFormPdf, setPreviewFormPdf] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [application, setApplication] = useState<Application>({
    user: {
      photo_profile: null,
      email: "",
    },
    student: {
      name: "",
      class: "",
      skill: "",
    },
    major: {
      name: "",
    },
    job_opening: {
      title: "",
      // division: "",
      // location: "",
      // type: "",
      duration: "",
    },
    test: [],
    cover_letter: "",
    cv_id: "",
    status: "",
  });
  const { id } = use(params);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await API.get(
        `${ENDPOINTS.INTERNSHIP_APPLICATIONS}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      console.log(response);
      setApplication(response.data.data);

      const preview = await API.get(
        `${ENDPOINTS.CURRICULUM_VITAE}/${response.data.data.curriculum_vitae_id}/preview`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob", // penting!
        }
      );

      const fileBlob = new Blob([preview.data], {
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
  useEffect(() => {
    fetchData();
  }, []);

  const [formData, setFormData] = useState<FormData>({
    status: "accepted",
    file: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });

    // revoke previous preview if any
    // if (fileInputRef.current) {
    //   URL.revokeObjectURL(fileInputRef.current);
    //   fileInputRef.current = null;
    // }

    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewFormPdf(url);
      // fileInputRef.current = url;
    } else {
      setPreviewFormPdf(null);
    }
  };

  const handleSubmitAccept = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await API.post(
        `${ENDPOINTS.INTERNSHIP_APPLICATIONS}/${id}`,
        formData,
        {
          params: {
            _method: "PATCH",
          },
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      console.log(response);
      console.log(formData);
    } catch (error: AxiosError | unknown) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      // setIsShowModalAccept(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<any>({});

  const handleStatusChange = async (idTest: string) => {
    try{
      const response = await API.patch(`${ENDPOINTS.INTERNSHIP_APPLICATIONS}/${id}/${idTest}`,{},{
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        }
      })
    }catch (err) {

    }
  }

  const handleCancel = () => {
    setFormData({ ...formData, file: null });
    setPreviewFormPdf(null);
  };

  const [isMobile, setIsMobile] = useState<boolean>(false);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/industry/lamaran"}
        >
          Lamaran
        </Link>{" "}
        -&gt; Detail Lamaran
      </h1>

      {/* Header */}
      <div className="flex items-center mb-8 space-x-2 font-extrabold text-accent">
        <BriefcaseBusiness className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Detail Lamaran Magang</h2>
      </div>

      {/* Kartu Utama */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            {/* Bagian Header Pelamar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                {application.user.photo_profile ? (
                  <div className="w-16 h-16 relative rounded-full overflow-hidden ring-2 ring-accent/30">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${application.user.photo_profile}`}
                      alt="Foto Pelamar"
                      fill
                      sizes="100%"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <UserCircle className="w-16 h-16 text-accent" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {application.student.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Emai : {application.user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Kelas {application.student.class ?? "-"} | Jurusan{" "}
                    {application.major?.name ?? "-"}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Keahlian: {application.student.skill ?? "-"}
                  </p>
                </div>
              </div>

              {/* Status Lamaran */}
              <div className="bg-accent/10 text-accent font-semibold px-4 py-2 rounded-xl text-sm">
                Status:{" "}
                {application.status === "in_progress"
                  ? "Sedang Diproses"
                  : application.status === "accepted"
                  ? "Diterima"
                  : application.status === "rejected"
                  ? "Ditolak"
                  : "-"}
              </div>
            </div>

            {/* Judul Lowongan */}
            <div className="mt-6 mb-8 bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {application.job_opening.title}
              </h3>
              <p className="text-accent font-medium text-base">
                Frontend Developer - Divisi IT
              </p>
              <p className="text-gray-600 text-sm">
                Lokasi: Jakarta | Tipe: Magang | Durasi: 3 Bulan
              </p>
            </div>

            {/* Bagian Tes */}
            <section className="my-8 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kelola Tes Kandidat
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th className="py-3 px-4 text-left">Nama Tes</th>
                      <th className="py-3 px-4 text-center">Belum Lulus</th>
                      <th className="py-3 px-4 text-center">Lulus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.test.map((test, idx) => (
                      <tr
                        key={test.pivot.test_id}
                        className={`${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition`}
                      >
                        <td className="py-3 px-4 font-medium">{test.title}</td>
                        {["belum_lulus", "lulus"].map((val) => (
                          <td key={val} className="py-2 px-4 text-center">
                            <input
                              type="radio"
                              name={`test-${test.pivot.test_id}`}
                              value={val}
                              className="accent-accent scale-110 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Surat Lamaran */}
            <section className="mt-10 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Surat Lamaran
              </h3>
              <div className="text-gray-700 text-sm leading-relaxed space-y-3 mb-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <RenderBlocks data={application.cover_letter} />
              </div>
            </section>

            {/* CV Preview */}
            <section className="my-6 text-gray-600 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CV</h3>
              <div className="w-full rounded-xl border overflow-hidden shadow-sm">
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
            </section>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-5 mt-8">
              <Link
                href={"/dashboard/industry/lamaran"}
                className="p-3 px-5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Kembali
              </Link>

              {application.status === "in_progress" && (
                <>
                  <button
                    onClick={() => {
                      setIsShowModalReject(true);
                    }}
                    className="p-3 px-5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition cursor-pointer"
                  >
                    Tolak Lamaran
                  </button>
                  <button
                    onClick={() => {
                      setIsShowModalAccept(true);
                    }}
                    className="p-3 px-5 bg-accent text-white rounded-xl hover:bg-accent-hover transition cursor-pointer"
                  >
                    Terima Lamaran
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {isShowModalAccept && (
        <div className="fixed inset-0 flex items-center justify-center h-screen bg-black/25 z-50">
          <div className="bg-white text-black p-6 rounded-lg flex flex-col gap-2 min-w-sm lg:min-w-xl">
            <div className=" rounded-lg justify-between flex">
              <h3 className="text-lg font-semibold">Terima Lamaran</h3>
              <X
                onClick={() => {
                  setIsShowModalAccept(false);
                }}
                className="w-8 h-8 cursor-pointer text-red-500 hover:text-red-600"
              />
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmitAccept}>
              <div className="flex flex-col gap-2 ">
                <label htmlFor="loa">Pilih LOA</label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  // only clickable to open picker if there is no preview
                  onClick={() => {
                    if (!previewFormPdf) openFilePicker();
                  }}
                  className={`w-full min-h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${
                    previewFormPdf ? "cursor-default" : "cursor-pointer"
                  } ${errors.file ? "border-red-500" : "border-gray-300"}`}
                >
                  {previewFormPdf ? (
                    <div className="w-full rounded-md border">
                      {/* custom toolbar di atas embed */}
                      <div className="flex items-center gap-2 p-2 border-b bg-gray-100">
                        <button
                          type="button"
                          onClick={openFilePicker}
                          className="bg-accent text-white px-2 py-1 rounded-lg border text-sm shadow-sm"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm shadow-sm"
                        >
                          Hapus
                        </button>
                        <div className="flex-1" />
                      </div>

                      {/* PDF preview - berbeda untuk mobile dan desktop */}
                      {isMobile ? (
                        <div className="p-4 text-center bg-gray-50">
                          <FileText className="w-16 h-16 mx-auto text-accent mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            File LOA berhasil dipilih: <br />
                            <span className="font-medium">
                              {/* {formData.file?.name} */}
                            </span>
                          </p>
                          <a
                            href={previewFormPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-accent-hover"
                          >
                            Buka LOA
                          </a>
                        </div>
                      ) : (
                        <embed
                          src={previewFormPdf}
                          type="application/pdf"
                          width="100%"
                          height="600px"
                          className="w-full"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Tekan di sini untuk unggah LOA
                    </p>
                  )}
                </div>
                {errors.file && (
                  <p className="mt-2 text-sm text-red-500">{errors.file}</p>
                )}
              </div>

              <div className="flex justify-end ">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent-hover"
                >
                  {isSubmitting ? "Sedang mengirim..." : "Kirim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default detailLamaran;
