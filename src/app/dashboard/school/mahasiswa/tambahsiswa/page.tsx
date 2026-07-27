"use client";
import { ClipboardCheck, Eye, EyeOff, Upload, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { alertError, alertSuccess } from "@/libs/alert";

interface FormData {
  username: string;
  name: string;
  school_id: string;
  email: string;
  password: string;
  password_confirmation: string;
  recaptcha_token: string;
  role: string;
  image?: File | null;
  class: string;
  major_id: string;
  gender: string;
  address: string;
  phone_number: string;
  date_of_birth: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const tambahSiswaPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    school_id: "",
    email: "",
    password: "",
    password_confirmation: "",
    recaptcha_token: "",
    role: "student",
    class: "",
    major_id: "",
    gender: "male",
    address: "",
    phone_number: "",
    date_of_birth: "",
  });

  const [majors, setMajors] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await API.get(ENDPOINTS.MAJORS, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
        const responseData = response.data.data || response.data;
        if (Array.isArray(responseData)) {
          setMajors(responseData);
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };
    fetchMajors();
  }, []);

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showpassword_confirmation, setShowpassword_confirmation] =
    useState<boolean>(false);

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
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      console.log(file);

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    setErrors({});
    try {
      console.log(formData);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            data.append(key, value);
          } else if (String(value).trim() !== "") {
            data.append(key, String(value));
          }
        }
      });

      await API.post(`${ENDPOINTS.USERS}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      await alertSuccess("Mahasiswa berhasil didaftarkan!", 1500);
      profileImage && setProfileImage(null);
      setFormData({
        username: "",
        name: "",
        school_id: "",
        email: "",
        password: "",
        password_confirmation: "",
        recaptcha_token: "",
        role: "student",
        class: "",
        major_id: "",
        gender: "male",
        address: "",
        phone_number: "",
        date_of_birth: "",
      });
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data;
        const responseError = responseData?.errors || responseData?.message;
        if (typeof responseError === "string") {
          await alertError(responseError);
        } else if (typeof responseError === "object" && responseError !== null) {
          const firstKey = Object.keys(responseError)[0];
          const firstError = Array.isArray(responseError[firstKey])
            ? responseError[firstKey][0]
            : responseError[firstKey];
          await alertError(firstError || "Gagal mendaftarkan mahasiswa.");
          const formattedErrors: FormErrors = {};
          Object.entries(responseError).forEach(([k, v]) => {
            formattedErrors[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
          });
          setErrors(formattedErrors);
        } else {
          await alertError("Gagal mendaftarkan mahasiswa.");
        }
      } else {
        await alertError("Terjadi kesalahan.");
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
          href={"/dashboard/school/mahasiswa"}
        >
          Daftar Mahasiswa
        </Link>{" "}
        -&gt; Tambah Mahasiswa
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <UsersRound className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Tambah Mahasiswa</h2>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8 space-x-5 flex items-center">
            <div className="p-3 rounded-full w-12 h-12 bg-accent/30 text-accent">
              <UsersRound className="w-full h-full" />
            </div>
            <div className="my-auto">
              <h2 className="text-xl font-semibold text-gray-700 my-auto">
                Daftar Mahasiswa Magang
              </h2>
              <span className="text-gray-400">
                Silahkan isi semua informasi yang dibutuhkan
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Photo Upload */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambah Foto
                </label>
                <div className="relative">
                  <div
                    className={`w-full h-48 border-2 border-dashed  rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                        <p className="text-sm text-gray-500">
                          Klik untuk upload max (2mb)
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {/* Username and Full Name */}
                <div className="grid grid-cols-1  gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Masukan username siswa anda disini"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.username ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.username}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukan nama siswa anda disini"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                {/* Gender and Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <div className="flex space-x-4 py-2.5">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === "male"}
                          onChange={handleInputChange}
                          className="text-accent focus:ring-accent w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Laki-laki</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === "female"}
                          onChange={handleInputChange}
                          className="text-accent focus:ring-accent w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Perempuan</span>
                      </label>
                    </div>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.date_of_birth ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>
                    )}
                  </div>
                </div>

                {/* Class and Major */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.class ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Pilih Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                      <option value="9">Semester 9</option>
                      <option value="10">Semester 10</option>
                      <option value="11">Semester 11</option>
                      <option value="12">Semester 12</option>
                      <option value="13">Semester 13</option>
                      <option value="14">Semester 14</option>
                    </select>
                    {errors.class && (
                      <p className="mt-1 text-sm text-red-500">{errors.class}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jurusan
                    </label>
                    <select
                      name="major_id"
                      value={formData.major_id}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.major_id ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Pilih Jurusan</option>
                      {majors.map((major) => (
                        <option key={major.id} value={major.id}>
                          {major.name}
                        </option>
                      ))}
                    </select>
                    {errors.major_id && (
                      <p className="mt-1 text-sm text-red-500">{errors.major_id}</p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="Contoh: 08123456789"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.phone_number ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone_number}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Masukan alamat lengkap siswa"
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                </div>

                {/* School and Email */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Masukan email siswa anda disini"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Masukan password siswa anda disini"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors pr-12 ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showpassword_confirmation ? "text" : "password"}
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        placeholder="Masukan password siswa anda disini"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors pr-12 ${
                          errors.password_confirmation
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowpassword_confirmation(
                            !showpassword_confirmation
                          )
                        }
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                      >
                        {showpassword_confirmation ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password_confirmation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? "Mendaftar..." : "Daftar"}</span>
                {!isSubmitting && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default tambahSiswaPage;
