"use client";
import { CircleArrowRight, Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

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
        city_regency?: { name: string };
        province?: { name: string };
      };
    };
  };
  created_at: string;
}

const SertifikatPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(ENDPOINTS.CERTIFICATES, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        // API returns paginated: { data: [...] } or { data: { data: [...] } }
        const raw = response.data;
        if (Array.isArray(raw?.data)) {
          setCertificates(raw.data);
        } else if (Array.isArray(raw?.data?.data)) {
          setCertificates(raw.data.data);
        } else {
          setCertificates([]);
        }
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownload = async (cert: Certificate) => {
    if (downloadingId) return;
    setDownloadingId(cert.id);
    try {
      const response = await API.get(
        `${ENDPOINTS.CERTIFICATES}/${cert.id}/download`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate_${cert.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-accent-dark text-sm mb-5">Sertifikat</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Sertifikat Magang</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader height={64} width={64} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 text-black">
          {certificates.length !== 0 ? (
            certificates.map((cert) => {
              const companyName =
                cert.internship?.internship_application?.job_opening?.company
                  ?.user?.name ?? "Perusahaan";
              const city =
                cert.internship?.internship_application?.job_opening
                  ?.city_regency?.name ?? "";
              const province =
                cert.internship?.internship_application?.job_opening?.province
                  ?.name ?? "";
              const location =
                city && province ? `${city}, ${province}` : city || province || "—";

              return (
                <div
                  key={cert.id}
                  className="bg-white flex flex-col md:flex-row space-x-5 p-5 px-10 md:px-5 rounded-2xl justify-between items-end md:items-center"
                >
                  <div className="flex w-full md:w-auto items-center">
                    <img
                      src="/Makerindo_PS.png"
                      alt="Company Logo"
                      className="w-15 h-15"
                    />
                    <div className="ms-3">
                      <h5 className="text-accent font-bold">{companyName}</h5>
                      <span className="text-sm text-gray-500">{location}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-3 md:mt-0">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/sertifikat/${cert.id}`)
                      }
                      className="bg-accent/30 text-accent flex justify-between items-center p-1 px-3 space-x-2 rounded-full hover:bg-accent/40 transition-colors"
                    >
                      <span>Lihat Sertifikat</span>
                      <CircleArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(cert)}
                      disabled={downloadingId === cert.id}
                      className="bg-green-500/30 text-green-500 flex justify-between items-center p-1 px-3 space-x-2 rounded-full hover:bg-green-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>
                        {downloadingId === cert.id ? "..." : "Download"}
                      </span>
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">
              Tidak ada sertifikat tersedia.
            </p>
          )}
        </div>
      )}
    </main>
  );
};

export default SertifikatPage;
