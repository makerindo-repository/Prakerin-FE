"use client";
import { AlertCircle, Calendar, ClipboardList, Clock, GraduationCap, XOctagon } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import LoaderData from "@/components/loader";
import { API } from "@/utils/config";
import Link from "next/link";

interface PreInternshipEnrollment {
  id: string;
  status: "enrolled" | "completed" | "dropped";
  attendance_count: number;
  total_sessions: number;
  enrolled_at: string;
  class: {
    id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    level: string;
  };
}

const MyPreInternshipClasses: React.FC = () => {
  const [enrollments, setEnrollments] = useState<PreInternshipEnrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReload, setIsReload] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyClasses = async () => {
      setLoading(true);
      try {
        const response = await API.get("/api/v1/my-pre-internship-classes", {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
        setEnrollments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching my classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyClasses();
  }, [isReload]);

  const handleDrop = async (enrollmentId: string, title: string) => {
    const confirm = await alertConfirm(`Apakah Anda yakin ingin membatalkan pendaftaran (Drop) dari kelas "${title}"?`);
    if (!confirm) return;

    setIsDropping(enrollmentId);
    try {
      await API.delete(`/api/v1/pre-internship-enrollments/${enrollmentId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await alertSuccess("Berhasil membatalkan kelas!");
      setIsReload(!isReload);
    } catch (error) {
      console.error("Error dropping class:", error);
      await alertError("Gagal membatalkan kelas");
    } finally {
      setIsDropping(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enrolled":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Terdaftar</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Selesai</span>;
      case "dropped":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Dibatalkan</span>;
      default:
        return null;
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
      <h1 className="text-accent-dark text-sm mb-5">Dashboard -&gt; Kelas Saya</h1>

      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <GraduationCap className="w-6 h-6" />
          <h2 className="text-2xl mt-2">Daftar Kelas yang Diikuti</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoaderData />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-150 max-w-xl mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Belum Ada Kelas yang Diikuti</p>
          <p className="text-xs text-gray-400 mt-1">Anda belum mendaftar di kelas pembekalan apapun.</p>
          <Link
            href="/dashboard/student/pre-internship-classes"
            className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-bold inline-block shadow-sm transition-all"
          >
            Cari & Daftar Kelas Baru
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((item) => {
            const hasAttendance = item.total_sessions > 0;
            const progress = hasAttendance ? (item.attendance_count / item.total_sessions) * 100 : 0;

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-6 space-y-4">
                  {/* Status & Level Badge */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">
                      Level: {getLevelLabel(item.class.level)}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-1">{item.class.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 min-h-[48px]">{item.class.description || "Tidak ada deskripsi."}</p>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 border-t border-gray-50 pt-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        Mulai: {new Date(item.class.start_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </span>
                    </div>
                  </div>

                  {/* Attendance percentage bar */}
                  {item.status !== "dropped" && (
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Persentase Kehadiran</span>
                        <span className="font-semibold text-gray-800">
                          {item.attendance_count} / {item.total_sessions} Sesi ({progress.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${progress}%` }}
                          className={`h-full rounded-full ${progress < 75 && hasAttendance ? "bg-red-500" : "bg-green-500"}`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Daftar pada: {new Date(item.enrolled_at).toLocaleDateString("id-ID")}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {item.status === "enrolled" && (
                      <button
                        onClick={() => handleDrop(item.id, item.class.title)}
                        disabled={isDropping === item.id}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold disabled:opacity-50"
                        title="Batal Kelas (Drop)"
                      >
                        <XOctagon size={14} />
                        <span>Drop</span>
                      </button>
                    )}
                    {item.status !== "dropped" && (
                      <Link
                        href={`/dashboard/student/my-pre-internship-classes/${item.id}/attendance`}
                        className="px-4 py-2 bg-accent text-white hover:bg-accent-hover rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <ClipboardList size={14} />
                        <span>Presensi</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyPreInternshipClasses;
