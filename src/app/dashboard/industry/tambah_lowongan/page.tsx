"use client";
import dynamic from "next/dynamic";
import { Briefcase, BriefcaseBusiness, CirclePlus, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EditorProps } from "@/components/Editor";
import { API, ENDPOINTS } from "@/utils/config";
import { getDurationUnit } from "@/utils/getDurationUnit";
import Cookies from "js-cookie";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Select from "react-select";
import  useDebounce  from "@/hooks/useDebounce";

const Editor = dynamic<EditorProps & { error?: string }>(
  () => import("@/components/Editor"),
  {
    ssr: false,
  }
);

const SelectNoSSR = dynamic(() => import("react-select"), { ssr: false });


interface Test {
  id: string;
  title: string;
}

interface CreateJobOpening {
  title: string;
  type: type;
  location: location;
  grade: grade;
  is_paid: string | boolean;
  qouta: number;
  is_available: string | boolean;
  field_id: string;
  duration_id: string;
  description: any;
  tests: string[];
  start_date: Date;
  closing_date: Date;
}

type type = "part_time" | "full_time" | "";
type location = "onsite" | "remote" | "hybrid" | "field" | "";
type grade = "all" | "smk" | "mahasiswa" | "";

interface FormErrors {
  [key: string]: string | undefined;
}

