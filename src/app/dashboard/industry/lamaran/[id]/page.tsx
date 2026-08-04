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
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import RenderBlocks from "@/components/RenderBlocks";
import Image from "next/image";
import Loader from "@/components/loader";
import { AxiosError } from "axios";
import { alertError, alertSuccess } from "@/libs/alert";
import { suppressErrorForSuperAdmin } from "@/libs/errorHandler";

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
    duration: string;
  };
  test: {
    pivot: {
      test_id: string;
      is_passed: boolean;
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
  const { id } = use(params);

  const [isShowModal, setIsShowModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [previewFormPdf, setPreviewFormPdf] = useState<string | null>(null);

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
      duration: "",
    },
    test: [],
    cover_letter: "",
    cv_id: "",
    status: "",
  });

  const fetchData = async () => {
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
      const appData = response.data?.data || {};
      setApplication(appData);

      if (appData.curriculum_vitae_id) {
        try {
          const preview = await API.get(
            `${ENDPOINTS.CURRICULUM_VITAE}/${appData.curriculum_vitae_id}/preview`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
              responseType: "blob",
            }
          );

          const fileBlob = new Blob([preview.data], {
            type: "application/pdf",
          });
          const fileUrl = URL.createObjectURL(fileBlob);

          setPreviewUrl(fileUrl);
        } catch (previewError) {
          console.error("Failed to load CV preview:", previewError);
          setPreviewUrl(null);
        }
      }
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

    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewFormPdf(url);
    } else {
      setPreviewFormPdf(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.file) {
      await alertError(`Silakan pilih file surat ${formData.status === "accepted" ? "penerimaan" : "penolakan"} (format PDF).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("status", formData.status);
      dataToSend.append("file", formData.file);

      const response = await suppressErrorForSuperAdmin(
        () =>
          API.post(
            `${ENDPOINTS.INTERNSHIP_APPLICATIONS}/${id}`,
            dataToSend,
            {
              params: {
                _method: "PATCH",
              },
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          ),
        { showSuccessMessage: false }
      );

      await fetchData();
      await alertSuccess("Berhasil memperbarui status lamaran");
      setIsShowModal(false);
      setErrors({});
      setFormData({ ...formData, file: null });
      setPreviewFormPdf(null);
      console.log(response);
    } catch (error: AxiosError | unknown) {
      console.error(error);
      if (error instanceof AxiosError) {
        const responseError = error.response?.data?.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setErrors(responseError || {});
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<any>({});

  const handleTestChange = async (testId: string) => {
    try {
      await suppressErrorForSuperAdmin(() => API.patch(
        `${ENDPOINTS.INTERNSHIP_APPLICATIONS}/${id}/tests/${testId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      ), { showSuccessMessage: false });

      await fetchData();
      await alertSuccess("Berhasil memperbarui status tes kandidat!");
    } catch (error) {
      console.error(error);
    }
  };

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

      <div className="flex items-center mb-8 space-x-2 font-extrabold text-accent">
        <BriefcaseBusiness className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Detail Lamaran Magang</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                {application?.user?.photo_profile ? (
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
                    {application?.student?.name ?? "Nama Tidak Tersedia"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Email : {application?.user?.email ?? "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Kelas {application?.student?.class ?? "-"} | Jurusan{" "}
                    {application?.major?.name ?? "-"}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Keahlian: {application?.student?.skill ?? "-"}
                  </p>
                </div>
              </div>

              <div
                className={`bg-accent/10  font-semibold px-4 py-2 rounded-xl text-sm ${
                  application?.status === "in_progress"
                    ? "text-accent"
                    : application?.status === "accepted"
                    ? "text-green-600"
                    : application?.status === "rejected"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                Status:{" "}
                {application?.status === "in_progress"
                  ? "Sedang Diproses"
                  : application?.status === "accepted"
                  ? "Diterima"
                  : application?.status === "rejected"
                  ? "Ditolak"
                  : "-"}
              </div>
            </div>

            <div className="mt-6 mb-8 bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {application?.job_opening?.title ?? "Lowongan Magang"}
              </h3>
              <p className="text-accent font-medium text-base">
                Posisi Magang
              </p>
            </div>

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
                    {(application?.test || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">
                          Belum ada tes untuk lamaran ini
                        </td>
                      </tr>
                    ) : (
                      (application?.test || []).map((test, idx) => (
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
                                checked={
                                  Boolean(test.pivot.is_passed)
                                    ? val === "lulus"
                                    : val === "belum_lulus"
                                }
                                value={val}
                                className="accent-accent scale-110 cursor-pointer"
                                onChange={() =>
                                  handleTestChange(test.pivot.test_id)
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Surat Lamaran
              </h3>
              <div className="text-gray-700 text-sm leading-relaxed space-y-3 mb-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <RenderBlocks data={application.cover_letter} />
              </div>
            </section>

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
                      setIsShowModal(true);
                      setFormData({ ...formData, status: "rejected" });
                    }}
                    className="p-3 px-5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition cursor-pointer"
                  >
                    Tolak Lamaran
                  </button>
                  <button
                    onClick={() => {
                      setIsShowModal(true);
                      setFormData({ ...formData, status: "accepted" });
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

      {/* ========== BAGIAN YANG DIPERBAIKI: MODAL ========== */}
      {isShowModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/25 z-50 overflow-y-auto">
          {/* 
            PERUBAHAN 1: Tambah padding (p-4) dan overflow-y-auto
            - p-4: memberi ruang di semua sisi layar
            - overflow-y-auto: memungkinkan scroll jika konten terlalu tinggi
          */}
          
          <div className="bg-white text-black p-6 rounded-lg flex flex-col gap-2 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto">
            {/* 
              PERUBAHAN 2: Ganti min-w dengan w-full max-w-2xl
              - w-full: lebar 100% dari container (tapi dibatasi padding parent)
              - max-w-2xl: maksimal lebar 672px (sesuai lg:min-w-xl)
              - max-h-[90vh]: maksimal tinggi 90% viewport height
              - overflow-y-auto: scroll jika konten melebihi max-h
              - my-auto: center vertikal
            */}
            
            <div className="rounded-lg justify-between flex">
              <h3 className="text-lg font-semibold">
                {formData.status === "accepted" ? "Terima " : "Tolak"} Lamaran
              </h3>
              <X
                onClick={() => {
                  setIsShowModal(false);
                  setErrors({});
                  setFormData({ ...formData, file: null });
                  setPreviewFormPdf(null);
                }}
                className="w-8 h-8 cursor-pointer text-red-500 hover:text-red-600 flex-shrink-0"
              />
            </div>
            
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="letter">
                  Pilih Surat{" "}
                  {formData.status === "accepted" ? "Penerimaan" : "Penolakan"}
                </label>

                <input
                  id="letter"
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div
                  onClick={() => {
                    if (!previewFormPdf) openFilePicker();
                  }}
                  className={`w-full min-h-[150px] border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${
                    previewFormPdf ? "cursor-default" : "cursor-pointer"
                  } ${errors.file ? "border-red-500" : "border-gray-300"}`}
                >
                  {previewFormPdf ? (
                    <div className="w-full rounded-md border">
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

                      {isMobile ? (
                        <div className="p-4 text-center bg-gray-50">
                          <FileText className="w-16 h-16 mx-auto text-accent mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Surat{" "}
                            {formData.status === "accepted"
                              ? "penerimaan"
                              : "penolakan"}{" "}
                            berhasil dipilih
                          </p>
                          <a
                            href={previewFormPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-accent-hover"
                          >
                            Buka{" "}
                            {formData.status === "accepted"
                              ? "Surat Penerimaan"
                              : "Surat Penolakan"}
                          </a>
                        </div>
                      ) : (
                        <embed
                          src={previewFormPdf}
                          type="application/pdf"
                          width="100%"
                          height="400px"
                          className="w-full"
                        />
                        /* 
                          PERUBAHAN 3: Kurangi height dari 600px ke 400px
                          - Agar tidak terlalu tinggi di dalam modal
                        */
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Tekan di sini untuk unggah surat{" "}
                      {formData.status === "accepted"
                        ? "penerimaan"
                        : "penolakan"}
                    </p>
                  )}
                </div>
                {errors.file && (
                  <p className="mt-2 text-sm text-red-500">{errors.file}</p>
                )}
              </div>

              <div className="flex justify-end">
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