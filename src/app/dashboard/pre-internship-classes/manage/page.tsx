"use client";
import { AlertCircle, Calendar, Edit, GraduationCap, Plus, Trash, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import LoaderData from "@/components/loader";
import { API } from "@/utils/config";
import Link from "next/link";

interface PreInternshipClass {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  capacity: number;
  level: "beginner" | "intermediate" | "advanced";
  status: "scheduled" | "ongoing" | "completed";
  enrolled_count: number;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const ManageClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<PreInternshipClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReload, setIsReload] = useState<boolean>(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<PreInternshipClass | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    capacity: 20,
    start_date: "",
    end_date: "",
  });
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    capacity: 20,
    start_date: "",
    end_date: "",
    status: "scheduled",
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/v1/pre-internship-classes", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [isReload]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateErrors({});

    // format dates to Y-m-d H:i:s
    const startFormatted = createForm.start_date ? createForm.start_date.replace("T", " ") + ":00" : "";
    const endFormatted = createForm.end_date ? createForm.end_date.replace("T", " ") + ":00" : "";

    try {
      await API.post(
        "/api/v1/pre-internship-classes",
        {
          ...createForm,
          start_date: startFormatted,
          end_date: endFormatted,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      await alertSuccess("Kelas berhasil dibuat!");
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        level: "beginner",
        capacity: 20,
        start_date: "",
        end_date: "",
      });
      setIsReload(!isReload);
    } catch (error) {
      if (error instanceof AxiosError) {
        setCreateErrors(error.response?.data.errors || {});
      } else {
        await alertError("Gagal membuat kelas");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (cls: PreInternshipClass) => {
    setSelectedClass(cls);
    
    // Convert Y-m-d H:i:s to Y-m-d\TH:i for date-local input
    const startStr = cls.start_date.substring(0, 16).replace(" ", "T");
    const endStr = cls.end_date.substring(0, 16).replace(" ", "T");

    setEditForm({
      title: cls.title,
      description: cls.description || "",
      level: cls.level,
      capacity: cls.capacity,
      start_date: startStr,
      end_date: endStr,
      status: cls.status,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setIsEditing(true);
    setEditErrors({});

    const startFormatted = editForm.start_date ? editForm.start_date.replace("T", " ").substring(0, 19) + (editForm.start_date.length === 16 ? ":00" : "") : "";
    const endFormatted = editForm.end_date ? editForm.end_date.replace("T", " ").substring(0, 19) + (editForm.end_date.length === 16 ? ":00" : "") : "";

    try {
      await API.patch(
        `/api/v1/pre-internship-classes/${selectedClass.id}`,
        {
          ...editForm,
          start_date: startFormatted,
          end_date: endFormatted,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      await alertSuccess("Kelas berhasil diperbarui!");
      setShowEditModal(false);
      setIsReload(!isReload);
    } catch (error) {
      if (error instanceof AxiosError) {
        setEditErrors(error.response?.data.errors || {});
      } else {
        await alertError("Gagal memperbarui kelas");
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (cls: PreInternshipClass) => {
    const confirm = await alertConfirm(`Apakah Anda yakin ingin menghapus kelas "${cls.title}"?`);
    if (!confirm) return;

    try {
      const response = await API.delete(`/api/v1/pre-internship-classes/${cls.id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await alertSuccess("Kelas berhasil dihapus!");
      setIsReload(!isReload);
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors || "Gagal menghapus kelas";
      await alertError(typeof errorMsg === "string" ? errorMsg : "Gagal menghapus");
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Beginner";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return level;
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Selesai";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ongoing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Master Data -&gt; Pre-Internship Classes</h1>

      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <GraduationCap className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar Kelas Pembekalan</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Table list view */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-12">
                  No
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Judul Kelas & Deskripsi
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Level
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Siswa Terdaftar
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Mulai
                </th>
                <th className="text-center p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
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
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Belum ada kelas pembekalan yang dibuat.</p>
                  </td>
                </tr>
              ) : (
                classes.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-gray-500 text-sm">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-sm truncate">{item.description || "-"}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLevelColor(item.level)}`}>
                        {getLevelLabel(item.level)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-800 flex items-center gap-1">
                        <Users size={14} className="text-gray-400" />
                        <span>{item.enrolled_count} / {item.capacity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(item.start_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/dashboard/pre-internship-classes/${item.id}/enrollments`}
                          className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors cursor-pointer text-xs font-bold"
                          title="Peserta & Absensi"
                        >
                          Peserta
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Kelas"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
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
              <GraduationCap className="text-accent w-5 h-5" />
              <span>Tambah Kelas Pembekalan Baru</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kelas<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul kelas"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    createErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {createErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{createErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Kelas
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi kelas..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level Kelas<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.level}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas (Siswa)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                      createErrors.capacity ? "border-red-500" : "border-gray-300"
                    }`}
                    min={1}
                    required
                  />
                  {createErrors.capacity && (
                    <p className="mt-1 text-xs text-red-500">{createErrors.capacity}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mulai Sesi<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.start_date}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, start_date: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm ${
                      createErrors.start_date ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {createErrors.start_date && (
                    <p className="mt-1 text-xs text-red-500">{createErrors.start_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selesai Sesi<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.end_date}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, end_date: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm ${
                      createErrors.end_date ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {createErrors.end_date && (
                    <p className="mt-1 text-xs text-red-500">{createErrors.end_date}</p>
                  )}
                </div>
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
                disabled={isCreating}
              >
                {isCreating ? "Menyimpan..." : "Simpan Kelas"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative my-8"
          >
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Edit className="text-accent w-5 h-5" />
              <span>Ubah Informasi Kelas</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kelas<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    editErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {editErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{editErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Kelas
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level Kelas<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas (Siswa)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                      editErrors.capacity ? "border-red-500" : "border-gray-300"
                    }`}
                    min={1}
                    required
                  />
                  {editErrors.capacity && (
                    <p className="mt-1 text-xs text-red-500">{editErrors.capacity}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mulai Sesi<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, start_date: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm ${
                      editErrors.start_date ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {editErrors.start_date && (
                    <p className="mt-1 text-xs text-red-500">{editErrors.start_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selesai Sesi<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, end_date: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm ${
                      editErrors.end_date ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {editErrors.end_date && (
                    <p className="mt-1 text-xs text-red-500">{editErrors.end_date}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Keberlangsungan<span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                >
                  <option value="scheduled">Scheduled (Belum Dimulai)</option>
                  <option value="ongoing">Ongoing (Sedang Berjalan)</option>
                  <option value="completed">Completed (Selesai)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isEditing}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 font-medium"
                disabled={isEditing}
              >
                {isEditing ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default ManageClassesPage;
