"use client";

import {
  Bookmark,
  BriefcaseBusiness,
  Lock,
  MapPin,
  MessageCircle,
  UserCircle,
  Trash2,
  CirclePlus,
  Trash,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import RenderBlocks from "@/components/RenderBlocks";
import Image from "next/image";
import { API, ENDPOINTS } from "@/utils/config";
import { useRouter } from "next/navigation";
import { alertConfirm, alertError, alertSuccess } from "@/libs/alert";
import dynamic from "next/dynamic";
import { EditorProps } from "@/components/Editor";
import { AxiosError } from "axios";
import useDebounce from "@/hooks/useDebounce";
import { suppressErrorForSuperAdmin } from "@/libs/errorHandler";

const Editor = dynamic<EditorProps & { error?: string }>(
  () => import("@/components/Editor"),
  {
    ssr: false,
  }
);

const SelectNoSSR = dynamic(() => import("react-select"), { ssr: false });

interface JobOpening {
  title: string;
  description: any;
  company: {
    name: string;
  };
  city_regency: {
    name: string;
  };
  province: {
    name: string;
  };
  save_job_opening: boolean;
  user: {
    photo_profile: string;
  };
  type: string;
  location: string;
  grade: string;
  is_paid: boolean;
  qouta: number;
  is_available: boolean;
  field_id: string;
  duration_id: string;
  start_date: string;
  closing_date: string;
  tests: Array<{ id: string; title: string }>;
}

interface Test {
  id: string;
  title: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

type type = "part_time" | "full_time" | "";
type location = "onsite" | "remote" | "hybrid" | "field" | "";
type grade = "all" | "smk" | "mahasiswa" | "";

const DetailLowongan = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [jobOpening, setJobOpening] = useState<JobOpening>({
    title: "",
    description: "",
    company: {
      name: "",
    },
    city_regency: {
      name: "",
    },
    province: {
      name: "",
    },
    save_job_opening: false,
    user: {
      photo_profile: "",
    },
    type: "",
    location: "",
    grade: "",
    is_paid: false,
    qouta: 1,
    is_available: true,
    field_id: "",
    duration_id: "",
    start_date: "",
    closing_date: "",
    tests: [],
  });
  const [formData, setFormData] = useState<any>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>();
  const [tests, setTests] = useState<Test[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  // State untuk search dan data bidang/durasi
  const [searchField, setSearchField] = useState("");
  const [searchDuration, setSearchDuration] = useState("");
  const debouncedField = useDebounce(searchField, 500);
  const debouncedDuration = useDebounce(searchDuration, 500);
  const [fieldOptions, setFieldOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [durationOptions, setDurationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoadingField, setIsLoadingField] = useState(false);
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);

  const fetchJobOpening = async () => {
    try {
      const response = await API.get(`${ENDPOINTS.JOB_OPENINGS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        const data = response.data.data;
        setJobOpening(data);
        // Set form data dari job opening
        const formatDateToInput = (dateStr: any) => {
          if (!dateStr) return "";
          if (typeof dateStr === "string") {
            const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
            if (match) return match[0];
          }
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "";
          const pad = (n: number) => n.toString().padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };

        setFormData({
          title: data.title,
          type: data.type,
          location: data.location,
          grade: data.grade,
          is_paid: data.is_paid.toString(),
          qouta: data.qouta,
          is_available: data.is_available.toString(),
          field_id: data.field_id,
          duration_id: data.duration_id,
          description: data.description,
          tests: data.tests?.map((t: any) => t.id) || [],
          start_date: formatDateToInput(data.start_date),
          closing_date: formatDateToInput(data.closing_date),
        });
      }
    } catch (error: any) {
      console.error("Error fetching job opening:", error);
    }
  };

  const handleClickFavorite = async (id: string) => {
    try {
      const response = await suppressErrorForSuperAdmin(() => API.post(
        `${ENDPOINTS.SAVE_JOB_OPENINGS}`,
        {
          job_opening_id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      ), { showSuccessMessage: true, successMessage: "Lowongan berhasil disimpan!" });
      if (response && (response.status === 200 || response.status === 201)) {
        setJobOpening((prevJob) => ({
          ...prevJob,
          save_job_opening: !prevJob.save_job_opening,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const isConfirm = await alertConfirm(
        "Apakah anda yakin ingin menghapus lowongan ini?"
      );
      if (!isConfirm) return;

      setIsDeleting(true);
      await suppressErrorForSuperAdmin(() => API.delete(`${ENDPOINTS.JOB_OPENINGS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }), { showSuccessMessage: true, successMessage: "Lowongan berhasil dihapus!" });

      await alertSuccess("Lowongan berhasil dihapus!");
      router.push("/dashboard/lowongan");
    } catch (error) {
      console.error("Error deleting job opening:", error);
      await alertError("Gagal menghapus lowongan");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (date: Date) => {
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
      const payload = {
        ...formData,
        is_available: formData.is_available === "true" ? true : false,
        is_paid: formData.is_paid === "true" ? true : false,
        start_date: formData.start_date ? `${formData.start_date} 00:00:00` : "",
        closing_date: formData.closing_date ? `${formData.closing_date} 00:00:00` : "",
      };

      await suppressErrorForSuperAdmin(() => API.patch(`${ENDPOINTS.JOB_OPENINGS}/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }), { showSuccessMessage: true, successMessage: "Lowongan berhasil diperbarui!" });

      await alertSuccess("Lowongan berhasil diperbarui!");
      setIsEditMode(false);
      fetchJobOpening();
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        console.log("Response data:", error.response?.data);
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setErrors(responseError ?? {});
        }
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = (data: any) => {
    setFormData((prev: any) => ({
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
    const val = e.target.value;
    if (!val) {
      setFormData((prev: any) => ({ ...prev, start_date: "" }));
      return;
    }
    const selectedDate = new Date(val + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return;
    }
    setFormData((prev: any) => ({ ...prev, start_date: val }));
  };

  const handleChangeCloseDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setFormData((prev: any) => ({ ...prev, closing_date: "" }));
      return;
    }
    const selectedDate = new Date(val + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return;
    }
    setFormData((prev: any) => ({ ...prev, closing_date: val }));
  };

  const handleAddTest = () => {
    setFormData((prev: any) => ({
      ...prev,
      tests: [...prev.tests, ""],
    }));
  };

  const handleRemoveTest = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      tests: prev.tests.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleTestChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const newTests = [...prev.tests];
      newTests[index] = value;
      return { ...prev, tests: newTests };
    });
  };

  const handleCancelEdit = async () => {
    const isConfirm = await alertConfirm(
      "Apakah anda yakin ingin membatalkan perubahan?"
    );
    if (isConfirm) {
      setIsEditMode(false);
      setErrors({});
      fetchJobOpening();
    }
  };

  // Fetch bidang magang (FIELD)
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

  // Fetch durasi magang (DURATION)
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

  const fetchTests = async () => {
    try {
      const response = await API.get(ENDPOINTS.TESTS, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setTests(response.data.data);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  useEffect(() => {
    fetchJobOpening();
    fetchTests();
    setUserRole(Cookies.get("authorization"));
  }, []);

  const isCompanyOwner = userRole === "company";

  if (isLoadingDuration) {
    return (
      <main className="p-6 flex justify-center items-center min-h-[400px]">
        <p className="text-gray-400">Memuat data...</p>
      </main>
    );
  }

  // Render mode tampilan detail
  if (!isEditMode) {
    return (
      <main className="p-6">
        <h1 className="text-accent-dark text-sm mb-5">
          <Link
            className="hover:underline hover:text-accent"
            href={"/dashboard/lowongan"}
          >
            Lowongan
          </Link>{" "}
          -&gt; Detail Lowongan
        </h1>
        <div className="mb-8">
          <div className="flex items-center space-x-2 font-extrabold text-accent">
            <BriefcaseBusiness className="w-5 h-5" />
            <h2 className="text-2xl mt-2">Detail Lowongan</h2>
          </div>
        </div>
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  {jobOpening?.user?.photo_profile ? (
                    <div className="w-16 h-16 relative rounded-full border-white border">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${jobOpening.user.photo_profile}`}
                        alt="Logo Perusahaan"
                        fill
                        sizes="100%"
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <UserCircle className="w-16 h-16 text-[var(--color-accent)]" />
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                    {jobOpening?.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-blue-600 font-medium">
                      {jobOpening?.company?.name ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {jobOpening?.city_regency?.name ?? "N/A"}, {jobOpening?.province?.name ?? "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                {!isCompanyOwner ? (
                  <>
                    <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat Perusahaan</span>
                      <Lock className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleClickFavorite(id)}
                      className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 px-4 py-2 border border-gray-300 hover:border-blue-300 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          jobOpening.save_job_opening
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                        fill={
                          jobOpening.save_job_opening ? "currentColor" : "none"
                        }
                      />
                      <span>
                        {jobOpening.save_job_opening ? "Tersimpan" : "Simpan"}
                      </span>
                    </button>

                    <Link
                      href={`${id}/apply`}
                      className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Lamar Sekarang
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      Ubah Lowongan
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? "Menghapus..." : "Hapus"}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Content Area */}
            <div className="mt-6 text-gray-600">
              <RenderBlocks data={jobOpening.description} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Render mode edit form
  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/lowongan"}
        >
          Lowongan
        </Link>{" "}
        -&gt; Edit Lowongan
      </h1>
      <div className="flex items-center space-x-2 font-extrabold text-accent">
        <BriefcaseBusiness className="w-5 h-5" />
        <h2 className="text-2xl mt-2">Edit Lowongan Magang</h2>
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
              Edit Lowongan
            </h2>
            <p className="text-gray-400">
              Silahkan ubah informasi yang dibutuhkan
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
              value={formData.qouta}
              onChange={handleChangeQuota}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.qouta && (
              <p className="mt-1 text-sm text-red-500">{errors.qouta}</p>
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

          {/* Bidang Magang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bidang Magang
            </label>
            <SelectNoSSR
              isClearable
              isSearchable
              isLoading={isLoadingField}
              value={
                fieldOptions.find((opt) => opt.value === formData.field_id) ||
                null
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

          {/* Durasi Magang */}
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

          {/* Waktu Mulai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Mulai
            </label>
            <input
              type="date"
              value={formData.start_date || ""}
              disabled={isSubmitting}
              onChange={handleChangeStartDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
            )}
          </div>

          {/* Batas Akhir Mendaftar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batas Akhir Mendaftar
            </label>
            <input
              type="date"
              value={formData.closing_date || ""}
              disabled={isSubmitting}
              onChange={handleChangeCloseDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.closing_date && (
              <p className="mt-1 text-sm text-red-500">{errors.closing_date}</p>
            )}
          </div>

          {/* Pilih Tes */}
          <div className="col-span-2">
            <span className="py-5">Pilih Tes</span>
            <div className="flex flex-col space-y-3 py-5">
              {formData.tests?.map((selectedTest: string, index: number) => (
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
                    className="p-1 px-3 bg-red-500 rounded text-white hover:bg-red-600 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="relative">
              <div
                className={`${isSubmitting ? "opacity-50" : ""}`}
                aria-disabled={isSubmitting}
              >
                <Editor
                  onChange={handleEditorChange}
                  error={errors.description}
                  initialData={formData.description}
                />
              </div>

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
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={isSubmitting}
            className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </main>
  );
};
export default DetailLowongan;