"use client";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Info, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API } from "@/utils/config";
import Cookies from "js-cookie";
import Loader from "@/components/loader";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  session_date: string;
  present: boolean;
  notes: string | null;
}

interface EnrollmentDetail {
  id: string;
  attendance_count: number;
  total_sessions: number;
  class: {
    title: string;
    level: string;
  };
}

const StudentAttendancePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const enrollmentId = params.id as string;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`/api/v1/pre-internship-enrollments/${enrollmentId}/attendance`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
        setRecords(response.data.data || []);
        setEnrollment(response.data.enrollment);
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (enrollmentId) {
      fetchAttendance();
    }
  }, [enrollmentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>Detail kelas tidak ditemukan.</p>
        <Link href="/dashboard/student/my-pre-internship-classes" className="text-accent underline mt-4 block">
          Kembali ke Kelas Saya
        </Link>
      </div>
    );
  }

  const attendanceRate = enrollment.total_sessions > 0
    ? (enrollment.attendance_count / enrollment.total_sessions) * 100
    : 0;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link className="hover:underline hover:text-accent" href="/dashboard/student/my-pre-internship-classes">
          Kelas Saya
        </Link>{" "}
        -&gt; Riwayat Presensi
      </h1>

      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
      </div>

      {/* Class summary and stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{enrollment.class.title}</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Level: {enrollment.class.level}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl flex items-center gap-6">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hadir Sesi</span>
              <p className="text-lg font-bold text-gray-800">
                {enrollment.attendance_count} / {enrollment.total_sessions}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Rasio</span>
              <p className={`text-lg font-bold ${attendanceRate < 75 && enrollment.total_sessions > 0 ? "text-red-600" : "text-green-600"}`}>
                {attendanceRate.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance session details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Daftar Sesi Pembelajaran</h3>

        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Info className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Belum ada sesi presensi yang tercatat untuk kelas ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="p-4 rounded-xl border border-gray-50 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(record.session_date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    <span>Pukul {new Date(record.session_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
                  </div>
                  {record.notes && (
                    <p className="text-xs text-gray-500 bg-slate-50 px-2 py-1 rounded mt-1.5 border border-slate-100 inline-block">
                      Catatan: {record.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {record.present ? (
                    <span className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Hadir
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1">
                      <XCircle size={12} />
                      Absen
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default StudentAttendancePage;
