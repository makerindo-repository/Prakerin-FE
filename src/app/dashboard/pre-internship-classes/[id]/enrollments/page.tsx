"use client";
import { AlertCircle, ArrowLeft, Check, CheckCircle2, ClipboardList, Clock, Info, User, X, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API } from "@/utils/config";
import Cookies from "js-cookie";
import Loader from "@/components/loader";
import { alertError, alertSuccess } from "@/libs/alert";
import Link from "next/link";
import { AxiosError } from "axios";

interface Student {
  id: string;
  username: string;
  email: string;
}

interface Enrollment {
  id: string;
  status: "enrolled" | "completed" | "dropped";
  attendance_count: number;
  total_sessions: number;
  enrolled_at: string;
  student: Student;
}

interface AttendanceRecord {
  id: string;
  session_date: string;
  present: boolean;
  notes: string | null;
}

const ClassEnrollmentsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classDetail, setClassDetail] = useState<any>(null);
  const [isReload, setIsReload] = useState<boolean>(false);

  // Modals state
  const [showMarkModal, setShowMarkModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Mark Attendance Form State
  const [markForm, setMarkForm] = useState({
    session_date: "",
    present: true,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // History Attendance State
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const fetchEnrollments = async () => {
    try {
      // First fetch enrollments
      const enrollmentsResponse = await API.get(`/api/v1/pre-internship-classes/${classId}/enrollments`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setEnrollments(enrollmentsResponse.data.data || []);

      // Then fetch class detail
      const classResponse = await API.get(`/api/v1/pre-internship-classes`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const currentClass = (classResponse.data.data || []).find((c: any) => c.id === classId);
      setClassDetail(currentClass);
    } catch (error) {
      console.error("Error fetching class enrollments:", error);
      await alertError("Gagal mengambil data peserta kelas");
      router.push("/dashboard/pre-internship-classes/manage");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchEnrollments();
    }
  }, [classId, isReload]);

  const handleOpenMark = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    
    // Default current date-time for the input
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(now.getTime() - tzoffset)).toISOString().substring(0, 16);
    
    setMarkForm({
      session_date: localISOTime,
      present: true,
      notes: "",
    });
    setShowMarkModal(true);
  };

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setIsSubmitting(true);
    // Format date-local to Y-m-d H:i:s
    const formattedDate = markForm.session_date.replace("T", " ") + ":00";

    try {
      await API.post(
        "/api/v1/class-attendance",
        {
          enrollment_id: selectedEnrollment.id,
          session_date: formattedDate,
          present: markForm.present,
          notes: markForm.notes || null,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      await alertSuccess("Presensi berhasil dicatat!");
      setShowMarkModal(false);
      setIsReload(!isReload);
    } catch (error) {
      console.error("Error marking attendance:", error);
      await alertError("Gagal mencatat presensi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistory = async (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    setHistoryRecords([]);

    try {
      const response = await API.get(`/api/v1/pre-internship-enrollments/${enrollment.id}/attendance`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setHistoryRecords(response.data.data || []);
    } catch (error) {
      console.error("Error loading attendance history:", error);
      await alertError("Gagal memuat riwayat presensi");
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enrolled":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Terdaftar</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Selesai</span>;
      case "dropped":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Dibatalkan</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link className="hover:underline hover:text-accent" href="/dashboard/pre-internship-classes/manage">
          Kelas Pembekalan
        </Link>{" "}
        -&gt; Peserta & Presensi
      </h1>

      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
      </div>

      {classDetail && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900">{classDetail.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{classDetail.description || "Tidak ada deskripsi."}</p>
          <div className="flex gap-4 mt-3 flex-wrap text-xs text-gray-500">
            <span className="font-semibold text-accent uppercase">Level: {classDetail.level}</span>
            <span>&bull;</span>
            <span>Siswa Terdaftar: {enrollments.filter(e => e.status === "enrolled").length} / {classDetail.capacity}</span>
          </div>
        </div>
      )}

      {/* Enrollments Table List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-12">
                  No
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Nama Siswa
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Tanggal Daftar
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Kehadiran
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Status
                </th>
                <th className="text-center p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-40">
                  Aksi Presensi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <Info className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Belum ada siswa yang mendaftar pada kelas ini.</p>
                  </td>
                </tr>
              ) : (
                enrollments.map((item, index) => {
                  const rate = item.total_sessions > 0 ? (item.attendance_count / item.total_sessions) * 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-gray-500 text-sm">{index + 1}</td>
                      <td className="p-4 text-sm font-semibold text-gray-900">{item.student.username}</td>
                      <td className="p-4 text-sm text-gray-500">{item.student.email}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(item.enrolled_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-gray-800">
                          {item.attendance_count} / {item.total_sessions} Sesi
                        </div>
                        {item.total_sessions > 0 && (
                          <div className={`text-[10px] font-bold ${rate < 75 ? "text-red-500" : "text-green-500"}`}>
                            Rasio: {rate.toFixed(0)}%
                          </div>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          {item.status === "enrolled" && (
                            <button
                              onClick={() => handleOpenMark(item)}
                              className="px-2.5 py-1.5 bg-accent text-white hover:bg-accent-hover text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              title="Catat Kehadiran"
                            >
                              Presensi
                            </button>
                          )}
                          {item.status !== "dropped" && (
                            <button
                              onClick={() => handleOpenHistory(item)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Riwayat Kehadiran"
                            >
                              <ClipboardList size={12} />
                              <span>Riwayat</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleMarkSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative"
          >
            <button
              type="button"
              onClick={() => setShowMarkModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList className="text-accent w-5 h-5" />
              <span>Input Kehadiran Siswa</span>
            </h3>

            <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
              <p><strong>Nama Siswa:</strong> {selectedEnrollment.student.username}</p>
              <p><strong>Email:</strong> {selectedEnrollment.student.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Sesi Pertemuan<span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={markForm.session_date}
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, session_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Status Kehadiran</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markForm.present}
                    onChange={(e) => setMarkForm((prev) => ({ ...prev, present: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-red-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className={`text-xs font-bold ml-2 ${markForm.present ? "text-green-600" : "text-red-500"}`}>
                    {markForm.present ? "Hadir" : "Absen"}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Sesi
                </label>
                <textarea
                  value={markForm.notes}
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ketikkan keterangan tambahan (misal: sakit, izin)..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowMarkModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Catat Presensi"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl relative flex flex-col h-[75vh]">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-bold text-gray-800 pr-10 mb-4 flex items-center gap-2">
              <ClipboardList className="text-accent" />
              <span>Riwayat Absensi: {selectedEnrollment.student.username}</span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader />
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Info className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Belum ada sesi presensi untuk siswa ini.</p>
                </div>
              ) : (
                historyRecords.map((record) => (
                  <div key={record.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between bg-slate-50/30">
                    <div className="space-y-1">
                      <span className="text-sm font-semibold text-gray-800">
                        {new Date(record.session_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })} WIB
                      </span>
                      {record.notes && (
                        <p className="text-xs text-gray-400 font-medium bg-white px-2 py-0.5 rounded border inline-block mt-1">
                          Catatan: {record.notes}
                        </p>
                      )}
                    </div>

                    <div>
                      {record.present ? (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-0.5">
                          <CheckCircle2 size={10} />
                          Hadir
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200 flex items-center gap-0.5">
                          <XCircle size={10} />
                          Absen
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClassEnrollmentsPage;
