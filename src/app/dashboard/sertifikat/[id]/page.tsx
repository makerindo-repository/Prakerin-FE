"use client";
import { FileText, Download, ArrowLeft } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { API, ENDPOINTS } from "@/utils/config";

interface Certificate {
  id: string;
  internship_id: string;
  internship?: {
    internship_application?: {
      curriculum_vitae?: {
        student?: {
          user?: { name: string };
        };
      };
      job_opening?: {
        company?: {
          user?: { name: string };
        };
        field?: { name: string };
      };
    };
  };
  created_at: string;
}

const DetailSertifikat = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    // cleanup blob URL on unmount
    return () => {
      if (currentPreviewRef.current) {
        URL.revokeObjectURL(currentPreviewRef.current);
        currentPreviewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = Cookies.get("userToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [detailRes, previewRes] = await Promise.all([
        API.get(`${ENDPOINTS.CERTIFICATES}/${id}`, { headers }),
        API.get(`${ENDPOINTS.CERTIFICATES}/${id}/preview`, {
          headers,
          responseType: "blob",
        }),
      ]);

      setCertificate(detailRes.data.data);

      const fileBlob = new Blob([previewRes.data], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(fileBlob);
      currentPreviewRef.current = fileUrl;
      setPreviewUrl(fileUrl);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.status === 404
          ? "Sertifikat tidak ditemukan."
          : "Gagal memuat sertifikat. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const token = Cookies.get("userToken");
      const response = await API.get(
        `${ENDPOINTS.CERTIFICATES}/${id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const studentName =
    certificate?.internship?.internship_application?.curriculum_vitae?.student
      ?.user?.name ?? "—";
  const companyName =
    certificate?.internship?.internship_application?.job_opening?.company?.user
      ?.name ?? "—";
  const fieldName =
    certificate?.internship?.internship_application?.job_opening?.field?.name ??
    "—";

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/sertifikat"}
        >
          Sertifikat
        </Link>{" "}
        -&gt; Detail Sertifikat
      </h1>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl">Detail Sertifikat</h2>
        </div>

        {!isLoading && !error && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-green-500/20 text-green-600 hover:bg-green-500/30 flex items-center space-x-2 p-2 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? "Mengunduh..." : "Download"}</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl space-y-6 p-6 text-black">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-500 space-y-3">
            <FileText className="w-16 h-16 text-gray-300" />
            <p className="text-center">{error}</p>
            <button
              onClick={() => router.push("/dashboard/sertifikat")}
              className="flex items-center space-x-2 text-accent hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke daftar sertifikat</span>
            </button>
          </div>
        ) : (
          <>
            {/* Info singkat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700 border-b pb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Nama Siswa</p>
                <p className="font-semibold">{studentName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Perusahaan</p>
                <p className="font-semibold">{companyName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Bidang</p>
                <p className="font-semibold">{fieldName}</p>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="w-full rounded-md border">
              {previewUrl ? (
                isMobile ? (
                  <div className="p-6 text-center bg-gray-50">
                    <FileText className="w-16 h-16 mx-auto text-accent mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      Preview tidak tersedia di perangkat mobile.
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-accent/80 transition-colors"
                    >
                      Buka PDF
                    </a>
                  </div>
                ) : (
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    width="100%"
                    height="700px"
                    className="w-full rounded-md"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                  <FileText className="w-12 h-12 mb-2" />
                  <p className="text-sm">Tidak ada preview tersedia.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default DetailSertifikat;
