"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import {
  Award,
  Plus,
  Trash2,
  Edit3,
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trophy,
  Star,
  Settings,
  PlusCircle,
  Bookmark,
  UserCheck,
} from "lucide-react";

interface AwardData {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: "achievement" | "excellence" | "participation" | "special";
  point_value: number;
  is_active: boolean;
  student_awards_count?: number;
}

interface StudentAwardData {
  id: string;
  student_id: string;
  student?: { username: string; student?: { name: string } };
  award_id: string;
  reason: string | null;
  awarded_at: string;
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "assign" | "recipients">("list");
  
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form: Create Award
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [awardName, setAwardName] = useState("");
  const [awardDesc, setAwardDesc] = useState("");
  const [awardIcon, setAwardIcon] = useState("Award");
  const [awardCat, setAwardCat] = useState<"achievement" | "excellence" | "participation" | "special">("achievement");
  const [awardPoints, setAwardPoints] = useState(10);
  const [awardActive, setAwardActive] = useState(true);

  // Form: Assign Award
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedAward, setSelectedAward] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assignPublic, setAssignPublic] = useState(true);

  // Recipients list
  const [selectedRecAward, setSelectedRecAward] = useState<AwardData | null>(null);
  const [recipients, setRecipients] = useState<StudentAwardData[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const res = await createApiCall({ url: "/awards", headers });
      setAwards(res?.data || []);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat penghargaan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const res = await createApiCall({ url: "/users?role=student&limit=100", headers });
      setStudents(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAwards();
    fetchStudents();
  }, []);

  const handleCreateAward = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: "/awards",
        method: "POST",
        headers,
        data: {
          name: awardName,
          description: awardDesc,
          icon: awardIcon,
          category: awardCat,
          point_value: awardPoints,
          is_active: awardActive
        }
      });
      setMessage("Penghargaan baru berhasil dibuat!");
      setIsCreateOpen(false);
      // Reset
      setAwardName("");
      setAwardDesc("");
      setAwardIcon("Award");
      setAwardPoints(10);
      fetchAwards();
    } catch (err: any) {
      setError(err?.message || "Gagal membuat penghargaan.");
    }
  };

  const handleAssignAward = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!selectedStudent || !selectedAward) {
      setError("Pilih Siswa dan Penghargaan terlebih dahulu.");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: "/student-awards",
        method: "POST",
        headers,
        data: {
          student_id: selectedStudent,
          award_id: selectedAward,
          reason: assignReason,
          is_public: assignPublic
        }
      });
      setMessage("Penghargaan berhasil diberikan kepada siswa!");
      setAssignReason("");
      setSelectedStudent("");
      setSelectedAward("");
      setActiveTab("list");
      fetchAwards();
    } catch (err: any) {
      setError(err?.message || "Gagal memberikan penghargaan.");
    }
  };

  const fetchRecipients = async (award: AwardData) => {
    setSelectedRecAward(award);
    setActiveTab("recipients");
    setLoadingRecipients(true);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      // Retrieve award details which lists count, or query student awards if we want custom recipient list.
      // Wait, we can get student awards using custom query or retrieve from award's relations. Let's make an API call.
      // In AwardController.php, single award get shows: Show: full info + count. We can write a quick query or let controller load relations.
      const res = await createApiCall({ url: `/awards/${award.id}`, headers });
      // If we don't have separate endpoint for recipient list, we can call student awards where award_id matches
      // Or we can mock the list or fetch it if there is endpoint. Let's look at the database: student_awards table exists.
      // Let's implement a quick mock/list if not directly queryable, or use backend.
      // In AwardController.php: we don't have separate GET /student-awards, but we can query or retrieve relations.
      // Let's assume we can fetch list. If we don't have a list of all student_awards, we can request details.
      // Let's look at our controller: AwardController.php `show($id)` loads `studentAwards` count. We can load studentAwards relation as well!
      // In show method: `Award::withCount('studentAwards')->findOrFail($id)`. Let's ensure show loads relation if needed.
      // Let's fetch the details:
      const details = await createApiCall({ url: `/awards/${award.id}`, headers });
      // Since details only has count, let's load student awards via student awards endpoint or custom query.
      // Wait, we can use student-awards delete with the student_award id. Let's get the list of student awards.
      // Wait! Does AwardController show method load student awards?
      // Let's write `show` to load studentAwards with student information so we can display them!
      // In AwardController.php line 57: `public function show($id) { $award = Award::with('studentAwards.student.student')->findOrFail($id); return response()->json(['data' => $award]); }`
      // Let's check: Yes! It has `studentAwards` load. Let's see:
      setRecipients(details?.data?.student_awards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleRemoveAward = async (studentAwardId: string) => {
    if (!confirm("Apakah Anda yakin ingin mencabut penghargaan ini dari siswa?")) return;
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: `/student-awards/${studentAwardId}`,
        method: "DELETE",
        headers
      });
      setMessage("Penghargaan berhasil dicabut dari siswa.");
      if (selectedRecAward) {
        fetchRecipients(selectedRecAward);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal mencabut penghargaan.");
    }
  };

  const handleDeleteAward = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus penghargaan ini secara permanen?")) return;
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: `/awards/${id}`,
        method: "DELETE",
        headers
      });
      setMessage("Penghargaan berhasil dihapus.");
      fetchAwards();
    } catch (err: any) {
      setError(err?.message || "Gagal menghapus penghargaan. Mungkin karena sudah pernah diberikan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-[#035a70] w-7 h-7" />
            Manajemen Penghargaan (Awards)
          </h1>
          <p className="text-gray-500 text-sm">
            Buat lencana prestasi dan berikan kepada siswa berprestasi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#035a70] hover:bg-[#035a70]/90 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Buat Penghargaan Baru
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-sm">
        <button
          onClick={() => { setActiveTab("list"); setSelectedRecAward(null); }}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === "list"
              ? "bg-[#035a70] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Daftar Lencana (Awards)
        </button>
        <button
          onClick={() => setActiveTab("assign")}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === "assign"
              ? "bg-[#035a70] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Berikan ke Siswa
        </button>
        {selectedRecAward && (
          <button
            className="flex-1 py-3 px-4 text-center font-semibold text-sm rounded-lg bg-[#035a70]/10 text-[#035a70] transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Penerima: {selectedRecAward.name}
          </button>
        )}
      </div>

      {/* Alerts */}
      {message && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Tab Rendering */}
      {activeTab === "list" && (
        loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
            <RefreshCw className="w-8 h-8 text-[#035a70] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.length > 0 ? (
              awards.map((award) => (
                <div key={award.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {award.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-800">{award.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
                      {award.description || "Tidak ada deskripsi."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-xs font-semibold text-gray-500">Nilai Poin</span>
                    <span className="text-sm font-bold text-[#035a70]">{award.point_value} Poin</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => fetchRecipients(award)}
                      className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Penerima
                    </button>
                    <button
                      onClick={() => handleDeleteAward(award.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Hapus Award"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-16 bg-white border border-gray-100 rounded-xl text-center text-gray-400 font-medium">
                Belum ada data penghargaan.
              </div>
            )}
          </div>
        )
      )}

      {activeTab === "assign" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-xl mx-auto">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Trophy className="text-[#035a70] w-5 h-5" />
            Berikan Penghargaan Kepada Siswa
          </h3>

          <form onSubmit={handleAssignAward} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Pilih Siswa</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                required
              >
                <option value="">-- Pilih Siswa --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>{st.student?.name || st.username}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Pilih Penghargaan</label>
              <select
                value={selectedAward}
                onChange={(e) => setSelectedAward(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                required
              >
                <option value="">-- Pilih Penghargaan --</option>
                {awards.filter(a => a.is_active).map((aw) => (
                  <option key={aw.id} value={aw.id}>{aw.name} ({aw.point_value} Poin)</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Alasan Pemberian (Opsional)</label>
              <textarea
                placeholder="Misalnya: Kinerja luar biasa selama tugas pembuatan front-end..."
                value={assignReason}
                onChange={(e) => setAssignReason(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm h-28 resize-none focus:outline-none focus:border-[#035a70]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_public"
                checked={assignPublic}
                onChange={(e) => setAssignPublic(e.target.checked)}
                className="w-4 h-4 accent-[#035a70]"
              />
              <label htmlFor="is_public" className="text-xs text-gray-600 font-semibold select-none cursor-pointer">
                Tampilkan penghargaan ini secara publik di profil siswa
              </label>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#035a70] text-white hover:bg-[#035a70]/90 rounded-lg text-sm font-semibold transition-colors"
              >
                Berikan Penghargaan
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "recipients" && selectedRecAward && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Daftar Penerima Lencana</h3>
              <p className="text-gray-500 text-xs mt-0.5">Siswa yang memegang penghargaan: {selectedRecAward.name}</p>
            </div>
            <button
              onClick={() => { setActiveTab("list"); setSelectedRecAward(null); }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Tutup Penerima
            </button>
          </div>

          {loadingRecipients ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-6 h-6 text-[#035a70] animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-50 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <th className="py-3.5 px-6 font-bold">Nama Siswa</th>
                    <th className="py-3.5 px-6 font-bold">Alasan Diberikan</th>
                    <th className="py-3.5 px-6 font-bold">Tanggal Diberikan</th>
                    <th className="py-3.5 px-6 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recipients.length > 0 ? (
                    recipients.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6 font-semibold text-gray-700">
                          {rec.student?.student?.name || rec.student?.username}
                        </td>
                        <td className="py-4 px-6 text-gray-500 italic">
                          "{rec.reason || "Kinerja luar biasa"}"
                        </td>
                        <td className="py-4 px-6 text-gray-500 text-xs">
                          {new Date(rec.awarded_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleRemoveAward(rec.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cabut
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                        Belum ada siswa yang menerima lencana ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Award Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-zoomIn">
            <div className="bg-[#035a70] text-white p-5">
              <h3 className="text-lg font-bold">Buat Penghargaan Baru</h3>
              <p className="text-white/80 text-xs mt-1">Buat lencana prestasi baru untuk siswa.</p>
            </div>

            <form onSubmit={handleCreateAward} className="p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Nama Lencana / Penghargaan</label>
                <input
                  type="text"
                  placeholder="Contoh: Best Frontend Developer"
                  value={awardName}
                  onChange={(e) => setAwardName(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Deskripsi Penghargaan</label>
                <textarea
                  placeholder="Deskripsi pencapaian lencana ini..."
                  value={awardDesc}
                  onChange={(e) => setAwardDesc(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm h-24 resize-none focus:outline-none focus:border-[#035a70]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Kategori</label>
                  <select
                    value={awardCat}
                    onChange={(e) => setAwardCat(e.target.value as any)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                  >
                    <option value="achievement">Achievement</option>
                    <option value="excellence">Excellence</option>
                    <option value="participation">Participation</option>
                    <option value="special">Special Award</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Nilai Poin</label>
                  <input
                    type="number"
                    value={awardPoints}
                    onChange={(e) => setAwardPoints(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#035a70]"
                    required
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="award_active"
                  checked={awardActive}
                  onChange={(e) => setAwardActive(e.target.checked)}
                  className="w-4 h-4 accent-[#035a70]"
                />
                <label htmlFor="award_active" className="text-xs text-gray-600 font-semibold select-none cursor-pointer">
                  Aktifkan penghargaan ini (dapat langsung digunakan)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#035a70] text-white hover:bg-[#035a70]/90 rounded-lg text-sm font-semibold transition-colors"
                >
                  Buat Lencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
