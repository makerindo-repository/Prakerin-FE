"use client";
import { AlertCircle, BookOpen, Clock, Download, Edit, FileText, Plus, Trash, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import LoaderData from "@/components/loader";
import { API } from "@/utils/config";

interface Guide {
  id: string;
  type: "student" | "school" | "company";
  title: string;
  description: string | null;
  file_path: string;
  is_published: boolean;
  created_at: string;
  uploaded_by?: {
    username: string;
  };
}

interface FormErrors {
  [key: string]: string | undefined;
}

const GuidesAdminPage: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isReload, setIsReload] = useState<boolean>(false);

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Selected guide for edit or preview
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    type: "student",
    file: null as File | null,
  });
  const [uploadErrors, setUploadErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "student" as "student" | "school" | "company",
    is_published: true,
    file: null as File | null,
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/v1/guides/admin/all", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setGuides(response.data.data || []);
    } catch (error) {
      console.error("Error fetching admin guides:", error);
      await alertError("Gagal memuat data panduan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [isReload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Hanya file PDF yang diperbolehkan!");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB!");
        return;
      }
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setUploadErrors({ file: "File PDF wajib diunggah" });
      return;
    }

    setIsUploading(true);
    setUploadErrors({});

    try {
      const data = new FormData();
      data.append("title", uploadForm.title);
      data.append("description", uploadForm.description);
      data.append("type", uploadForm.type);
      data.append("file", uploadForm.file);

      await API.post("/api/v1/guides", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await alertSuccess("Panduan berhasil diunggah!");
      setShowUploadModal(false);
      setUploadForm({
        title: "",
        description: "",
        type: "student",
        file: null,
      });
      setIsReload(!isReload);
    } catch (error) {
      if (error instanceof AxiosError) {
        setUploadErrors(error.response?.data.errors || {});
      } else {
        await alertError("Gagal mengunggah panduan");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEdit = (guide: Guide) => {
    setSelectedGuide(guide);
    setEditForm({
      title: guide.title,
      description: guide.description || "",
      type: guide.type,
      is_published: guide.is_published,
      file: null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide) return;

    setIsEditing(true);
    setEditErrors({});

    try {
      if (editForm.file) {
        // Laravel gak parse multipart body buat method PATCH asli, jadi
        // pakai POST + _method spoofing biar file-nya kebaca tapi tetap
        // ke-handle sama method update() di backend.
        const data = new FormData();
        data.append("_method", "PATCH");
        data.append("title", editForm.title);
        data.append("description", editForm.description);
        data.append("type", editForm.type);
        data.append("is_published", editForm.is_published ? "1" : "0");
        data.append("file", editForm.file);

        await API.post(`/api/v1/guides/${selectedGuide.id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
      } else {
        await API.patch(
          `/api/v1/guides/${selectedGuide.id}`,
          {
            title: editForm.title,
            description: editForm.description,
            type: editForm.type,
            is_published: editForm.is_published,
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        );
      }

      await alertSuccess("Panduan berhasil diperbarui!");
      setShowEditModal(false);
      setIsReload(!isReload);
    } catch (error) {
      if (error instanceof AxiosError) {
        setEditErrors(error.response?.data.errors || {});
      } else {
        await alertError("Gagal memperbarui panduan");
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (guide: Guide) => {
    const confirm = await alertConfirm(`Apakah Anda yakin ingin menghapus panduan "${guide.title}"?`);
    if (!confirm) return;

    try {
      await API.delete(`/api/v1/guides/${guide.id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      await alertSuccess("Panduan berhasil dihapus!");
      setIsReload(!isReload);
    } catch (error) {
      console.error("Error deleting guide:", error);
      await alertError("Gagal menghapus panduan");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "Siswa";
      case "school":
        return "Sekolah";
      case "company":
        return "Perusahaan";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "school":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "company":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">Master Data -&gt; Panduan</h1>

      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Manajemen Dokumen Panduan</h2>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          <span>Upload Panduan</span>
        </button>
      </div>

      {/* Table List View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-12">
                  No
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Judul Dokumen & Deskripsi
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Target Penerima
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Status Publikasi
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Diunggah Oleh
                </th>
                <th className="text-left p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-32">
                  Tanggal Unggah
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
              ) : guides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Belum ada dokumen panduan yang diunggah.</p>
                  </td>
                </tr>
              ) : (
                guides.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-gray-500 text-sm">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        <FileText size={16} className="text-gray-400" />
                        <span>{item.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-sm truncate">{item.description || "-"}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleColor(item.type)}`}>
                        {getRoleLabel(item.type)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        item.is_published
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}>
                        {item.is_published ? "Published" : "Draft (Hidden)"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {item.uploaded_by?.username || "Admin"}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedGuide(item);
                            setShowPreviewModal(true);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="Preview PDF"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Info"
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative my-8"
          >
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="text-accent w-5 h-5" />
              <span>Upload Dokumen Panduan Baru</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Penerima<span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="student">Siswa / Mahasiswa</option>
                  <option value="school">Sekolah</option>
                  <option value="company">Perusahaan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Dokumen<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul panduan"
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent ${
                    uploadErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {uploadErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{uploadErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi / Keterangan
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Ketikkan deskripsi singkat panduan..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Dokumen (PDF saja, maks 10MB)<span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-gray-300 hover:border-accent rounded-lg p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center cursor-pointer text-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">
                    {uploadForm.file ? uploadForm.file.name : "Pilih file PDF Anda"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {uploadForm.file ? `${(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB` : "PDF hingga 10MB"}
                  </span>
                </div>
                {uploadErrors.file && (
                  <p className="mt-1 text-xs text-red-500">{uploadErrors.file}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 font-medium"
                disabled={isUploading || !uploadForm.file}
              >
                {isUploading ? "Mengunggah..." : "Simpan & Publikasikan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedGuide && (
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
              <span>Ubah Informasi Panduan</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Penerima
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value as "student" | "school" | "company" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="student">Siswa / Mahasiswa</option>
                  <option value="school">Sekolah</option>
                  <option value="company">Perusahaan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Dokumen<span className="text-red-500">*</span>
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
                  Deskripsi / Keterangan
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Ketikkan deskripsi..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ganti File PDF <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <div className="relative border-2 border-dashed border-gray-300 hover:border-accent rounded-lg p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center cursor-pointer text-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.type !== "application/pdf") {
                        alert("Hanya file PDF yang diperbolehkan!");
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert("Ukuran file maksimal 10MB!");
                        return;
                      }
                      setEditForm((prev) => ({ ...prev, file }));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">
                    {editForm.file ? editForm.file.name : "Biarkan kosong kalau tidak ingin mengganti file"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Publikasikan Dokumen</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_published}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
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

      {/* PDF Preview Modal */}
      {showPreviewModal && selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative flex flex-col h-[85vh]">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-bold text-gray-800 pr-10 mb-4 truncate flex items-center gap-2">
              <FileText className="text-accent" />
              <span>Preview: {selectedGuide.title}</span>
            </h3>

            <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden relative border border-gray-200">
              <iframe
                src={`${process.env.NEXT_PUBLIC_API_URL || "https://api.prakerin.id"}/storage/${selectedGuide.file_path}`}
                className="w-full h-full"
                title={selectedGuide.title}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GuidesAdminPage;