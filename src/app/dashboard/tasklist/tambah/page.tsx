"use client";
import { ClipboardCheck, FileText, FileTextIcon } from "lucide-react";
import { ChangeEvent, use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "../../../../../utils/config";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface FormData {
  internship_id: string;
  title: string;
  description: string;
  due_date: string;
  link: string;
}

interface FormError {
  internship_id?: string;
  title?: string;
  description?: string;
  due_date?: string;
  link?: string;
}

interface Internship {
  student: {
    name: string;
  };
  internship: {
    id: string;
  };
}

const TambahTugas: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    internship_id: "",
    title: "",
    description: "",
    due_date: "",
    link: "",
  });

  const route = useRouter();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [error, setError] = useState<FormError>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(formData);

    try {
      const response = await API.post(ENDPOINTS.TASKS, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      setError({});

      setFormData({
        internship_id: "",
        title: "",
        description: "",
        due_date: "",
        link: "",
      });
      await alertSuccess("Berhasil menambahkan CV", 1500);
      console.log(response);
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setError(responseError);
        }
      }
      console.error(error);
    }
  };

  const handleCancel = async () => {
    const confirm = await alertConfirm(
      "Apakah anda yakin ingin membatalkan menambahkan tugas"
    );
    if (!confirm) return;

    route.back();
    // setFormData({ name: "", file: null });
    // setPreviewUrl(null);
  };

  const fetchInternship = async () => {
    try {
      const response = await API.get(ENDPOINTS.USERS, {
        params: {
          // limit:
          role: "student",
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log(response.data.data);
      setInternships(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInternship();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/tasklist"}
        >
          Daftar Tugas
        </Link>{" "}
        -&gt; Tambah Tugas
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <ClipboardCheck className="w-5 h-5" />
          <h2 className="text-2xl">Tambah Tugas</h2>
        </div>
      </div>

      <form
        className="bg-white rounded-2xl space-y-6 p-6 text-black"
        onSubmit={handleSubmit}
      >
        <div className="flex space-x-5">
          <div className="bg-accent/30 p-2 rounded-full w-10 h-10 my-auto">
            <ClipboardCheck />
          </div>
          <div>
            <h1 className="text-xl text-gray-800 font-extrabold">
              Tambah Tugas
            </h1>
            <span className="text-sm text-gray-300">
              Silahkan isi semua informasi yang dibutuhkan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label htmlFor="internship-id">Nama Magang</label>
          <select
            name="internship-id"
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent ${
              error.internship_id ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.internship_id}
            onChange={(e) =>
              setFormData({ ...formData, internship_id: e.target.value })
            }
          >
            <option value="">Pilih siswa magang</option>
            {internships.map((item) => (
              <option key={item.internship.id} value={item.internship.id}>
                {item.student.name}
              </option>
            ))}
          </select>
          {error.internship_id && (
            <p className="mt-1 text-sm text-red-500">{error.internship_id}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <label htmlFor="name">Judul Tugas</label>
          <input
            type="text"
            name="name"
            placeholder="Masukkan judul tugas"
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent  ${
              error.title ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          {error.title && (
            <p className="mt-1 text-sm text-red-500">{error.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label htmlFor="due-date">Tenggat Waktu</label>
          <input
            type="date"
            name="due-date"
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent  ${
              error.due_date ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.due_date}
            onChange={(e) =>
              setFormData({ ...formData, due_date: e.target.value })
            }
          />
          {error.due_date && (
            <p className="mt-1 text-sm text-red-500">{error.due_date}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label htmlFor="link">Link Tugas</label>
          <input
            type="text"
            name="link"
            placeholder="Masukkan link tugas (optional)"
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent  ${
              error.link ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
          {error.link && (
            <p className="mt-1 text-sm text-red-500">{error.link}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label htmlFor="description">Deskripsi</label>
          <textarea
            placeholder="Masukkan deskripsi tugas"
            name="description"
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent  ${
              error.description ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          {error.description && (
            <p className="mt-1 text-sm text-red-500">{error.description}</p>
          )}
        </div>

        <div className=" flex gap-4 justify-end">
          <button
            className="bg-gray-200  rounded-lg py-2 px-4 text-gray-600 min-w-24 cursor-pointer"
            type="button"
            onClick={handleCancel}
          >
            Batal
          </button>
          <button
            className="bg-accent rounded-lg py-2 px-4 text-white min-w-24 cursor-pointer hover:bg-accent-hover"
            type="submit"
          >
            Simpan
          </button>
        </div>
      </form>
    </main>
  );
};

export default TambahTugas;
