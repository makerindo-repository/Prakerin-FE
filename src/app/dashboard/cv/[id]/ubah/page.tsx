"use client";
import { FileText } from "lucide-react";
import { ChangeEvent, use, useEffect, useRef, useState } from "react";
import { API, ENDPOINTS } from "../../../../../../utils/config";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

interface FormData {
  name: string;
  file: File | null;
}

interface FormErrors {
  name?: string;
  file?: string;
}

const UbahCvPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const route = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    file: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (currentPreviewRef.current) {
        URL.revokeObjectURL(currentPreviewRef.current);
        currentPreviewRef.current = null;
      }
    };
  }, []);

  // Detect mobile screen size to decide how to preview PDF
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) return;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await API.post(
        `${ENDPOINTS.CURRICULUM_VITAE}/${id}?_method=PATCH`,
        {
          name: formData.name,
          file: typeof formData.file === "string" ? undefined : formData.file,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      await alertSuccess("Berhasil mengubah CV");
      // cleanup local preview & form
      if (currentPreviewRef.current) {
        URL.revokeObjectURL(currentPreviewRef.current);
        currentPreviewRef.current = null;
      }
      setFormData({ name: "", file: null });
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      route.push("/dashboard/cv");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setErrors(responseError);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
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

  const openFilePicker = () => {
    if (isSubmitting) return;
    fileInputRef.current?.click();
  };

  const fetchData = async () => {
    try {
      const cv = API.get(`${ENDPOINTS.CURRICULUM_VITAE}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const preview = API.get(`${ENDPOINTS.CURRICULUM_VITAE}/${id}/preview`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        responseType: "blob", // penting!
      });

      const response = await Promise.all([cv, preview]);
      setFormData(response[0].data.data);
      const fileBlob = new Blob([response[1].data], {
        type: "application/pdf",
      });
      const fileUrl = URL.createObjectURL(fileBlob);
      currentPreviewRef.current = fileUrl;
      setPreviewUrl(fileUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/cv"}
        >
          Curiculum Vitae
        </Link>{" "}
        -&gt; Ubah Curiculum Vitae
      </h1>

      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl">Curiculum Vitae</h2>
        </div>
      </div>

      <form
        className="bg-white rounded-2xl space-y-6 p-6 text-black"
        onSubmit={handleSubmit}
        aria-busy={isSubmitting}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            <div className="flex space-x-5">
              <div>
                <h1 className="text-xl text-gray-800 font-extrabold">
                  Ubah CV
                </h1>
                <span className="text-sm text-gray-600">
                  Silahkan isi semua informasi yang dibutuhkan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="name">Nama CV</label>
              <input
                type="text"
                name="name"
                disabled={isSubmitting}
                className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-accent border-gray-300 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CV
              </label>

              {/* hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isSubmitting} // disable saat submitting
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
                } ${isSubmitting ? "opacity-60" : ""} ${
                  errors.file ? "border-red-500" : "border-gray-300"
                }`}
              >
                {previewUrl ? (
                  <div className="w-full rounded-md border">
                    {/* custom toolbar di atas embed */}
                    <div className="flex items-center gap-2 p-2 border-b bg-gray-100">
                      <button
                        type="button"
                        onClick={openFilePicker}
                        disabled={isSubmitting} // disable saat submit
                        className="bg-accent text-white px-2 py-1 rounded-lg border text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting} // disable saat submit
                        className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Hapus
                      </button>
                      <div className="flex-1" />
                    </div>

                    {/* PDF preview - responsive: link on mobile, embed on desktop */}
                    {isMobile ? (
                      <div className="p-4 text-center bg-gray-50">
                        <FileText className="w-16 h-16 mx-auto text-accent mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          File PDF berhasil dipilih: <br />
                          <span className="font-medium">
                            {formData.file?.name}
                          </span>
                        </p>
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-accent-hover"
                        >
                          Buka PDF
                        </a>
                      </div>
                    ) : (
                      <embed
                        src={previewUrl}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                        className="w-full"
                      />
                    )}
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

            <div className="flex gap-4 justify-end  items-stretch">
              <Link
                href="/dashboard/cv"
                className={`bg-gray-200 rounded-lg py-2 px-4 text-gray-600 min-w-24 text-center hover:bg-gray-300
                  ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
                onClick={async (e) => {
                  e.preventDefault();
                  if (isSubmitting) return;
                  const isConfirm = await alertConfirm(
                    "Apakah anda yakin ingin membatalkan!"
                  );
                  if (isConfirm) route.push("/dashboard/cv");
                }}
              >
                Batal
              </Link>
              <button
                disabled={isSubmitting}
                className="bg-accent rounded-lg py-2 px-4 text-white min-w-24 cursor-pointer hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </>
        )}
      </form>
    </main>
  );
};

export default UbahCvPage;
