"use client";
import { AlertCircle, Calendar, GraduationCap, Info, Layers, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import LoaderData from "@/components/loader";
import { API } from "@/utils/config";

interface PreInternshipClass {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  capacity: number;
  level: "beginner" | "intermediate" | "advanced";
  status: string;
  enrolled_count: number;
}

const PreInternshipClassesBrowse: React.FC = () => {
  const [classes, setClasses] = useState<PreInternshipClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [isReload, setIsReload] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await API.get("/api/v1/pre-internship-classes", {
          params: { level: levelFilter || undefined },
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
        setClasses(response.data.data || []);
      } catch (error) {
        console.error("Error fetching pre-internship classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [levelFilter, isReload]);

  const handleEnroll = async (classId: string, title: string) => {
    const confirm = await alertConfirm(`Apakah Anda yakin ingin mendaftar ke kelas "${title}"?`);
    if (!confirm) return;

    setIsEnrolling(classId);
    try {
      await API.post(
        `/api/v1/pre-internship-classes/${classId}/enroll`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      await alertSuccess("Berhasil mendaftar ke kelas!");
      setIsReload(!isReload);
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors || "Gagal mendaftar ke kelas";
      await alertError(typeof errorMsg === "string" ? errorMsg : "Gagal mendaftar");
    } finally {
      setIsEnrolling(null);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-50 text-green-700 border-green-200";
      case "intermediate":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "advanced":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Pemula (Beginner)";
      case "intermediate":
        return "Menengah (Intermediate)";
      case "advanced":
        return "Mahir (Advanced)";
      default:
        return level;
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Dashboard -&gt; Kelas Pra Magang</h1>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <GraduationCap className="w-6 h-6" />
          <h2 className="text-2xl mt-2">Daftar Kelas Pembekalan</h2>
        </div>

        {/* Filter level */}
        <div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white focus:ring-2 focus:ring-accent text-sm"
          >
            <option value="">Semua Level Kelas</option>
            <option value="beginner">Pemula (Beginner)</option>
            <option value="intermediate">Menengah (Intermediate)</option>
            <option value="advanced">Mahir (Advanced)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoaderData />
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-150 max-w-xl mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Tidak Ada Kelas Tersedia</p>
          <p className="text-xs text-gray-400 mt-1">Saat ini belum ada kelas pra magang yang dapat Anda ikuti.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isFull = cls.enrolled_count >= cls.capacity;
            const progress = (cls.enrolled_count / cls.capacity) * 100;

            return (
              <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-6 space-y-4">
                  {/* Badge & Level */}
                  <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLevelColor(cls.level)}`}>
                      {getLevelLabel(cls.level)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-1">{cls.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 min-h-[48px]">{cls.description || "Tidak ada deskripsi untuk kelas ini."}</p>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 border-t border-gray-50 pt-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        Mulai: {new Date(cls.start_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        Selesai: {new Date(cls.end_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </span>
                    </div>
                  </div>

                  {/* Capacity progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Users size={12} />
                        Kapasitas
                      </span>
                      <span className="font-semibold text-gray-800">
                        {cls.enrolled_count} / {cls.capacity} Siswa
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${progress}%` }}
                        className={`h-full rounded-full ${isFull ? "bg-red-500" : "bg-accent"}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end">
                  <button
                    onClick={() => handleEnroll(cls.id, cls.title)}
                    disabled={isFull || isEnrolling === cls.id}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer ${
                      isFull
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-accent text-white hover:bg-accent-hover"
                    }`}
                  >
                    {isEnrolling === cls.id ? (
                      <span>Mendaftar...</span>
                    ) : isFull ? (
                      <span>Penuh</span>
                    ) : (
                      <span>Daftar Kelas</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default PreInternshipClassesBrowse;
