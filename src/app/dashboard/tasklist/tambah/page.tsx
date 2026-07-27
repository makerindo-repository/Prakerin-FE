"use client";
import { ClipboardCheck, FileText, FileTextIcon } from "lucide-react";
import { ChangeEvent, use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });


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

interface InternshipOption {
  value: string;
  label: string;
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

  const [error, setError] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<InternshipOption[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  
  const fetchInternships = async () => {
    try {
      const response = await API.get(ENDPOINTS.USERS, {
        params: { role: "student", search: debouncedSearch, limit: 5 },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const mapped = Array.isArray(response.data?.data)
        ? response.data.data
            .filter((item: any) => item?.internship?.id)
            .map((item: any) => ({
              value: item.internship.id,
              label: item.student?.name || item.name || `Siswa #${item.id}`,
            }))
        : [];
      setOptions(mapped);
    } catch (err) {
      console.error(err);
      setOptions([]);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

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
    }finally {
      setIsSubmitting(false);
    }
  };

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

{/* Nama Magang */}
<div className="grid grid-cols-1 gap-2">
  <label>Nama Magang</label>
  <Select
    isClearable
    isSearchable
    isDisabled={isSubmitting}
    options={options}
    value={options.find((opt) => opt.value === formData.internship_id) || null}
    onChange={(selected: any) =>
      setFormData({ ...formData, internship_id: selected?.value || "" })
    }
    onInputChange={(input: any) => setSearch(input)}
    placeholder="Masukkan nama siswa/mahasiswa magang"
    styles={{
      control: (base, state) => ({
        ...base,
        backgroundColor: state.isDisabled ? '#e5e7eb' : '#e5e7eb',
        borderColor: error.internship_id ? '#ef4444' : '#d1d5db',
        borderRadius: '0.5rem',
        padding: '0.125rem',
        minHeight: '42px',
        boxShadow: state.isFocused 
          ? '0 0 0 2px rgba(var(--accent-rgb, 59, 130, 246), 0.5)' 
          : 'none',
        borderWidth: '1px',
        cursor: state.isDisabled ? 'not-allowed' : 'default',
        opacity: state.isDisabled ? 0.5 : 1,
        '&:hover': {
          borderColor: error.internship_id ? '#ef4444' : '#d1d5db',
        },
      }),
      valueContainer: (base) => ({
        ...base,
        padding: '2px 8px',
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
      }),
      placeholder: (base) => ({
        ...base,
        color: '#9ca3af',
      }),
      singleValue: (base, state) => ({
        ...base,
        color: state.isDisabled ? '#6b7280' : '#000000',
      }),
      menu: (base) => ({
        ...base,
        zIndex: 50,
      }),
    }}
  />
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
            disabled={isSubmitting}
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
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
            disabled={isSubmitting}
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
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
            disabled={isSubmitting}
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50  ${
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
            disabled={isSubmitting}
            className={`w-full p-2 border rounded-lg pr-12 focus:ring-2 outline-none transition-colors bg-gray-200 focus:border-transparent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
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
          <Link
            href="/dashboard/lowongan"
            onClick={async (e) => {
              e.preventDefault();
              if (isSubmitting) return;
              const isConfirm = await alertConfirm(
                "Apakah anda yakin ingin membatalkan!"
              );
              if (isConfirm) {
                route.push("/dashboard/lowongan");
              }
            }}
            className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            } `}
          >
            Batal
          </Link>
          <button
            disabled={isSubmitting}
            className="bg-accent rounded-lg py-2 px-4 text-white min-w-24 cursor-pointer hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default TambahTugas;
