"use client";
import { useRef, useState } from "react";
import { UploadCloud, X, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "@/utils/config";
import { alertError } from "@/libs/alert";

interface ImportSummary {
  total_rows: number;
  created: number;
  skipped_existing: number;
  skipped_not_verified: number;
  skipped_invalid: number;
  failed: number;
}

interface ImportInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'university' untuk Data Universitas, 'school' untuk Data Sekolah (SMK). */
  type: "university" | "school";
  onImported?: () => void; // dipanggil setelah import sukses, biar list di belakang modal refresh
}

export default function ImportInstitutionModal({
  isOpen,
  onClose,
  type,
  onImported,
}: ImportInstitutionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setFile(null);
    setSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validExtensions = [".xlsx", ".xls"];
    if (!validExtensions.some((ext) => selected.name.toLowerCase().endsWith(ext))) {
      alertError("File harus berformat .xlsx atau .xls");
      return;
    }

    setFile(selected);
    setSummary(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await API.post(`${ENDPOINTS.ADMIN_SCHOOLS}/import`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
        // File bisa ribuan baris — proses di server bisa agak lama, jangan
        // buru-buru timeout di sisi browser.
        timeout: 0, // 0 = Infinite (Tunggu sampai server selesai)
      });

      setSummary(res.data.summary);
      if (onImported) onImported();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Gagal mengimpor file. Coba lagi.";
      await alertError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const label = type === "university" ? "Perguruan Tinggi" : "Sekolah";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Import Data {label} dari Excel</h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {summary ? (
            <div className="flex flex-col items-center text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Import Selesai</h4>

              <div className="w-full grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">Total Baris</p>
                  <p className="font-bold text-gray-900 text-lg">{summary.total_rows}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-emerald-600 text-xs">Berhasil Dibuat</p>
                  <p className="font-bold text-emerald-700 text-lg">{summary.created}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-amber-600 text-xs">Dilewati (Sudah Ada)</p>
                  <p className="font-bold text-amber-700 text-lg">{summary.skipped_existing}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-500 text-xs">Dilewati (Bukan LLDikti Resmi)</p>
                  <p className="font-bold text-slate-700 text-lg">{summary.skipped_not_verified}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 col-span-2">
                  <p className="text-red-500 text-xs">Gagal / Data Tidak Valid</p>
                  <p className="font-bold text-red-600 text-lg">{summary.failed + summary.skipped_invalid}</p>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={reset}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
                >
                  Import File Lain
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-sm font-medium"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-accent rounded-2xl py-10 px-4 text-center transition-colors"
              >
                {file ? (
                  <>
                    <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                    <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB — klik untuk ganti file</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">Klik untuk pilih file Excel</p>
                    <p className="text-xs text-gray-400">.xlsx atau .xls</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Sistem otomatis mengambil kolom <b>Nama</b>, <b>Email</b>, <b>Password</b>, dan{" "}
                  <b>Alamat</b> saja dari file (nama kolom fleksibel, tidak harus urutan persis).
                  Baris dengan nama yang sudah terdaftar otomatis dilewati (tidak dobel). File{" "}
                  <b>wajib punya kolom status</b> (mis. "Sumber Data Provinsi") — hanya baris
                  berstatus persis <b>"Kode LLDikti resmi"</b> yang akan diimpor; baris lain
                  (perkiraan/tidak diketahui) otomatis dilewati.
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="mt-5 w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengimpor... (bisa beberapa menit untuk file besar)
                  </>
                ) : (
                  "Mulai Import"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}