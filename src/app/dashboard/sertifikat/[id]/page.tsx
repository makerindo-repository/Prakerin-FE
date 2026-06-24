"use client";
import { FileText } from "lucide-react";
import { ChangeEvent, use, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { API, ENDPOINTS } from "@/utils/config";

interface FormData {
  name: string;
  file: File | null;
}

interface FormErrors {
  name?: string;
  file?: string;
}

interface Sertifkat {
    name: string;
    bidang: string
    company_name: string;
    created_at: string;
    file: File | null;

}

const detailSertifikat = ({ params }: { params: Promise<{ id: string }> }) => {
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
          Sertifikat
        </Link>{" "}
        -&gt; Detail Sertifikat
      </h1>

      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <FileText className="w-5 h-5" />
          <h2 className="text-2xl">Detail Sertifikat</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl space-y-6 p-6 text-black">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            <div className="lg:col-span-1">
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
          </>
        )}
      </div>
    </main>
  );
};

export default detailSertifikat;
