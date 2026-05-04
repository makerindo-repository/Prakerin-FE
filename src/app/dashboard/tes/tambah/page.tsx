  "use client";
import dynamic from "next/dynamic";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { API, ENDPOINTS } from "../../../../../utils/config";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  type: type;
  link: string;
  description: string;
}

interface Error {
  title?: string;
  type?: string;
  link?: string;
  description?: string;
}

type type = "theory" | "practice" | "other" | "";

const tambahLowonganPage: React.FC = () => {
  const route = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    link: "",
    description: "",
  });

  const [errors, setErrors] = useState<Error>({});

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
    await new Promise((resolve) => setTimeout(resolve, 5000));

      await API.post(ENDPOINTS.TESTS, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await alertSuccess("Tes berhasil ditambahkan!");

      route.replace("/dashboard/tes");
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
          href={"/dashboard/tes"}
        >
          Tes
        </Link>{" "}
        -&gt; Tambah Tes
      </h1>
      <div className="flex items-center  space-x-2 font-extrabold text-accent">
        <HelpCircle className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Tes</h2>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 m-auto my-10 max-w-4xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gray-200 p-2 rounded-full w-10 h-10 my-auto">
            <HelpCircle className="text-accent" size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800">Tambah Tes</h2>
            <p className="text-gray-400">
              Silahkan isi semua informasi yang dibutuhkan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-600">
          {/* Nama tes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Tes
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Masukkan judul tes"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Tes
            </label>
            <select
              disabled={isSubmitting}
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as type })
              }
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Pilih Jenis Tes</option>
              <option value="theory">Tes Teori</option>
              <option value="practice">Tes Praktik</option>
              <option value="other">Tes Lainnya</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Link tes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Tes
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.link ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://makerindo.co.id"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
            />
            {errors.link && (
              <p className="mt-1 text-sm text-red-500">{errors.link}</p>
            )}
          </div>

          {/* Deskripsi Tes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
              placeholder="Masukkan deskripsi tentang tes"
              value={formData.description}
              className={`resize-none w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-end">
          <Link
            href="/dashboard/tes"
            onClick={async (e) => {
              e.preventDefault();
              if (isSubmitting) return;
              const isConfirm = await alertConfirm(
                "Apakah anda yakin ingin membatalkan!"
              );
              if (isConfirm) {
                route.push("/dashboard/tes");
              }
            }}
            className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ${isSubmitting ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default tambahLowonganPage;