const tambahLowonganPage: React.FC = () => {
  const route = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<CreateJobOpening>({
    title: "",
    type: "",
    location: "",
    grade: "",
    is_paid: "",
    qouta: 1,
    is_available: "true",
    field_id: "",
    duration_id: "",
    description: "",
    tests: [],
    start_date: new Date(),
    closing_date: new Date(),
  });

  
  // ✅ Tambahan state untuk search dan data bidang/durasi
  const [searchField, setSearchField] = useState("");
  const [searchDuration, setSearchDuration] = useState("");

  const debouncedField = useDebounce(searchField, 500);
  const debouncedDuration = useDebounce(searchDuration, 500);

  const [fieldOptions, setFieldOptions] = useState<{ value: string; label: string }[]>([]);
  const [durationOptions, setDurationOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingField, setIsLoadingField] = useState(false);
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);

  const formatDateTime = (date: Date) => {
    // Pastikan date adalah objek Date
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      formData.is_available = formData.is_available === "true" ? true : false;
      formData.is_paid = formData.is_paid === "true" ? true : false;

      // Format tanggal sebelum dikirim
      const payload = {
        ...formData,
        start_date: formatDateTime(new Date(formData.start_date)),
        closing_date: formatDateTime(new Date(formData.closing_date)),
      };

      await API.post(ENDPOINTS.JOB_OPENINGS, payload, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      route.replace("/dashboard/lowongan");
      await alertSuccess("Lowongan berhasil ditambahkan!");
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
  const handleEditorChange = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      description: data,
    }));
  };

  const handleChangeQuota = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) < 1 || Number(e.target.value) > 50) {
      return;
    }
    setFormData({ ...formData, qouta: Number(e.target.value) });
  };

  const handleChangeStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    // Set jam ke 00:00:00 agar hanya membandingkan tanggal
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      // alertError("Tanggal mulai tidak boleh kurang dari hari ini!");
      return;
    }
    setFormData({ ...formData, start_date: selectedDate });
  };

  const handleChangeCloseDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    // Set jam ke 00:00:00 agar hanya membandingkan tanggal
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      // alertError("Tanggal mulai tidak boleh kurang dari hari ini!");
      return;
    }
    setFormData({ ...formData, closing_date: selectedDate });
  };


  const handleAddTest = () => {
    setFormData((prev) => ({
      ...prev,
      tests: [...prev.tests, ""], // tambah satu select kosong
    }));
  };

  const handleRemoveTest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  const handleTestChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newTests = [...prev.tests];
      newTests[index] = value;
      return { ...prev, tests: newTests };
    });
  };

  // 🔹 Fetch bidang magang (FIELD)
  useEffect(() => {
    const fetchFields = async () => {
      setIsLoadingField(true);
      try {
        const res = await API.get(ENDPOINTS.FIELDS, {
          params: { search: debouncedField, limit: 5 },
        });
        setFieldOptions(
          res.data.data.map((f: any) => ({
            value: f.id,
            label: f.name,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingField(false);
      }
    };
    fetchFields();
  }, [debouncedField]);

  // 🔹 Fetch durasi magang (DURATION)
  useEffect(() => {
    const fetchDurations = async () => {
      setIsLoadingDuration(true);
      try {
        const res = await API.get(ENDPOINTS.DURATIONS, {
          params: { search: debouncedDuration, limit: 5 },
        });
        const sorted = [...res.data.data].sort((a, b) => {
          const unitOrder: Record<string, number> = { day: 1, month: 2, year: 3 };
          const unitA = unitOrder[a.duration_unit] || 99;
          const unitB = unitOrder[b.duration_unit] || 99;
          if (unitA !== unitB) return unitA - unitB;
          return a.duration_value - b.duration_value;
        });
        setDurationOptions(
          sorted.map((d: any) => ({
            value: d.id,
            label: `${d.duration_value} ${d.duration_unit === 'month' ? 'Bulan' : d.duration_unit === 'year' ? 'Tahun' : 'Hari'}`,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDuration(false);
      }
    };
    fetchDurations();
  }, [debouncedDuration]);

 const fetchData = async () => {
    try {

      const response = await API.get(ENDPOINTS.TESTS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });


      setTests(response.data.data);
    } catch (error) {
      console.error("Error fetching durations:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // ... (fungsi handleSubmit dan lainnya tetap sama)

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/lowongan"}
        >
          Lowongan
        </Link>{" "}
        -&gt; Tambah Lowongan
      </h1>
      <div className="flex items-center  space-x-2 font-extrabold text-accent">
        <BriefcaseBusiness className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Lowongan Magang</h2>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 m-auto my-10 max-w-4xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gray-200 p-2 rounded-full w-10 h-10 my-auto">
            <Briefcase className="text-accent" size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800">
              Tambah Lowongan
            </h2>
            <p className="text-gray-400">
              Silahkan isi semua informasi yang dibutuhkan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-600">
          {/* Nama Lowongan */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Lowongan
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Masukkan judul lowongan"
              disabled={isSubmitting}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Jenis Magang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Magang
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as type })
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Pilih jenis magang</option>
              <option value="part_time">Paruh Waktu (Part-time)</option>
              <option value="full_time">Penuh Waktu (Full-time)</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Lokasi Magang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Magang
            </label>
            <select
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value as location,
                })
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Pilih lokasi magang</option>
              <option value="onsite">Kerja di kantor (Onsite/WFO)</option>
              <option value="remote">Kerja jarak jauh (Remote/WFH)</option>
              <option value="hybrid">Hibrida (Hybrid)</option>
            </select>
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Tingkat Pendidikan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tingkat Pendidikan
            </label>
            <select
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value as grade })
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Pilih tingkat pendidikan</option>
              <option value="all">Semua</option>
              <option value="smk">SMK</option>
              <option value="mahasiswa">Mahasiswa</option>
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-500">{errors.grade}</p>
            )}
          </div>

          {/* Status Magang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Magang
            </label>
            <select
              value={formData.is_paid as string}
              onChange={(e) =>
                setFormData({ ...formData, is_paid: e.target.value })
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Pilih status magang</option>
              <option value="true">Dibayar (Paid)</option>
              <option value="false">Tidak dibayar (Unpaid)</option>
            </select>
            {errors.is_paid && (
              <p className="mt-1 text-sm text-red-500">{errors.is_paid}</p>
            )}
          </div>

          {/* Kuota Magang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kuota Magang
            </label>
            <input
              type="number"
              value={formData.qouta} //actual value in migration is named qouta, rather updating table
              onChange={handleChangeQuota}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.quota && (
              <p className="mt-1 text-sm text-red-500">{errors.quota}</p>
            )}
          </div>

          {/* Status Ketersediaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apakah masih tersedia?
            </label>
            <select
              value={formData.is_available as string}
              onChange={(e) =>
                setFormData({ ...formData, is_available: e.target.value })
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="true">Tersedia</option>
              <option value="false">Tidak Tersedia</option>
            </select>
            {errors.is_available && (
              <p className="mt-1 text-sm text-red-500">{errors.is_available}</p>
            )}
          </div>

          {/* --- Bidang Magang --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bidang Magang
            </label>
            <SelectNoSSR
              isClearable
              isSearchable
              isLoading={isLoadingField}
              value={
                fieldOptions.find((opt) => opt.value === formData.field_id) || null
              }
              onChange={(selected: any) =>
                setFormData({
                  ...formData,
                  field_id: selected?.value || "",
                })
              }
              onInputChange={(val) => setSearchField(val)}
              options={fieldOptions}
              placeholder="Cari bidang magang..."
              className="text-sm"
              classNames={{
                control: ({ isFocused }) =>
                  `w-full px-2 py-1 border rounded-md transition-all ${
                    errors?.field_id ? "border-red-500" : "border-gray-300"
                  } ${
                    isFocused
                      ? "ring-2 ring-accent border-accent"
                      : "focus:border-accent"
                  }`,
                menu: () =>
                  "bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-50",
                option: ({ isFocused, isSelected }) =>
                  `px-3 py-2 cursor-pointer text-sm ${
                    isSelected
                      ? "bg-accent text-white"
                      : isFocused
                      ? "bg-blue-50"
                      : "hover:bg-gray-100"
                  }`,
                singleValue: () => "text-gray-800",
                placeholder: () => "text-gray-400",
              }}
            />
            {errors.field_id && (
              <p className="mt-1 text-sm text-red-500">{errors.field_id}</p>
            )}
          </div>

          {/* --- Durasi Magang --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durasi Magang
            </label>
            <SelectNoSSR
              isClearable
              isSearchable
              isLoading={isLoadingDuration}
              value={
                durationOptions.find(
                  (opt) => opt.value === formData.duration_id
                ) || null
              }
              onChange={(selected: any) =>
                setFormData({
                  ...formData,
                  duration_id: selected?.value || "",
                })
              }
              onInputChange={(val) => setSearchDuration(val)}
              options={durationOptions}
              placeholder="Cari durasi magang..."
              className="text-sm"
              classNames={{
                control: ({ isFocused }) =>
                  `w-full px-2 py-1 border rounded-md transition-all ${
                    errors?.duration_id ? "border-red-500" : "border-gray-300"
                  } ${
                    isFocused
                      ? "ring-2 ring-accent border-accent"
                      : "focus:border-accent"
                  }`,
                menu: () =>
                  "bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-50",
                option: ({ isFocused, isSelected }) =>
                  `px-3 py-2 cursor-pointer text-sm ${
                    isSelected
                      ? "bg-accent text-white"
                      : isFocused
                      ? "bg-blue-50"
                      : "hover:bg-gray-100"
                  }`,
                singleValue: () => "text-gray-800",
                placeholder: () => "text-gray-400",
              }}
            />
            {errors.duration_id && (
              <p className="mt-1 text-sm text-red-500">{errors.duration_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Mulai
            </label>
            <input
              type="date"
              value={
                formData.start_date
                  ? new Date(formData.start_date).toISOString().split("T")[0]
                  : ""
              }
              disabled={isSubmitting}
              onChange={handleChangeStartDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batas Akhir Mendaftar
            </label>
            <input
              type="date"
              value={
                formData.closing_date
                  ? new Date(formData.closing_date).toISOString().split("T")[0]
                  : ""
              }
              disabled={isSubmitting}
              onChange={handleChangeCloseDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.closing_date && (
              <p className="mt-1 text-sm text-red-500">{errors.closing_date}</p>
            )}
          </div>

          <div className="col-span-2">
            <span className="py-5">Pilih Tes</span>
            <div className="flex flex-col space-y-3 py-5">
              {formData.tests.map((selectedTest, index) => (
                <div className="flex" key={index}>
                  <select
                    value={selectedTest}
                    onChange={(e) => handleTestChange(index, e.target.value)}
                    className="w-5/6 me-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    <option value="">Pilih tes</option>
                    {tests.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="p-1 px-3 bg-red-500 rounded text-white hove:bg-red-600 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                    onClick={() => handleRemoveTest(index)}
                  >
                    <span>
                      <Trash className="text-white" />
                    </span>
                    <span>Hapus Tes</span>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="p-2 bg-green-500 my-3 rounded text-white hover:bg-green-600 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              onClick={handleAddTest}
            >
              <span>
                <CirclePlus className="text-white" />
              </span>
              <span>Tambah Tes</span>
            </button>
          </div>

          {/* Deskripsi */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>

            {/* <Editor onChange={handleEditorChange} /> */}

            <div className="relative">
              {/* Konten editor dengan opacity saat submit */}
              <div
                className={`${isSubmitting ? "opacity-50" : ""}`}
                aria-disabled={isSubmitting}
              >
                <Editor
                  onChange={handleEditorChange}
                  error={errors.cover_letter}
                />
              </div>

              {/* Overlay untuk blok interaksi + cursor not-allowed */}
              {isSubmitting && (
                <div
                  className="absolute inset-0 z-10 cursor-not-allowed"
                  style={{ pointerEvents: "auto" }}
                  aria-hidden="true"
                ></div>
              )}

              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-end">
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
