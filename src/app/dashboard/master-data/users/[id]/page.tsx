"use client";

import {
  BookOpen,
  Building,
  Eye,
  EyeOff,
  KeyRound,
  StickyNote,
  UploadCloud,
  User,
  UserSquare,
  UsersRound,
} from "lucide-react";
import { ChangeEvent, useEffect, useState, useCallback, useMemo, memo } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { EditorProps } from "@/components/Editor";
import dynamic from "next/dynamic";
import { alertError, alertSuccess } from "@/libs/alert";
import Image from "next/image";
import { AxiosError } from "axios";
import { Province } from "@/models/province";
import { CityRegency } from "@/models/cityRegency";
import { Sector } from "@/models/sector";
import Loader from "@/components/loader";
import useDebounce from "@/hooks/useDebounce";
import { API, createApiCall, ENDPOINTS } from "../../../../../../utils/config";

// Lazy load heavy components
const Editor = dynamic<EditorProps>(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />,
});

const Select = dynamic(() => import("react-select"), { 
  ssr: false,
  loading: () => <div className="h-10 bg-gray-100 animate-pulse rounded" />,
});

interface ProvinceOption {
  value: string;
  label: string;
}

interface UserForm {
  photo_profile: null | File | string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface CompanyForm {
  name: string;
  province_id: string;
  city_regency_id: string;
  sector_id: string;
  address: string;
  phone_number: string;
  website: string;
}

interface SchoolForm {
  name: string;
  npsn: string;
  address: string;
  status: string;
  accreditation: string;
  phone_number: string;
  website: string;
  city_regency_id: string;
  province_id: string;
}

interface StudentForm {
  name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  class: string;
  portofolio_link: string;
  skill: string;
  social_media_link: string;
  gender: string;
  school_name: string;
  major_id: string;
}

interface DescriptionForm {
  description: any;
}

interface FormErrors {
  [key: string]: string;
}

export default function UserDetailPage() {
  const [authorization, setAuthorization] = useState("");
  const [userForm, setUserForm] = useState<UserForm>({
    photo_profile: null as File | null, //photo profile won't appear if did not explicitly defined as File
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    name: "",
    province_id: "",
    city_regency_id: "",
    sector_id: "",
    address: "",
    phone_number: "",
    website: "",
  });
  const [schoolForm, setSchoolForm] = useState<SchoolForm>({
    name: "",
    npsn: "",
    address: "",
    status: "",
    accreditation: "",
    phone_number: "",
    website: "",
    city_regency_id: "",
    province_id: "",
  });
  const [studentForm, setStudentForm] = useState<StudentForm>({
    name: "",
    date_of_birth: "",
    phone_number: "",
    school_name: "",
    gender: "",
    address: "",
    major_id: "",
    class: "",
    portofolio_link: "",
    skill: "",
    social_media_link: "",
  });
  const [descriptionForm, setDescriptionForm] = useState<DescriptionForm>({
    description: "",
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cityRegencies, setCityRegencies] = useState<CityRegency[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isSubmittingDesc, setIsSubmittingDesc] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [majors, setMajors] = useState<any[]>([]);

  // State untuk react-select provinsi company
  const [provinceSearch, setProvinceSearch] = useState("");
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);

  const [schoolProvinceSearch, setSchoolProvinceSearch] = useState("");
  const [schoolProvinceOptions, setSchoolProvinceOptions] = useState<
    ProvinceOption[]
  >([]);

  const debouncedProvinceSearch = useDebounce(provinceSearch, 500);

  const params = useParams();
  const id = params?.id as string; // id dari route /users/[id]
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('api/', ''); //BASE_URL to fetch profile pictures correctly since previous added /api into the path

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await createApiCall({
        url: `${ENDPOINTS.USERS}/${id}`,
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }, signal);

      if (response.status === 200) {
        const data = response.data.data ?? {};

        setUserForm({
          photo_profile: data.photo_profile ?? null,
          username: data.username ?? "",
          email: data.email ?? "",
          password: "",
          password_confirmation: "",
        });
      
      if (data.photo_profile) {
        setProfileImage(
          `${BASE_URL}/storage/photo-profile/${data.photo_profile}`
        );
      }

        const role = (data.role as string) ?? "";
        setAuthorization(role);

        switch (role) {
          case "company": {
            const company = data.company ?? {};
            setCompanyForm({
              name: company.name ?? "",
              province_id: company.province_id ?? "",
              city_regency_id: company.city_regency_id ?? "",
              sector_id: company.sector_id ?? "",
              address: company.address ?? "",
              phone_number: company.phone_number ?? "",
              website: company.website ?? "",
            });
            setDescriptionForm({ description: company.description ?? "" });
            break;
          }
          case "school": {
            const school = data.school ?? {};
            setSchoolForm({
              name: school.name ?? "",
              npsn: school.npsn ?? "",
              address: school.address ?? "",
              status: school.status ?? "",
              accreditation: school.accreditation ?? "",
              phone_number: school.phone_number ?? "",
              website: school.website ?? "",
              city_regency_id: school.city_regency_id ?? "",
              province_id: school.province_id ?? "",
            });
            setDescriptionForm({ description: school.description ?? "" });
            break;
          }
          case "student": {
            const student = data.student ?? {};
            setStudentForm({
              name: student.name ?? "",
              phone_number: student.phone_number ?? "",
              date_of_birth: student.date_of_birth ?? "",
              address: student.address ?? "",
              class: student.class ?? "",
              portofolio_link: student.portofolio_link ?? "",
              skill: student.skill ?? "",
              social_media_link: student.social_media_link ?? "",
              gender: student.gender ?? "",
              major_id: student.major_id ?? "",
              school_name: student.school_name ?? "",
            });
            break;
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent, form: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Hitting the handler");
    try {
      console.log(form);
      let request = {};
      let text = "";

      switch (form) {
        case "user":
          text = "Informasi akun berhasil di simpan!";
          request = { ...userForm };

          if (!(userForm.photo_profile instanceof File)) {
            request = { ...request, photo_profile: null };
          }

          break;
        case "company":
          text = "Informasi perusahaan berhasil di simpan!";
          request = { ...companyForm };
          break;
        case "school":
          text = "Informasi sekolah/universitas berhasil di simpan!";
          request = { ...schoolForm };
          break;
        case "student":
          text = "Informasi siswa/mahasiswa berhasil di simpan!";
          request = { ...studentForm };
          break;
        case "description":
          text = "Deskripsi berhasil di simpan!";
          request = { ...descriptionForm };
          setIsSubmittingDesc(true);
          break;
      }

      // submitting request + new explicitly added formData constant
      const formData = new FormData();

      Object.entries(request).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as any);
        }
      });

      formData.append("_method", "PATCH");
      const response = await API.post(
        `${ENDPOINTS.USERS}/${id}`,
        formData, //append formData in the response
        {
          headers: {
            "Content-Type": "multipart/form-data", //added this header that also present in profile as admin cannot edit pfp
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      // console.log("Request:", request); //testing
      // console.log("Backend see:", response.data); //testing

      fetchData();
      fetchProfile();
      setFormErrors({});
      // response received
      alertSuccess(text);
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseError = error.response?.data.errors;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else {
          setFormErrors(responseError);
        }
        //console.error(responseError); //testing
      }
      console.error(error);
    } finally {
      setIsSubmittingDesc(false);
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = (data: any) => {
    setDescriptionForm({
      description: data,
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setUserForm((prev) => ({
        ...prev,
        photo_profile: file,
      }));
    }
  };

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const isStudent = Cookies.get("authorization") === "student";
      
      const requests = [
        createApiCall({ url: ENDPOINTS.CITY_REGENCIES }, signal),
        createApiCall({ url: ENDPOINTS.SECTORS }, signal),
        ...(isStudent ? [createApiCall({ url: ENDPOINTS.MAJORS }, signal)] : []),
      ];

      const responses = await Promise.allSettled(requests);
      
      if (responses[0].status === 'fulfilled') {
        setCityRegencies(responses[0].value.data.data);
      }
      if (responses[1].status === 'fulfilled') {
        setSectors(responses[1].value.data.data);
      }
      if (isStudent && responses[2]?.status === 'fulfilled') {
        setMajors(responses[2].value.data.data);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(error);
        await alertError("Gagal memuat data. Silakan refresh halaman.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCityRegencies = useCallback(async (signal?: AbortSignal) => {
    const provinceId = authorization === "company" 
      ? companyForm.province_id 
      : authorization === "school" 
      ? schoolForm.province_id 
      : "";

    if (!provinceId) {
      setCityRegencies([]);
      return;
    }

    try {
      const response = await createApiCall({
        url: `${ENDPOINTS.CITY_REGENCIES}?province_id=${provinceId}`,
      }, signal);
      setCityRegencies(response.data.data);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  }, [authorization, companyForm.province_id, schoolForm.province_id]);

  const fetchProvinceOptions = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await createApiCall({
        url: ENDPOINTS.PROVINCES,
        params: {
          is_accepted: true,
          search: debouncedProvinceSearch,
          limit: 5,
          is_limit: true,
        },
      }, signal);
      
      const mapped = response.data.data.map((item: Province) => ({
        value: item.id,
        label: item.name,
      }));
      setProvinceOptions(mapped);
      setSchoolProvinceOptions(mapped);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  }, [debouncedProvinceSearch]);

  useEffect(() => {
    const controller = new AbortController();
    
    Promise.all([
      fetchProfile(controller.signal),
      fetchData(controller.signal),
    ]);
    
    return () => controller.abort();
  }, [fetchProfile, fetchData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProvinceOptions(controller.signal);
    return () => controller.abort();
  }, [fetchProvinceOptions]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCityRegencies(controller.signal);
    return () => controller.abort();
  }, [fetchCityRegencies]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader width={64} height={64} />
      </div>
    );
  }

  return (
    // Konten utama dimulai di sini
    <main className="space-y-8 p-6">
      <h1 className="text-accent-dark text-sm mb-5">{userForm.username}</h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <UsersRound className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Daftar User -&gt; {userForm.username}</h2>
        </div>
      </div>
      {/* Judul Halaman untuk Tampilan Mobile */}
      <h1 className="text-2xl font-semibold text-gray-900 md:hidden">
        Profile
      </h1>

      {/* Grid Utama Halaman */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wrapper untuk Kartu Foto & Informasi Akun */}
        <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* --- Kartu Foto --- */}
          <div className="bg-white p-6 rounded-lg shadow-md xl:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-800">Foto</h3>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-48 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 mb-4 relative cursor-pointer ${
                  formErrors.photo_profile
                    ? "border-red-500"
                    : "border-gray-500"
                }`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : typeof userForm.photo_profile === "string" ? (
                  <Image
                    src={`${BASE_URL}/storage/photo-profile/${userForm.photo_profile}`} //explicitly use BASE_URL above
                    alt="Profile"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover rounded-lg"
                    priority
                  />
                ) : (
                  <>
                    <UploadCloud size={48} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Foto</span>
                  </>
                )}

                {/* Input file hidden tapi full area jadi clickable */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  name="profile_picture"
                  id="profile_picture"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {formErrors.photo_profile && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.photo_profile}
                </p>
              )}

              <p className="text-center text-xs text-gray-500">
                Rekomendasi: Gunakan foto dengan ukuran 200x200 pixel untuk
                hasil terbaik.
              </p>
            </div>
          </div>

          {/* --- Kartu Informasi Akun --- */}
          <div className="bg-white p-6 rounded-lg shadow-md xl:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <KeyRound size={20} className="text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Informasi Akun
              </h3>
            </div>
            <form
              className="space-y-6"
              onSubmit={(e) => handleSubmit(e, "user")}
            >
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                    formErrors.username ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                        formErrors.password
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer"
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5 text-accent" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-accent" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={userForm.password_confirmation}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          password_confirmation: e.target.value,
                        })
                      }
                      className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                        formErrors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-5 h-5 text-accent" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-accent" />
                      )}
                    </button>
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Simpan */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- Kartu Informasi Perusahaan --- */}
        {authorization === "company" && (
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <Building size={20} className="text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Informasi Perusahaan
              </h3>
            </div>
            <form
              className="space-y-6"
              onSubmit={(e) => handleSubmit(e, "company")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Perusahaan */}
                <div>
                  <label
                    htmlFor="company-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Perusahaan
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    placeholder="PT. Makerindo Indonesia"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.name ? "border-red-500" : "border-gray-300" //from email to name (simple wrong naming)
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Provinsi dengan React Select */}
                <div>
                  <label
                    htmlFor="company-province"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Provinsi
                  </label>
                  <Select
                    isClearable
                    isSearchable
                    isDisabled={isSubmitting}
                    options={provinceOptions}
                    value={
                      provinceOptions.find(
                        (opt) => opt.value === companyForm.province_id
                      ) || null
                    }
                    onChange={(selected: any) => {
                      setCompanyForm({
                        ...companyForm,
                        province_id: selected?.value || "",
                        city_regency_id: "", // Reset kota saat provinsi berubah
                      });
                    }}
                    onInputChange={(input: any) => setProvinceSearch(input)}
                    placeholder="Pilih provinsi"
                    noOptionsMessage={() => "Tidak ada provinsi ditemukan"}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: state.isDisabled
                          ? "#e5e7eb"
                          : "#ffffff",
                        borderColor: formErrors.province_id
                          ? "#ef4444"
                          : "#d1d5db",
                        borderRadius: "0.375rem",
                        padding: "0.125rem",
                        minHeight: "42px",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px rgba(var(--accent-rgb, 59, 130, 246), 0.5)"
                          : "none",
                        borderWidth: "1px",
                        cursor: state.isDisabled ? "not-allowed" : "default",
                        opacity: state.isDisabled ? 0.5 : 1,
                        "&:hover": {
                          borderColor: formErrors.province_id
                            ? "#ef4444"
                            : "#d1d5db",
                        },
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: "2px 8px",
                      }),
                      input: (base) => ({
                        ...base,
                        margin: 0,
                        padding: 0,
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#9ca3af",
                      }),
                      singleValue: (base, state) => ({
                        ...base,
                        color: state.isDisabled ? "#6b7280" : "#000000",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {formErrors.province_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.province_id}
                    </p>
                  )}
                </div>

                {/* Kota Kabupaten */}
                <div>
                  <label
                    htmlFor="company-city-regency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kota/Kabupaten
                  </label>
                  <select
                    disabled={
                      companyForm.province_id === null ||
                      companyForm.province_id === ""
                    }
                    id="company-city-regency"
                    value={companyForm.city_regency_id || ""}
                    onChange={(e) => {
                      setCompanyForm({
                        ...companyForm,
                        city_regency_id: e.target.value,
                      });
                    }}
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.city_regency_id
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Kota/Kabupaten</option>
                    {cityRegencies.map((cityRegency) => (
                      <option key={cityRegency.id} value={cityRegency.id}>
                        {cityRegency.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.city_regency_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.city_regency_id}
                    </p>
                  )}
                </div>

                {/* Alamat */}
                <div>
                  <label
                    htmlFor="company-address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alamat
                  </label>
                  <input
                    id="company-address"
                    type="text"
                    placeholder="Kpg. Hasanuddin No. 336, Bogor 88921"
                    value={companyForm?.address}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        address: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.username ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Sektor */}
                <div>
                  <label
                    htmlFor="company-sector"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sektor
                  </label>
                  <select
                    id="company-sector"
                    value={companyForm.sector_id || ""}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        sector_id: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.sector_id
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Sektor</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.sector_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.sector_id}
                    </p>
                  )}
                </div>

                {/* No Telepon */}
                <div>
                  <label
                    htmlFor="company-phone-number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    No Telepon
                  </label>
                  <input
                    id="company-phone-number"
                    type="tel"
                    placeholder="+6281234567890"
                    value={companyForm?.phone_number || ""}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        phone_number: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.phone_number
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.phone_number && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.phone_number}
                    </p>
                  )}
                </div>

                {/* Website Resmi */}
                <div>
                  <label
                    htmlFor="company-website"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Website Resmi
                  </label>
                  <input
                    id="company-website"
                    type="url"
                    placeholder="https://makerindo.co.id"
                    value={companyForm?.website || ""}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        website: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.website ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.website && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.website}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- Kartu Informasi Sekolah --- */}
        {authorization === "school" && (
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={20} className="text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Informasi Sekolah/Universitas
              </h3>
            </div>
            <form
              className="space-y-6"
              onSubmit={(e) => handleSubmit(e, "school")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Sekolah */}
                <div>
                  <label
                    htmlFor="school-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Sekolah/Universitas
                  </label>
                  <input
                    id="school-name"
                    type="text"
                    placeholder="SMKN 2 SUKABUMI"
                    value={schoolForm.name}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, name: e.target.value })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* NPSN */}
                <div>
                  <label
                    htmlFor="school-npsn"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    NPSN
                  </label>
                  <input
                    id="school-npsn"
                    type="text"
                    placeholder="20202317"
                    value={schoolForm.npsn ?? ""}
                    onChange={(e) => {
                      setSchoolForm({ ...schoolForm, npsn: e.target.value });
                    }}
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.npsn ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.npsn && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.npsn}
                    </p>
                  )}
                </div>

                {/* Provinsi dengan React Select untuk School */}
                <div>
                  <label
                    htmlFor="school-province"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Provinsi
                  </label>
                  <Select
                    isClearable
                    isSearchable
                    isDisabled={isSubmitting}
                    options={schoolProvinceOptions}
                    value={
                      schoolProvinceOptions.find(
                        (opt) => opt.value === schoolForm.province_id
                      ) || null
                    }
                    onChange={(selected: any) => {
                      setSchoolForm({
                        ...schoolForm,
                        province_id: selected?.value || "",
                        city_regency_id: "", // Reset kota saat provinsi berubah
                      });
                    }}
                    onInputChange={(input: any) =>
                      setSchoolProvinceSearch(input)
                    }
                    placeholder="Pilih provinsi"
                    noOptionsMessage={() => "Tidak ada provinsi ditemukan"}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: state.isDisabled
                          ? "#e5e7eb"
                          : "#ffffff",
                        borderColor: formErrors.province_id
                          ? "#ef4444"
                          : "#d1d5db",
                        borderRadius: "0.375rem",
                        padding: "0.125rem",
                        minHeight: "42px",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px rgba(var(--accent-rgb, 59, 130, 246), 0.5)"
                          : "none",
                        borderWidth: "1px",
                        cursor: state.isDisabled ? "not-allowed" : "default",
                        opacity: state.isDisabled ? 0.5 : 1,
                        "&:hover": {
                          borderColor: formErrors.province_id
                            ? "#ef4444"
                            : "#d1d5db",
                        },
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: "2px 8px",
                      }),
                      input: (base) => ({
                        ...base,
                        margin: 0,
                        padding: 0,
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#9ca3af",
                      }),
                      singleValue: (base, state) => ({
                        ...base,
                        color: state.isDisabled ? "#6b7280" : "#000000",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {formErrors.province_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.province_id}
                    </p>
                  )}
                </div>

                {/* Kota Kabupaten */}
                <div>
                  <label
                    htmlFor="company-city-regency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kota/Kabupaten
                  </label>
                  <select
                    id="school-city-regency"
                    disabled={
                      schoolForm.province_id === null ||
                      schoolForm.province_id === ""
                    }
                    value={schoolForm.city_regency_id}
                    onChange={(e) => {
                      setSchoolForm({
                        ...schoolForm,
                        city_regency_id: e.target.value,
                      });
                    }}
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.city_regency_id
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Kota/Kabupaten</option>
                    {cityRegencies.map((cityRegency) => (
                      <option key={cityRegency.id} value={cityRegency.id}>
                        {cityRegency.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.city_regency_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.city_regency_id}
                    </p>
                  )}
                </div>

                {/* Alamat Sekolah/Kampus */}
                <div>
                  <label
                    htmlFor="school-address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alamat Sekolah/Universitas
                  </label>
                  <input
                    id="school-address"
                    type="text"
                    value={schoolForm.address ?? ""}
                    onChange={(e) => {
                      setSchoolForm({ ...schoolForm, address: e.target.value });
                    }}
                    placeholder="JL. PELABUHAN II CIPOHO SUKABUMI"
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="school-status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status (Negeri/Swasta)
                  </label>
                  <select
                    id="school-status"
                    value={schoolForm.status ?? ""}
                    onChange={(e) => {
                      setSchoolForm({ ...schoolForm, status: e.target.value });
                    }}
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.status ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih status</option>
                    <option value="negeri">Negeri</option>
                    <option value="swasta">Swasta</option>
                  </select>
                  {formErrors.status && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.status}
                    </p>
                  )}
                </div>

                {/* Akreditasi */}
                <div>
                  <label
                    htmlFor="school-accreditation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Akreditasi
                  </label>
                  <select
                    id="school-accreditation"
                    value={schoolForm.accreditation ?? ""}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        accreditation: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.accreditation
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih akreditasi</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                  {formErrors.accreditation && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.accreditation}
                    </p>
                  )}
                </div>

                {/* No Telepon */}
                <div>
                  <label
                    htmlFor="school-phone-number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    No Telepon
                  </label>
                  <input
                    id="school-phone-number"
                    type="text"
                    value={schoolForm.phone_number ?? ""}
                    onChange={(e) => {
                      setSchoolForm({
                        ...schoolForm,
                        phone_number: e.target.value,
                      });
                    }}
                    placeholder="+6281234567890"
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.phone_number
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.phone_number && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.phone_number}
                    </p>
                  )}
                </div>

                {/* Website Resmi */}
                <div>
                  <label
                    htmlFor="school-website"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Website Resmi
                  </label>
                  <input
                    id="school-website"
                    type="text"
                    value={schoolForm.website ?? ""}
                    onChange={(e) => {
                      setSchoolForm({
                        ...schoolForm,
                        website: e.target.value,
                      });
                    }}
                    placeholder="https://smkn2smi.sch.id/"
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.website ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.website && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.website}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- Kartu Informasi Siswa --- */}
        {authorization === "student" && (
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <UserSquare size={20} className="text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Informasi Siswa/Mahasiswa
              </h3>
            </div>
            <form
              className="space-y-6"
              onSubmit={(e) => handleSubmit(e, "student")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Lengkap */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={studentForm?.name}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, name: e.target.value })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label
                    htmlFor="birth"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tanggal Lahir
                  </label>
                  <input
                    id="birth"
                    type="date"
                    value={studentForm?.date_of_birth}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        date_of_birth: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.date_of_birth
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.date_of_birth}
                    </p>
                  )}
                </div>

                {/* Asal Sekolah */}
                <div>
                  <label
                    htmlFor="school"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Asal Sekolah/Universitas
                  </label>
                  <input
                    disabled={true}
                    id="school"
                    type="text"
                    value={studentForm?.school_name}
                    placeholder="SMKN NEGERI 1 CIPAGALO"
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.school_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    value={studentForm?.gender}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, gender: e.target.value })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                  {formErrors.gender && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.gender}
                    </p>
                  )}
                </div>

                {/* Alamat */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alamat
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Bandung"
                    value={studentForm?.address}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        address: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Jurusan */}
                <div>
                  <label
                    htmlFor="school-phone-number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Jurusan
                  </label>
                  <select
                    id="major"
                    value={studentForm?.major_id}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        major_id: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.major_id ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Jurusan</option>
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.major_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.major_id}
                    </p>
                  )}
                </div>

                {/* Kelas */}
                <div>
                  <label
                    htmlFor="class"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kelas
                  </label>
                  <select
                    id="class"
                    value={studentForm?.class}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, class: e.target.value })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.class ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Kelas</option>
                    <option value="10">X</option>
                    <option value="11">XI</option>
                    <option value="12">XII</option>
                    <option value="collage">Kuliah</option>
                  </select>
                  {formErrors.class && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.class}
                    </p>
                  )}
                </div>

                {/* No Telepon */}
                <div>
                  <label
                    htmlFor="student-phone-number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    No Telepon
                  </label>
                  <input
                    id="student-phone-number"
                    type="tel"
                    placeholder="+6281234567890"
                    value={studentForm?.phone_number || ""}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        phone_number: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.phone_number
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.phone_number && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.phone_number}
                    </p>
                  )}
                </div>

                {/* Link Portofolio */}
                <div>
                  <label
                    htmlFor="portfolio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Link Portofolio
                  </label>
                  <input
                    id="portfolio"
                    type="url"
                    placeholder="https://never.dev"
                    value={studentForm?.portofolio_link}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        portofolio_link: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.portofolio_link
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.portofolio_link && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.portofolio_link}
                    </p>
                  )}
                </div>

                {/* Keahlian */}
                <div>
                  <label
                    htmlFor="skills"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Keahlian
                  </label>
                  <input
                    id="skill"
                    type="text"
                    placeholder="Web Development"
                    value={studentForm?.skill}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        skill: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.skill ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.skill && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.skill}
                    </p>
                  )}
                </div>

                {/* Link Sosial Media */}
                <div>
                  <label
                    htmlFor="social"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Link Linkedin
                  </label>
                  <input
                    id="social"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={studentForm?.social_media_link}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        social_media_link: e.target.value,
                      })
                    }
                    className={`w-full border  rounded-md shadow-sm sm:text-sm p-2 focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors ${
                      formErrors.social_media_link
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.social_media_link && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.social_media_link}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- Kartu Deskripsi --- */}
        {authorization !== "student" && authorization !== "super_admin" && (
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
            <div className="flex items-center gap-3 mb-6 ">
              <div className="flex gap-2">
                <StickyNote className="text-cyan-600 inline-flex h-full mt-1" />
                <h3 className="text-lg font-semibold text-gray-800 ">
                  Deskripsi
                </h3>
              </div>
            </div>
            <form
              className="space-y-6"
              onSubmit={(e) => handleSubmit(e, "description")}
            >
              <Editor
                onChange={handleEditorChange}
                initialData={descriptionForm.description}
              />
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sedang menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
