"use client";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCheck,
  Download,
  Eye,
  FileText,
  Globe,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
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
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { suppressErrorForSuperAdmin } from "@/libs/errorHandler";

interface Application {
  id?: string;
  user: {
    photo_profile: File | null;
    email: string;
    whatsapp_number?: string | null;
  };
  student: {
    name: string;
    class: string | null;
    skill: string | null;
    phone_number?: string | null;
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
  curriculum_vitae_id?: string;
  status: Status;
  message_rejected?: string | null;
  read_at?: string | null;
  is_read?: boolean;
}

interface FormData {
  status: "accepted" | "rejected";
  file: File | null;
  message_rejected?: string;
}

type Status = "in_progress" | "accepted" | "rejected" | "";

const detailLamaran = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  const [isShowModal, setIsShowModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDownloadingCv, setIsDownloadingCv] = useState(false);
  const [cvDownloadProgress, setCvDownloadProgress] = useState(0);

  const [previewFormPdf, setPreviewFormPdf] = useState<string | null>(null);

  const [application, setApplication] = useState<Application>({
    user: {
      photo_profile: null,
      email: "",
      whatsapp_number: null,
    },
    student: {
      name: "",
      class: "",
      skill: "",
      phone_number: null,
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
    message_rejected: "",
  });

  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const handleMarkAsRead = async () => {
    if (isMarkingRead) return;
    setIsMarkingRead(true);
    try {
      await API.patch(
        `${ENDPOINTS.INTERNSHIP_APPLICATIONS}/${id}/mark-as-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      setApplication((prev) => ({
        ...prev,
        is_read: true,
        read_at: new Date().toISOString(),
      }));
      await alertSuccess("Lamaran berhasil ditandai sudah dibaca dan pelamar telah diberi tahu!");
    } catch (error: any) {
      console.error("Error marking application as read:", error);
      await alertError(error.response?.data?.errors || "Gagal menandai lamaran sudah dibaca.");
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleOpenDecisionModal = async (decisionStatus: "accepted" | "rejected") => {
    if (!application.is_read && !application.read_at) {
      await alertError("Lamaran harus ditandai sebagai sudah dibaca terlebih dahulu sebelum mengambil keputusan.");
      return;
    }

    const actionText = decisionStatus === "accepted" ? "Terima" : "Tolak";
    const studentName = application?.student?.name || "pelamar";

    const confirmed = await alertConfirm(
      `Konfirmasi Keputusan`,
      `Apakah Anda yakin ingin ${actionText} lamaran ${studentName}?`
    );

    if (confirmed) {
      setFormData({ status: decisionStatus, file: null, message_rejected: "" });
      setPreviewFormPdf(null);
      setIsShowModal(true);
    }
  };

  const handleDownloadCv = async () => {
    const cvId = application.curriculum_vitae_id || application.cv_id;
    if (!cvId || isDownloadingCv) return;

    setIsDownloadingCv(true);
    setCvDownloadProgress(0);
    try {
      const response = await API.get(
        `${ENDPOINTS.CURRICULUM_VITAE}/${cvId}/download`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setCvDownloadProgress(percent);
            } else {
              setCvDownloadProgress((prev) => Math.min(prev + 25, 90));
            }
          },
        }
      );
      setCvDownloadProgress(100);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CV_${application?.student?.name || "Pelamar"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      await alertSuccess("CV berhasil diunduh!");
    } catch (error: any) {
      console.error("Error downloading CV:", error);
      await alertError("Gagal mengunduh file CV.");
    } finally {
      setTimeout(() => {
        setIsDownloadingCv(false);
        setCvDownloadProgress(0);
      }, 600);
    }
  };

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

    if (formData.status === "accepted" && !formData.file) {
      await alertError("Silakan pilih file surat penerimaan (format PDF).");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("status", formData.status);
      if (formData.file) {
        dataToSend.append("file", formData.file);
      }
      if (formData.status === "rejected" && formData.message_rejected?.trim()) {
        dataToSend.append("message_rejected", formData.message_rejected.trim());
      }

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
      await alertSuccess("Berhasil memperbarui status lamaran dan memberi tahu pelamar!");
      setIsShowModal(false);
      setErrors({});
      setFormData({ status: "accepted", file: null, message_rejected: "" });
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

  const phone = application?.student?.phone_number || application?.user?.whatsapp_number;
  let waUrl: string | null = null;
  if (phone) {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    else if (cleaned.startsWith("8")) cleaned = "62" + cleaned;
    const msg = encodeURIComponent(
      `Halo ${application?.student?.name || ""}, kami dari tim HR. Kami telah meninjau lamaran magang Anda untuk posisi ${application?.job_opening?.title || "Magang"} di PRAKERIN.ID dan ingin mendiskusikan tahapan seleksi selanjutnya.`
    );
    waUrl = `https://wa.me/${cleaned}?text=${msg}`;
  }

  const isRead = Boolean(application?.is_read || application?.read_at);

  return (
    <main className="p-4 sm:p-6 min-h-screen">
      <h1 className="text-accent-dark text-xs sm:text-sm mb-3 sm:mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/industry/lamaran"}
        >
          Lamaran
        </Link>{" "}
        -&gt; Detail Lamaran
      </h1>

      <div className="flex items-center mb-6 sm:mb-8 space-x-2 font-extrabold text-accent">
        <BriefcaseBusiness className="w-5 h-5 flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl">Detail Lamaran Magang</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 sm:p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            {/* Header Profil Pelamar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                {application?.user?.photo_profile ? (
                  <div className="w-16 h-16 relative rounded-full overflow-hidden ring-2 ring-accent/30 flex-shrink-0">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${application.user.photo_profile}`}
                      alt="Foto Pelamar"
                      fill
                      sizes="100%"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <UserCircle className="w-16 h-16 text-accent flex-shrink-0" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
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

                  {/* Tombol Direct WhatsApp Chat */}
                  {waUrl && (
                    <div className="mt-2.5">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat Pelamar via WhatsApp ({phone})</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Header Badge */}
              <div className="flex flex-wrap items-center gap-3">
                {isRead ? (
                  <span
                    title={
                      application.read_at
                        ? `Dibaca pada ${new Date(application.read_at).toLocaleDateString("id-ID")}`
                        : undefined
                    }
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sudah Dibaca</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleMarkAsRead}
                    disabled={isMarkingRead}
                    className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isMarkingRead ? (
                      <Loader width={16} height={16} />
                    ) : (
                      <Eye className="w-4 h-4 text-amber-600" />
                    )}
                    <span>Tandai Dibaca</span>
                  </button>
                )}

                <div
                  className={`font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm ${
                    application?.status === "in_progress"
                      ? "bg-accent/10 text-accent"
                      : application?.status === "accepted"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : application?.status === "rejected"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-gray-100 text-gray-600"
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
            </div>

            {/* Read-Gating Alert Box jika belum dibaca */}
            {!isRead && application?.status === "in_progress" && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-amber-900 text-xs sm:text-sm">
                  <Eye className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <span>
                    Lamaran ini <strong>belum ditandai sudah dibaca</strong>. Anda harus menandai lamaran ini sudah dibaca terlebih dahulu sebelum dapat menerima atau menolak pelamar.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleMarkAsRead}
                  disabled={isMarkingRead}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0 shadow-xs"
                >
                  {isMarkingRead ? (
                    <Loader width={16} height={16} />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>Tandai Dibaca</span>
                </button>
              </div>
            )}

            {/* Detail Lowongan */}
            <div className="mt-6 mb-6 bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {application?.job_opening?.title ?? "Lowongan Magang"}
              </h3>
              <p className="text-accent font-medium text-base">
                Posisi Magang ({application?.job_opening?.duration || "-"})
              </p>
            </div>

            {/* Rejection Notice & Notes */}
            {application?.status === "rejected" && (
              <div className="mb-8 p-4 bg-red-50/80 border border-red-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Catatan / Alasan Penolakan Lamaran</span>
                </div>
                {application.message_rejected && typeof application.message_rejected === "string" && application.message_rejected.trim() ? (
                  <p className="text-xs sm:text-sm text-red-800 italic pl-6">
                    &ldquo;{application.message_rejected.trim()}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-red-600 pl-6">
                    Tidak ada catatan alasan khusus yang disertakan saat penolakan.
                  </p>
                )}
              </div>
            )}

            {/* Kelola Tes Kandidat */}
            <section className="my-8 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kelola Tes Kandidat
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Tes dan instruksi dapat dikirimkan ke pelamar melalui WhatsApp. Tandai kelulusan setiap tes di bawah ini:
              </p>
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
                          Belum ada tes khusus untuk lamaran ini
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

            {/* Surat Lamaran */}
            <section className="mt-10 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Surat Lamaran
              </h3>
              <div className="text-gray-700 text-sm leading-relaxed space-y-3 mb-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <RenderBlocks data={application.cover_letter} />
              </div>
            </section>

            {/* CV Dokumen */}
            <section className="my-6 text-gray-600 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Curriculum Vitae (CV)</h3>
                {(application.curriculum_vitae_id || application.cv_id) && (
                  <div>
                    {isDownloadingCv ? (
                      <div className="relative overflow-hidden bg-gray-200 text-gray-800 rounded-lg py-1.5 px-4 text-xs font-semibold flex items-center justify-center min-w-[120px] border border-gray-300">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-green-500 transition-all duration-150"
                          style={{ width: `${cvDownloadProgress}%` }}
                        />
                        <span className="relative z-10 text-white font-medium flex items-center gap-1.5">
                          <Loader2 size={13} className="animate-spin" />
                          <span>Mengunduh {cvDownloadProgress}%</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDownloadCv}
                        className="bg-green-500 hover:bg-green-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download size={13} />
                        <span>Unduh File CV</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
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

            {/* Decision Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-5 mt-8">
              <Link
                href={"/dashboard/industry/lamaran"}
                className="p-3 px-5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-sm font-medium"
              >
                Kembali
              </Link>

              {application.status === "in_progress" && (
                <>
                  <button
                    onClick={() => handleOpenDecisionModal("rejected")}
                    disabled={!isRead}
                    className={`p-3 px-5 rounded-xl text-sm font-semibold transition ${
                      isRead
                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer shadow-xs"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                    }`}
                    title={
                      !isRead
                        ? "Tandai lamaran sudah dibaca terlebih dahulu"
                        : "Tolak Lamaran"
                    }
                  >
                    Tolak Lamaran
                  </button>
                  <button
                    onClick={() => handleOpenDecisionModal("accepted")}
                    disabled={!isRead}
                    className={`p-3 px-5 rounded-xl text-sm font-semibold transition ${
                      isRead
                        ? "bg-accent text-white hover:bg-accent-hover cursor-pointer shadow-xs"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                    }`}
                    title={
                      !isRead
                        ? "Tandai lamaran sudah dibaca terlebih dahulu"
                        : "Terima Lamaran"
                    }
                  >
                    Terima Lamaran
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ========== MODAL TERIMA / TOLAK DENGAN SURAT PDF ========== */}
      {isShowModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 z-50 overflow-y-auto">
          <div className="bg-white text-black p-6 rounded-2xl flex flex-col gap-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto shadow-2xl">
            <div className="rounded-lg justify-between flex items-center border-b pb-3">
              <h3 className="text-lg font-bold">
                {formData.status === "accepted" ? "Terima " : "Tolak "} Lamaran dari {application?.student?.name}
              </h3>
              <X
                onClick={() => {
                  setIsShowModal(false);
                  setErrors({});
                  setFormData({ status: "accepted", file: null, message_rejected: "" });
                  setPreviewFormPdf(null);
                }}
                className="w-6 h-6 cursor-pointer text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
              />
            </div>
            
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {formData.status === "rejected" && (
                <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl flex flex-col gap-1 text-xs text-red-800">
                  <span className="font-semibold">Informasi Penolakan:</span>
                  <span>
                    Anda akan menolak lamaran dari <strong>{application?.student?.name}</strong>. Pelampiran surat penolakan bersifat opsional (tidak wajib).
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="letter" className="text-sm font-semibold text-gray-700">
                    Unggah Surat{" "}
                    {formData.status === "accepted" ? "Penerimaan (Acceptance Letter)" : "Penolakan (Rejection Letter)"}
                    {formData.status === "accepted" && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {formData.status === "rejected" && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      Opsional
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.status === "accepted"
                    ? "Surat ini akan dikirimkan langsung ke email pelamar dan tersimpan di riwayat lamaran."
                    : "Jika diunggah, surat resmi ini akan dikirimkan sebagai lampiran email ke pelamar."}
                </p>

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
                  className={`w-full min-h-[140px] border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${
                    previewFormPdf ? "cursor-default" : "cursor-pointer"
                  } ${errors.file ? "border-red-500" : "border-gray-300"}`}
                >
                  {previewFormPdf ? (
                    <div className="w-full rounded-md border">
                      <div className="flex items-center gap-2 p-2 border-b bg-gray-100">
                        <button
                          type="button"
                          onClick={openFilePicker}
                          className="bg-accent text-white px-2.5 py-1 rounded-lg border text-xs shadow-xs"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs shadow-xs"
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
                          height="350px"
                          className="w-full"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Tekan di sini untuk unggah file PDF surat{" "}
                        {formData.status === "accepted"
                          ? "penerimaan"
                          : "penolakan"}
                        {formData.status === "rejected" && " (opsional)"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Maksimal 2 MB (PDF)</p>
                    </div>
                  )}
                </div>
                {errors.file && (
                  <p className="mt-2 text-sm text-red-500">{errors.file}</p>
                )}
              </div>

              {formData.status === "rejected" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message_rejected" className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                    <span>Catatan / Alasan Penolakan</span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      Opsional
                    </span>
                  </label>
                  <textarea
                    id="message_rejected"
                    rows={3}
                    placeholder="Tuliskan catatan atau alasan penolakan untuk pelamar (opsional)..."
                    value={formData.message_rejected || ""}
                    onChange={(e) => setFormData({ ...formData, message_rejected: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {errors.message_rejected && (
                    <p className="text-xs text-red-500">{errors.message_rejected}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsShowModal(false);
                    setFormData({ status: "accepted", file: null, message_rejected: "" });
                    setPreviewFormPdf(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs ${
                    formData.status === "accepted"
                      ? "bg-accent hover:bg-accent-hover"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isSubmitting ? "Sedang mengirim..." : `Kirim Keputusan (${formData.status === "accepted" ? "Terima" : "Tolak"})`}
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