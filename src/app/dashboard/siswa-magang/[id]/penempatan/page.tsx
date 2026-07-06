"use client";

import { Calendar, ArrowLeft, AlertTriangle, Save, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "@/utils/config";
import Loader from "@/components/loader";

interface InternshipData {
  id: string; // internship id asli (dari response GET)
  start_date: string;
  end_date: string;
}

const EditPenempatanPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params); // ini USER ID, dipakai khusus untuk GET
  const router = useRouter();

  const [isLoad, setIsLoad] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [original, setOriginal] = useState<InternshipData | null>(null);
  const [internshipId, setInternshipId] = useState<string>(""); // dipakai khusus untuk PATCH
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchData = async () => {
    setIsLoad(true);
    try {
      // GET pakai user_id (id dari route)
      const response = await API.get(`${ENDPOINTS.INTERNSHIPS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const internship: InternshipData = response.data.data;
      setOriginal(internship);
      setInternshipId(internship.id); // simpan internship id asli buat PATCH nanti
      setStartDate(internship.start_date?.split("T")[0] ?? "");
      setEndDate(internship.end_date?.split("T")[0] ?? "");
    } catch (error) {
      console.error(error);
      setErrorMsg("Gagal memuat data penempatan.");
    } finally {
      setIsLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidRange = startDate && endDate && new Date(endDate) > new Date(startDate);
  const isAlreadyExpired = endDate ? new Date(endDate) < new Date() : false;
  const hasChanges =
    original &&
    (startDate !== (original.start_date?.split("T")[0] ?? "") ||
      endDate !== (original.end_date?.split("T")[0] ?? ""));

  const getDurationLabel = (start: string, end: string) => {
    if (!start || !end) return "-";
    const startD = new Date(start);
    const endD = new Date(end);
    if (endD <= startD) return "-";

    let months =
      (endD.getFullYear() - startD.getFullYear()) * 12 +
      (endD.getMonth() - startD.getMonth());
    let days = endD.getDate() - startD.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(endD.getFullYear(), endD.getMonth(), 0);
      days += prevMonth.getDate();
    }

    const weeks = Math.floor(days / 7);
    const remDays = days % 7;

    const parts: string[] = [];
    if (months > 0) parts.push(`${months} bulan`);
    if (weeks > 0) parts.push(`${weeks} minggu`);
    if (remDays > 0 && months === 0) parts.push(`${remDays} hari`);

    return parts.length > 0 ? parts.join(" ") : "Kurang dari 1 hari";
  };

  const getProgressPercent = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startD = new Date(start).getTime();
    const endD = new Date(end).getTime();
    const now = new Date().getTime();

    if (endD <= startD) return 0;
    if (now <= startD) return 0;
    if (now >= endD) return 100;

    return Math.round(((now - startD) / (endD - startD)) * 100);
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSubmit = async () => {
    if (!internshipId) {
      setErrorMsg("ID penempatan tidak ditemukan, tidak bisa menyimpan.");
      setShowConfirm(false);
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    try {
      // Patch pakai internship_id asli, BUKAN user_id dari route
      await API.patch(
        `${ENDPOINTS.INTERNSHIPS}/${internshipId}`,
        { start_date: startDate, end_date: endDate },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      router.push(`/dashboard/siswa-magang`);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(
        error?.response?.data?.errors ??
          error?.response?.data?.message ??
          "Gagal menyimpan perubahan durasi."
      );
      setShowConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoad) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader width={64} height={64} />
      </div>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link className="hover:underline hover:text-accent" href="/dashboard/siswa-magang">
          Siswa Magang
        </Link>{" "}
        -&gt; Ubah Penempatan
      </h1>

      <div className="flex items-center space-x-2 font-extrabold text-accent mb-8">
        <Calendar className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Ubah Durasi Magang</h2>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {startDate && endDate && !isValidRange && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Tanggal selesai harus setelah tanggal mulai.
          </div>
        )}

        {isValidRange && isAlreadyExpired && (
          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Tanggal selesai berada di masa lalu — magang akan tercatat sudah berakhir.
          </div>
        )}

        {isValidRange && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-accent" />
              Durasi: <span className="font-semibold">{getDurationLabel(startDate, endDate)}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${getProgressPercent(startDate, endDate)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getProgressPercent(startDate, endDate)}% berjalan dari hari ini
            </p>
          </div>
        )}

        {hasChanges && original && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm">
            <p className="font-semibold text-gray-700 mb-2">Perubahan yang akan disimpan:</p>
            <div className="flex flex-col gap-1 text-gray-600">
              <span>
                <span className="line-through text-gray-400">
                  {formatDateLabel(original.start_date)} - {formatDateLabel(original.end_date)}
                </span>
              </span>
              <span className="font-semibold text-gray-900">
                {formatDateLabel(startDate)} - {formatDateLabel(endDate)}
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Link
            href="/dashboard/siswa-magang"
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Batal
          </Link>
          <button
            type="button"
            disabled={!isValidRange || !hasChanges}
            onClick={() => setShowConfirm(true)}
            className="px-6 py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Konfirmasi Perubahan Durasi
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Durasi magang akan diubah menjadi{" "}
              <span className="font-semibold text-gray-900">
                {formatDateLabel(startDate)} - {formatDateLabel(endDate)}
              </span>
              . Lanjutkan?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
              >
                {isSaving ? "Menyimpan..." : "Ya, Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EditPenempatanPage;