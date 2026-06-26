  "use client";

  import { BookOpen, Briefcase, Building, Handshake, Send } from "lucide-react";
  import {
    ChangeEvent,
    FormEvent,
    use,
    useEffect,
    useRef,
    useState,
  } from "react";
  import Cookies from "js-cookie";
  import Link from "next/link";
  import Image from "next/image";
  import { API, ENDPOINTS } from "@/utils/config";
  import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
  import dynamic from "next/dynamic";
  import { EditorProps } from "@/components/Editor";
  import { useRouter } from "next/navigation";
  import { AxiosError } from "axios";

  const Editor = dynamic<EditorProps & { error?: string }>(
    () => import("@/components/Editor"),
    {
      ssr: false,
    }
  );

  interface FormData {
    school_id?: string;
    company_id?: string;
    start_date: string;
    end_date: string;
    file: null | File;
    message: any;
  }

  interface FormErrors {
    start_date?: string;
    end_date?: string;
    file?: string;
    message?: string;
  }

  const BuatKerjaSamaPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const route = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const currentPreviewRef = useRef<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
      start_date: "",
      end_date: "",
      file: null,
      message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const handleEditorChange = (data: any) => {
      setFormData((prev) => ({
        ...prev,
        message: data,
      }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, file }));

      // revoke previous preview if any
      if (currentPreviewRef.current) {
        URL.revokeObjectURL(currentPreviewRef.current);
        currentPreviewRef.current = null;
      }

      if (file && file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        currentPreviewRef.current = url;
      } else {
        setPreviewUrl(null);
      }
    };

    const openFilePicker = () => {
      fileInputRef.current?.click();
    };

    const handleCancel = () => {
      if (currentPreviewRef.current) {
        URL.revokeObjectURL(currentPreviewRef.current);
        currentPreviewRef.current = null;
      }
      setFormData({ ...formData, file: null });
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      try {
        setIsSubmitting(true);

        const response = await API.get(`${ENDPOINTS.USERS}/${id}`, {
          params: {
            role: "school",
          },
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });

        formData.school_id = response.data.data.school.id;

        await API.post(ENDPOINTS.MOUS, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });

        setFormData({
          start_date: "",
          end_date: "",
          file: null,
          message: "",
        });

        await alertSuccess("Pengajuan kerja sama berhasil di kirim!");

        route.push(`/dashboard/sekolah/${id}`);
      } catch (error: AxiosError | unknown) {
        if (error instanceof AxiosError) {
          const responseError = error.response?.data.errors;
          if (typeof responseError === "string") {
            await alertError(responseError);
          } else {
            setErrors(responseError);
          }
        }
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <main className="p-6">
        <h1 className="text-accent-dark text-sm mb-5">
          <Link
            className="hover:underline hover:text-accent"
            href={"/dashboard/sekolah/"}
          >
            Sekolah
          </Link>{" "}
          -&gt;{" "}
          <Link
            className="hover:underline hover:text-accent"
            href={`/dashboard/sekolah/${id}`}
          >
            Detail Sekolah
          </Link>{" "}
          -&gt; Pengajuan Kerja Sama
        </h1>
        <div className="mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <Handshake className="w-5 h-5" />
            <h2 className="text-2xl mt-2">Pengajuan Kerja Sama</h2>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 m-auto my-10 max-w-4xl flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-200 p-2 rounded-full w-10 h-10 my-auto">
              <Handshake className="text-accent" size={24} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800">
                Ajukan Kerja Sama
              </h2>
              <p className="text-gray-400">
                Silahkan isi semua informasi yang dibutuhkan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                disabled={isSubmitting}
                id="start-date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.start_date && (
                <p className="mt-2 text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Berakhir
              </label>
              <input
                id="end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.end_date && (
                <p className="mt-2 text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 text-gray-600">
            {/* Pesan */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pesan
              </label>

                  <div className="relative">
                  {/* Konten editor dengan opacity saat submit */}
                  <div
                    className={`${isSubmitting ? "opacity-50" : ""}`}
                    aria-disabled={isSubmitting}
                  >
                    <Editor onChange={handleEditorChange} error={errors.message} />
                    </div>
                             {/* Overlay untuk blok interaksi + cursor not-allowed */}
                  {isSubmitting && (
                    <div
                      className="absolute inset-0 z-10 cursor-not-allowed"
                      style={{ pointerEvents: "auto" }}
                      aria-hidden="true"
                    />
                  )}
                </div>


              {errors.message && (
                <p className="mt-2 text-sm text-red-500">{errors.message}</p>
              )}

            </div>

            {/* File */}
            <div className="lg:col-span-1 ">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File Kerja Sama
              </label>

              {/* hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />

              {/* upload / preview area */}
              <div
                // only clickable to open picker if there is no preview
                onClick={() => {
                  if (!previewUrl && !isSubmitting) openFilePicker();
                }}
                className={`w-full min-h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${
                  previewUrl
                ? isSubmitting
                  ? "cursor-not-allowed"
                  : "cursor-default"
                : isSubmitting
                ? "cursor-not-allowed"
                : "cursor-pointer"
                } 
                ${isSubmitting ? "opacity-60" : ""} 
                ${errors.file ? "border-red-500" : "border-gray-300"}`}
              >
                {previewUrl ? (
                  <div className="w-full rounded-md border">
                    {/* custom toolbar di atas embed */}
                    <div className="flex items-center gap-2 p-2 border-b bg-gray-100">
                      <button
                        type="button"
                        onClick={openFilePicker}
                        disabled={isSubmitting} // disable saat submit
                        className="bg-accent text-white px-2 py-1 rounded-lg border text-sm shadow-sm disabled:cursor-not-allowed cursor-pointer"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting} // disable saat submit
                        className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm shadow-sm disabled:cursor-not-allowed cursor-pointer"
                      >
                        Hapus
                      </button>
                      <div className="flex-1" />
                    </div>

                    {/* PDF preview */}
                    <embed
                      src={previewUrl}
                      type="application/pdf"
                      width="100%"
                      className="w-full h-96"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Klik di sini untuk upload PDF
                  </p>
                )}
              </div>
              {errors.file && (
                <p className="mt-2 text-sm text-red-500">{errors.file}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-end">
            <Link
              href={`/dashboard/sekolah/${id}`}
              onClick={async (e) => {
                e.preventDefault();
                if (isSubmitting) return;
                const isConfirm = await alertConfirm(
                  "Apakah anda yakin ingin membatalkan!"
                );
                if (isConfirm) {
                  route.push(`/dashboard/sekolah/${id}`);
                }
              }}
              className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors  ${
                isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              Batal
            </Link>
            <button
              disabled={isSubmitting}
              type="submit"
              className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </form>
      </main>
    );
  };

  export default BuatKerjaSamaPage;
