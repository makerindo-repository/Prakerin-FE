"use client";
import { AlertCircle, Edit, ShieldCheck, Plus, Trash, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import LoaderData from "@/components/loader";
import { API } from "@/utils/config";

interface Mentor {
  id: string;
  user_id: string;
  expertise: string;
  bio: string | null;
  phone: string | null;
  availability: "available" | "limited" | "unavailable";
  active_assignments_count: number;
  user: {
    username: string;
    email: string;
  };
}

interface Candidate {
  id: string;
  username: string;
  email: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const ManageMentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReload, setIsReload] = useState<boolean>(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    user_id: "",
    expertise: "",
    bio: "",
    phone: "",
    availability: "available",
  });
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    expertise: "",
    bio: "",
    phone: "",
    availability: "available" as "available" | "limited" | "unavailable",
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/v1/mentors", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setMentors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await API.get("/api/v1/mentors/candidates", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const userCandidates = response.data.data || [];
      setCandidates(userCandidates);
      if (userCandidates.length > 0) {
        setCreateForm((prev) => ({ ...prev, user_id: userCandidates[0].id }));
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [isReload]);

  const handleOpenCreate = () => {
    fetchCandidates();
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateErrors({});

    try {
      await API.post("/api/v1/mentors", createForm, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await alertSuccess("Profil pembimbing berhasil dibuat!");
      setShowCreateModal(false);
      setCreateForm({
        user_id: "",
        expertise: "",
        bio: "",
        phone: "",
        availability: "available",
      });
      setIsReload(!isReload);
    } catch (error) {
      if (error instanceof AxiosError) {
        setCreateErrors(error.response?.data.errors || {});
      } else {
        await alertError("Gagal membuat profil pembimbing");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setEditForm({
      expertise: mentor.expertise,
      bio: mentor.bio || "",
      phone: mentor.phone || "",
      availability: mentor.availability,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    setIsEditing(true);
    setEditErrors({});

    try {
      await API.patch(`/api/v1/mentors/${selectedMentor.id}`, editForm, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await alertSuccess("Profil pembimbing berhasil diperbarui!");
      setShowEditModal(false);
      setIsReload(!isReload);
    } catch (error) {
      if (error instanceof AxiosError) {
        setEditErrors(error.response?.data.errors || {});
      } else {
        await alertError("Gagal memperbarui profil pembimbing");
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (mentor: Mentor) => {
    const confirm = await alertConfirm(`Apakah Anda yakin ingin menghapus profil pembimbing "${mentor.user.username}"?`);
    if (!confirm) return;

    try {
      await API.delete(`/api/v1/mentors/${mentor.id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await alertSuccess("Profil pembimbing berhasil dihapus!");
      setIsReload(!isReload);
    } catch (error) {
      console.error("Error deleting mentor:", error);
      await alertError("Gagal menghapus profil pembimbing");
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">Tersedia</span>;
      case "limited":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">Terbatas</span>;
      case "unavailable":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Sibuk</span>;
      default:
        return null;
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Master Data -&gt; Mentors</h1>

      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Manajemen Profil Pembimbing</h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          <span>Tambah Pembimbing</span>
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
                  Nama Pembimbing
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Bidang Keahlian
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-40">
                  Jumlah Siswa Aktif
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  No Telepon
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
              ) : mentors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Belum ada profil pembimbing yang dibuat.</p>
                  </td>
                </tr>
              ) : (
                mentors.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-gray-500 text-sm">
                      {index + 1}
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900">
                      {item.user.username}
                      <div className="text-xs font-normal text-gray-500">{item.user.email}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {item.expertise}
                    </td>
                    <td className="p-4">
                      {getAvailabilityBadge(item.availability)}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">
                      {item.active_assignments_count} Siswa
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {item.phone || "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors cursor-pointer"
                          title="Ubah Profil"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
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
              <ShieldCheck className="text-accent w-5 h-5" />
              <span>Tambah Profil Pembimbing Baru</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Akun User<span className="text-red-500">*</span>
                </label>
                {candidates.length === 0 ? (
                  <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    Tidak ada akun user (non-student) yang belum memiliki profil pembimbing.
                  </p>
                ) : (
                  <select
                    value={createForm.user_id}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, user_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    {candidates.map((cand) => (
                      <option key={cand.id} value={cand.id}>
                        {cand.username} ({cand.email})
                      </option>
                    ))}
                  </select>
                )}
                {createErrors.user_id && (
                  <p className="mt-1 text-xs text-red-500">{createErrors.user_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keahlian / Spesialisasi<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.expertise}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, expertise: e.target.value }))}
                  placeholder="Contoh: Web Developer, UI/UX Designer"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    createErrors.expertise ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {createErrors.expertise && (
                  <p className="mt-1 text-xs text-red-500">{createErrors.expertise}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No Telepon
                  </label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Contoh: 0812345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Ketersediaan<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.availability}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    <option value="available">Tersedia (Available)</option>
                    <option value="limited">Terbatas (Limited)</option>
                    <option value="unavailable">Sibuk (Unavailable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / Deskripsi Singkat
                </label>
                <textarea
                  value={createForm.bio}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Ketikkan bio singkat pembimbing..."
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
                disabled={isCreating || candidates.length === 0}
              >
                {isCreating ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
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
              <span>Ubah Profil Pembimbing: {selectedMentor.user.username}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keahlian / Spesialisasi<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.expertise}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, expertise: e.target.value }))}
                  placeholder="Masukkan keahlian"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    editErrors.expertise ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {editErrors.expertise && (
                  <p className="mt-1 text-xs text-red-500">{editErrors.expertise}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No Telepon
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Masukkan no telepon"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Ketersediaan<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.availability}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, availability: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    <option value="available">Tersedia (Available)</option>
                    <option value="limited">Terbatas (Limited)</option>
                    <option value="unavailable">Sibuk (Unavailable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / Deskripsi Singkat
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Ketikkan bio singkat..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm"
                />
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

export default ManageMentorsPage;
