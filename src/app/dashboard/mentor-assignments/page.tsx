"use client";
import { AlertCircle, Calendar, CheckCircle2, ClipboardList, Info, Plus, User, UserCheck, UserX, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import LoaderData from "@/components/loader";
import { API } from "@/utils/config";

interface MentorAssignment {
  id: string;
  student_id: string;
  mentor_id: string;
  assigned_by_id: string;
  assigned_at: string;
  ended_at: string | null;
  notes: string | null;
  student: {
    username: string;
    email: string;
  };
  mentor: {
    user: {
      username: string;
    };
    expertise: string;
  };
  assigned_by: {
    username: string;
  };
}

interface StudentUser {
  id: string;
  username: string;
  email: string;
}

interface Mentor {
  id: string;
  expertise: string;
  user: {
    username: string;
  };
}

interface FormErrors {
  [key: string]: string | undefined;
}

const MentorAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [isReload, setIsReload] = useState<boolean>(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    student_id: "",
    mentor_id: "",
    notes: "",
  });
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/v1/mentor-assignments", {
        params: { status: statusFilter },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormResources = async () => {
    try {
      // Fetch students list (limit = 100)
      const studentsResponse = await API.get("/api/v1/users", {
        params: { role: "student", limit: 100 },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const studentList = studentsResponse.data.data || [];
      setStudents(studentList);
      if (studentList.length > 0) {
        setCreateForm((prev) => ({ ...prev, student_id: studentList[0].id }));
      }

      // Fetch mentors list
      const mentorsResponse = await API.get("/api/v1/mentors", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const mentorList = mentorsResponse.data.data || [];
      setMentors(mentorList);
      if (mentorList.length > 0) {
        setCreateForm((prev) => ({ ...prev, mentor_id: mentorList[0].id }));
      }
    } catch (error) {
      console.error("Error fetching resources for assignment form:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, isReload]);

  const handleOpenCreate = () => {
    fetchFormResources();
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateErrors({});

    try {
      await API.post("/api/v1/mentor-assignments", createForm, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await alertSuccess("Penugasan pembimbing berhasil dibuat!");
      setShowCreateModal(false);
      setCreateForm({
        student_id: "",
        mentor_id: "",
        notes: "",
      });
      setIsReload(!isReload);
    } catch (error) {
      if (error instanceof AxiosError) {
        setCreateErrors(error.response?.data.errors || {});
      } else {
        await alertError("Gagal membuat penugasan pembimbing");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleEndAssignment = async (assignment: MentorAssignment) => {
    const confirm = await alertConfirm(`Apakah Anda yakin ingin mengakhiri penugasan guru pembimbing untuk siswa "${assignment.student.username}"?`);
    if (!confirm) return;

    try {
      await API.patch(
        `/api/v1/mentor-assignments/${assignment.id}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      await alertSuccess("Penugasan pembimbing berhasil diakhiri!");
      setIsReload(!isReload);
    } catch (error) {
      console.error("Error ending assignment:", error);
      await alertError("Gagal mengakhiri penugasan");
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Master Data -&gt; Mentor Assignments</h1>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <UserCheck className="w-6 h-6" />
          <h2 className="text-2xl mt-2 font-extrabold">Penugasan Guru Pembimbing</h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
          >
            <option value="active">Penugasan Aktif (Active)</option>
            <option value="ended">Riwayat Penugasan (Ended)</option>
            <option value="all">Semua Penugasan (All)</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" />
            <span>Tugaskan Pembimbing</span>
          </button>
        </div>
      </div>

      {/* Assignments Table View */}
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
                  Guru Pembimbing
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Ditugaskan Oleh
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-36">
                  Mulai Penugasan
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-36">
                  Status
                </th>
                <th className="text-center p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-40">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <LoaderData />
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Belum ada penugasan guru pembimbing yang tercatat.</p>
                  </td>
                </tr>
              ) : (
                assignments.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-gray-500 text-sm">{index + 1}</td>
                    <td className="p-4 text-sm font-semibold text-gray-900">
                      {item.student.username}
                      <div className="text-xs font-normal text-gray-500">{item.student.email}</div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-800">
                      {item.mentor.user.username}
                      <div className="text-[10px] uppercase font-bold text-accent">{item.mentor.expertise}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {item.assigned_by?.username || "Admin"}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(item.assigned_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      {item.ended_at ? (
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            Selesai (Ended)
                          </span>
                          <div className="text-[10px] text-gray-400">
                            Selesai: {new Date(item.ended_at).toLocaleDateString("id-ID")}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          Aktif (Active)
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        {!item.ended_at ? (
                          <button
                            onClick={() => handleEndAssignment(item)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Akhiri Penugasan"
                          >
                            <UserX size={14} />
                            <span>Akhiri</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative my-8"
          >
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="text-accent w-5 h-5" />
              <span>Tugaskan Guru Pembimbing</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Siswa<span className="text-red-500">*</span>
                </label>
                {students.length === 0 ? (
                  <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    Tidak ada siswa terdaftar saat ini.
                  </p>
                ) : (
                  <select
                    value={createForm.student_id}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, student_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    {students.map((stud) => (
                      <option key={stud.id} value={stud.id}>
                        {stud.username} ({stud.email})
                      </option>
                    ))}
                  </select>
                )}
                {createErrors.student_id && (
                  <p className="mt-1 text-xs text-red-500">{createErrors.student_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Guru Pembimbing<span className="text-red-500">*</span>
                </label>
                {mentors.length === 0 ? (
                  <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    Belum ada profil pembimbing yang dibuat. Buat profil pembimbing terlebih dahulu.
                  </p>
                ) : (
                  <select
                    value={createForm.mentor_id}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, mentor_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    {mentors.map((ment) => (
                      <option key={ment.id} value={ment.id}>
                        {ment.user.username} ({ment.expertise})
                      </option>
                    ))}
                  </select>
                )}
                {createErrors.mentor_id && (
                  <p className="mt-1 text-xs text-red-500">{createErrors.mentor_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Penugasan
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ketikkan catatan penugasan (misal: area pembimbingan magang, notes khusus)..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isCreating}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 font-medium"
                disabled={isCreating || students.length === 0 || mentors.length === 0}
              >
                {isCreating ? "Menugaskan..." : "Tugaskan Pembimbing"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default MentorAssignmentsPage;
