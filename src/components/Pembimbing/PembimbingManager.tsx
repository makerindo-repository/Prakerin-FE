"use client";
import React, { useState, useEffect } from "react";
import {
  UserRound,
  Plus,
  Search,
  Edit,
  Trash,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import Cookies from "js-cookie";
import { API } from "@/utils/config";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import Loader from "@/components/loader";

interface MentorUser {
  id: string;
  username: string;
  email: string;
  role: string;
  school?: { id: string; name: string };
  company?: { id: string; name: string };
  student?: { id: string; school?: { id: string; name: string } };
}

interface Mentor {
  id: string;
  user_id: string;
  expertise: string;
  bio: string | null;
  phone: string | null;
  availability: "available" | "limited" | "unavailable";
  active_assignments_count: number;
  user: MentorUser;
  created_at: string;
}

interface Assignment {
  id: string;
  student_id: string;
  mentor_id: string;
  notes: string | null;
  assigned_at: string;
  ended_at: string | null;
  student: MentorUser | null;
  mentor: Mentor | null;
  assigned_by: MentorUser | null;
}

interface Candidate {
  id: string;
  username: string;
  email: string;
  role: string;
}

type ActiveTab = "mentors" | "assignments";

const availabilityConfig = {
  available: {
    label: "Tersedia",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  limited: {
    label: "Terbatas",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  unavailable: {
    label: "Tidak Tersedia",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

interface PembimbingManagerProps {
  /** Filter mentor berdasarkan role akun pemiliknya. Kosong = semua (admin). */
  roleFilter?: "school" | "company";
  /** Judul halaman, mis. "Pembimbing", "Guru Pembimbing", "Pembimbing Perusahaan" */
  title: string;
  /** Sub-judul kecil di atas judul */
  eyebrow?: string;
}

const PembimbingManager = ({ roleFilter, title, eyebrow = "Manajemen Pembimbing" }: PembimbingManagerProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("mentors");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<
    "all" | "active" | "ended"
  >("all");

  // Modal states
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mentorForm, setMentorForm] = useState({
    user_id: "",
    expertise: "",
    bio: "",
    phone: "",
    availability: "available" as "available" | "limited" | "unavailable",
  });

  const [assignForm, setAssignForm] = useState({
    student_id: "",
    mentor_id: "",
    notes: "",
  });

  const [students, setStudents] = useState<MentorUser[]>([]);
  const token = Cookies.get("userToken");
  const headers = { Authorization: `Bearer ${token}` };

  // ---------------------------------------------------------------- fetch
  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/api/v1/mentors", {
        headers,
        params: roleFilter ? { role: roleFilter } : {},
      });
      setMentors(res.data.data || []);
    } catch {
      await alertError("Gagal memuat data pembimbing.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> =
        assignmentFilter !== "all" ? { status: assignmentFilter } : {};
      if (roleFilter) params.mentor_role = roleFilter;
      const res = await API.get("/api/v1/mentor-assignments", {
        headers,
        params,
      });
      setAssignments(res.data.data || []);
    } catch {
      await alertError("Gagal memuat data penugasan.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await API.get("/api/v1/mentors/candidates", {
        headers,
        params: roleFilter ? { role: roleFilter } : {},
      });
      setCandidates(res.data.data || []);
    } catch {
      console.error("Failed to fetch candidates");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/api/v1/users", {
        headers,
        params: { role: "student", limit: 200 },
      });
      setStudents(res.data.data || []);
    } catch {
      console.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    if (activeTab === "mentors") {
      fetchMentors();
    } else {
      fetchAssignments();
    }
  }, [activeTab, assignmentFilter]);

  // ---------------------------------------------------------------- mentor CRUD
  const openAddMentor = () => {
    fetchCandidates();
    setEditingMentor(null);
    setMentorForm({
      user_id: "",
      expertise: "",
      bio: "",
      phone: "",
      availability: "available",
    });
    setShowMentorModal(true);
  };

  const openEditMentor = (m: Mentor) => {
    setEditingMentor(m);
    setMentorForm({
      user_id: m.user_id,
      expertise: m.expertise,
      bio: m.bio || "",
      phone: m.phone || "",
      availability: m.availability,
    });
    setShowMentorModal(true);
  };

  const handleSaveMentor = async () => {
    if (!mentorForm.expertise) {
      await alertError("Bidang keahlian wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingMentor) {
        await API.patch(`/api/v1/mentors/${editingMentor.id}`, mentorForm, {
          headers,
        });
        await alertSuccess("Data pembimbing berhasil diperbarui!", 1500);
      } else {
        if (!mentorForm.user_id) {
          await alertError("Pilih pengguna terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        await API.post("/api/v1/mentors", mentorForm, { headers });
        await alertSuccess("Pembimbing berhasil ditambahkan!", 1500);
      }
      setShowMentorModal(false);
      fetchMentors();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errors?: string } } })?.response?.data
          ?.errors || "Gagal menyimpan data pembimbing.";
      await alertError(
        typeof message === "string" ? message : "Gagal menyimpan data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMentor = async (id: string, name: string) => {
    const confirmed = await alertConfirm(
      `Hapus profil pembimbing ${name}? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;
    try {
      await API.delete(`/api/v1/mentors/${id}`, { headers });
      await alertSuccess("Pembimbing berhasil dihapus.", 1500);
      fetchMentors();
    } catch {
      await alertError("Gagal menghapus data pembimbing.");
    }
  };

  // ---------------------------------------------------------------- assignment
  const openAssignModal = () => {
    fetchStudents();
    setAssignForm({ student_id: "", mentor_id: "", notes: "" });
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!assignForm.student_id || !assignForm.mentor_id) {
      await alertError("Pilih siswa dan pembimbing terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      await API.post("/api/v1/mentor-assignments", assignForm, { headers });
      await alertSuccess("Penugasan pembimbing berhasil disimpan!", 1500);
      setShowAssignModal(false);
      fetchAssignments();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errors?: string } } })?.response?.data
          ?.errors || "Gagal menyimpan penugasan.";
      await alertError(
        typeof message === "string" ? message : "Gagal menyimpan penugasan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndAssignment = async (id: string) => {
    const confirmed = await alertConfirm(
      "Akhiri penugasan pembimbing ini? Siswa tidak akan memiliki pembimbing aktif."
    );
    if (!confirmed) return;
    try {
      await API.patch(`/api/v1/mentor-assignments/${id}/end`, {}, { headers });
      await alertSuccess("Penugasan berhasil diakhiri.", 1500);
      fetchAssignments();
    } catch {
      await alertError("Gagal mengakhiri penugasan.");
    }
  };

  // ---------------------------------------------------------------- filter / search
  const filteredMentors = mentors.filter(
    (m) =>
      m.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(
    (a) =>
      a.student?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.mentor?.user?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // ---------------------------------------------------------------- render helpers
  const AvailabilityBadge = ({
    status,
  }: {
    status: "available" | "limited" | "unavailable";
  }) => {
    const cfg = availabilityConfig[status];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
      >
        <cfg.icon size={12} />
        {cfg.label}
      </span>
    );
  };

  // ---------------------------------------------------------------- UI
  return (
    <main className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-accent-dark text-xs sm:text-sm mb-3">
          {eyebrow}
        </h1>
        <div className="flex items-center space-x-2 font-extrabold text-accent mb-6">
          <UserRound className="w-5 h-5" />
          <h2 className="text-2xl mt-1">{title}</h2>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
              <UserRound size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pembimbing</p>
              <p className="text-2xl font-bold text-gray-800">
                {mentors.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tersedia</p>
              <p className="text-2xl font-bold text-gray-800">
                {mentors.filter((m) => m.availability === "available").length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Penugasan Aktif</p>
              <p className="text-2xl font-bold text-gray-800">
                {assignments.filter((a) => !a.ended_at).length}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-4">
          {(
            [
              { key: "mentors", label: "Daftar Pembimbing", icon: UserRound },
              { key: "assignments", label: "Penugasan", icon: BookOpen },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === key
                  ? "bg-white text-accent shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== MENTORS TAB ===================== */}
      {activeTab === "mentors" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Search + Add */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari pembimbing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <button
              onClick={openAddMentor}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer"
            >
              <Plus size={15} />
              Tambah Pembimbing
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader />
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              Belum ada data pembimbing.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["No", "Nama", "Asal Instansi", "Email", "Keahlian", "Telepon", "Status", "Murid", "Aksi"].map((h) => (
                        <th
                          key={h}
                          className="text-left p-3 font-medium text-gray-500 uppercase text-xs"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMentors.map((m, i) => {
                      const institutionName =
                        m.user?.school?.name ||
                        m.user?.company?.name ||
                        m.user?.student?.school?.name ||
                        (m as any).institution_name ||
                        "-";

                      return (
                      <tr key={m.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="p-3 text-sm font-medium text-gray-800">
                          {m.user?.username || "-"}
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-800">
                          {institutionName}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {m.user?.email || "-"}
                        </td>
                        <td className="p-3 text-sm text-gray-800">
                          {m.expertise}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {m.phone || "-"}
                        </td>
                        <td className="p-3">
                          <AvailabilityBadge status={m.availability} />
                        </td>
                        <td className="p-3 text-sm text-gray-600 text-center">
                          {m.active_assignments_count ?? 0}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditMentor(m)}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteMentor(m.id, m.user?.username)
                              }
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredMentors.map((m) => {
                  const institutionName =
                    m.user?.school?.name ||
                    m.user?.company?.name ||
                    m.user?.student?.school?.name ||
                    (m as any).institution_name ||
                    "-";

                  return (
                  <div key={m.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {m.user?.username || "-"}
                        </p>
                        <p className="text-xs text-gray-500">{m.user?.email}</p>
                      </div>
                      <AvailabilityBadge status={m.availability} />
                    </div>
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <p>
                        <span className="font-medium">Asal Instansi:</span>{" "}
                        {institutionName}
                      </p>
                      <p>
                        <span className="font-medium">Keahlian:</span>{" "}
                        {m.expertise}
                      </p>
                      <p>
                        <span className="font-medium">Telepon:</span>{" "}
                        {m.phone || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Murid Aktif:</span>{" "}
                        {m.active_assignments_count ?? 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditMentor(m)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteMentor(m.id, m.user?.username)
                        }
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <Trash size={13} /> Hapus
                      </button>
                    </div>
                  </div>
                );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===================== ASSIGNMENTS TAB ===================== */}
      {activeTab === "assignments" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Controls */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari siswa atau pembimbing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <select
              value={assignmentFilter}
              onChange={(e) =>
                setAssignmentFilter(e.target.value as "all" | "active" | "ended")
              }
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="all">Semua Penugasan</option>
              <option value="active">Aktif</option>
              <option value="ended">Selesai</option>
            </select>
            <button
              onClick={openAssignModal}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer"
            >
              <Plus size={15} />
              Tugaskan Pembimbing
            </button>
          </div>

          {isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader />
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              Belum ada data penugasan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["No", "Siswa", "Pembimbing", "Ditugaskan Pada", "Status", "Catatan", "Aksi"].map((h) => (
                      <th
                        key={h}
                        className="text-left p-3 font-medium text-gray-500 uppercase text-xs whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, i) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-500">{i + 1}</td>
                      <td className="p-3 text-sm font-medium text-gray-800">
                        {a.student?.username || "-"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {a.mentor?.user?.username || "-"}
                      </td>
                      <td className="p-3 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(a.assigned_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3">
                        {a.ended_at ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <XCircle size={11} /> Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={11} /> Aktif
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-500 max-w-[180px] truncate">
                        {a.notes || "-"}
                      </td>
                      <td className="p-3">
                        {!a.ended_at && (
                          <button
                            onClick={() => handleEndAssignment(a.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            title="Akhiri Penugasan"
                          >
                            <RefreshCw size={12} /> Akhiri
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== MENTOR MODAL ===================== */}
      {showMentorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-lg text-gray-800">
                {editingMentor ? "Edit Pembimbing" : "Tambah Pembimbing"}
              </h3>
              <button
                onClick={() => setShowMentorModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {!editingMentor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pengguna <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mentorForm.user_id}
                    onChange={(e) =>
                      setMentorForm((p) => ({ ...p, user_id: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <option value="">-- Pilih Pengguna --</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.username} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bidang Keahlian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mentorForm.expertise}
                  onChange={(e) =>
                    setMentorForm((p) => ({ ...p, expertise: e.target.value }))
                  }
                  placeholder="Contoh: Pemrograman Web, Jaringan Komputer"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={mentorForm.phone}
                  onChange={(e) =>
                    setMentorForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status Ketersediaan
                </label>
                <select
                  value={mentorForm.availability}
                  onChange={(e) =>
                    setMentorForm((p) => ({
                      ...p,
                      availability: e.target.value as
                        | "available"
                        | "limited"
                        | "unavailable",
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="available">Tersedia</option>
                  <option value="limited">Terbatas</option>
                  <option value="unavailable">Tidak Tersedia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio / Deskripsi
                </label>
                <textarea
                  value={mentorForm.bio}
                  onChange={(e) =>
                    setMentorForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  placeholder="Deskripsi singkat tentang pembimbing..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => setShowMentorModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveMentor}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save size={15} />
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ASSIGN MODAL ===================== */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-lg text-gray-800">
                Tugaskan Pembimbing ke Siswa
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.student_id}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, student_id: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pembimbing <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.mentor_id}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, mentor_id: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">-- Pilih Pembimbing --</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.username} — {m.expertise} (
                      {availabilityConfig[m.availability].label})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Catatan
                </label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Catatan penugasan (opsional)..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save size={15} />
                {isSubmitting ? "Menyimpan..." : "Tugaskan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PembimbingManager;