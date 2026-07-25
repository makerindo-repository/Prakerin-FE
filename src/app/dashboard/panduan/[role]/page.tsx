"use client";

import { AlertCircle, BookOpen, Clock, Download, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API } from "@/utils/config";
import Cookies from "js-cookie";
import Loader from "@/components/loader";

interface Guide {
  id: string;
  type: string;
  title: string;
  description: string | null;
  file_path: string;
  created_at: string;
}

const DashboardGuidesPage: React.FC = () => {
  const params = useParams();
  const roleParam = (params.role as string) || "company";

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "Siswa / Mahasiswa";
      case "school":
        return "Instansi Sekolah";
      case "company":
        return "Perusahaan / Industri";
      default:
        return "Pengguna";
    }
  };

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`/api/v1/guides`, {
          params: { type: roleParam },
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
        const fetchedGuides = response.data.data || [];
        setGuides(fetchedGuides);
        if (fetchedGuides.length > 0) {
          setSelectedGuide(fetchedGuides[0]);
        }
      } catch (error) {
        console.error("Error fetching guides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roleParam) {
      fetchGuides();
    }
  }, [roleParam]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const pdfUrl = selectedGuide
    ? `${process.env.NEXT_PUBLIC_API_URL || "https://api.prakerin.id"}/storage/${selectedGuide.file_path}`
    : "";

  return (
    <div className="p-6 space-y-6">
      {/* Title & Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#035a70] font-bold text-xl mb-1">
            <BookOpen className="w-6 h-6" />
            <h1>Panduan Penggunaan</h1>
          </div>
          <p className="text-sm text-gray-500">
            Dokumen dan petunjuk penggunaan sistem Prakerin.id untuk {getRoleLabel(roleParam)}.
          </p>
        </div>
        <span className="bg-[#035a70]/10 text-[#035a70] px-4 py-1.5 rounded-full text-xs font-bold">
          Role: {getRoleLabel(roleParam)}
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Guides List */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <FileText className="text-[#035a70] w-5 h-5" />
              <span>Daftar Dokumen ({guides.length})</span>
            </h2>

            {guides.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada panduan tersedia untuk role ini.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                {guides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      selectedGuide?.id === guide.id
                        ? "bg-[#035a70]/5 border-[#035a70] shadow-sm"
                        : "bg-white border-gray-100 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        selectedGuide?.id === guide.id
                          ? "bg-[#035a70] text-white"
                          : "bg-slate-100 text-gray-400"
                      }`}
                    >
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {guide.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {guide.description || "Tidak ada deskripsi."}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                        <Clock size={10} />
                        <span>
                          {new Date(guide.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Embedded PDF Viewer */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {selectedGuide ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full min-h-[600px]">
              {/* Document Info Header */}
              <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-4 mb-4 flex-wrap">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedGuide.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedGuide.description || "Tidak ada deskripsi tambahan."}
                  </p>
                </div>
                <a
                  href={pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#035a70] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#024556] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </a>
              </div>

              {/* PDF Embed Frame */}
              <div className="flex-1 bg-slate-100 rounded-xl relative overflow-hidden border border-gray-200">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full min-h-[500px]"
                  title={selectedGuide.title}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[500px] h-full">
              <BookOpen className="w-16 h-16 text-gray-200 mb-3" />
              <h3 className="text-lg font-bold text-gray-700 mb-1">
                Pilih Dokumen Panduan
              </h3>
              <p className="text-sm max-w-sm">
                Silahkan pilih salah satu dokumen panduan di sebelah kiri untuk membacanya secara langsung.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardGuidesPage;
