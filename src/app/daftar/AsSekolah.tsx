"use client";
import React, { useState, ChangeEvent, useRef } from "react";
import { Upload, User, Mail, Lock, School, Eye, EyeOff } from "lucide-react";
import axios, { AxiosError } from "axios";
import { API, ENDPOINTS } from "@/utils/config";
// import ReCAPTCHA from "react-google-recaptcha"; // CAPTCHA disabled for local dev
import { alertError, alertSuccess } from "@/libs/alert";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface FormData {
  username: string;
  name: string;
  address: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string; // Optional field for role selection
  image?: File | null;
  type: string
  recaptcha_token: string; // For reCAPTCHA token
}

interface FormErrors {
  username?: string;
  name?: string;
  address?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  type?: string
}

interface PrakerinRegistrationFormProps {
  setShowForm: (value: string) => void;
  typeSchool: string;
}

const PrakerinRegistrationSekolahForm: React.FC<
  PrakerinRegistrationFormProps
> = ({ setShowForm, typeSchool }) => {
  const route = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    address: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "school", // Default role
    recaptcha_token: "",
    type: typeSchool
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // const recaptchaRef = useRef<any>(null); // CAPTCHA disabled for local dev

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
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
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSubmitting(true);

    // const token = await recaptchaRef.current.executeAsync(); // CAPTCHA disabled for local dev
    // recaptchaRef.current.reset();
    // formData.recaptcha_token = token;


    try {
      await API.post(`${ENDPOINTS.USERS}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await alertSuccess("Daftar Berhasil, Silahkan Cek Email Anda!");

      // Cookies.set("userToken", response.data.token, {
      // expires: 1,
      // path: "/",
      //   sameSite: "strict",
      // });
      // Cookies.set("authorization", response.data.role, {
      //   expires:  1,
      //   path: "/",
      //   sameSite: "strict",
      // });

      localStorage.setItem("login-success", "OK");


      setShowForm("");

      setFormData({
        username: "",
        name: "",
        address: "",
        email: "",
        password: "",
        password_confirmation: "",
        recaptcha_token: "",
        image: null,
        role: "School",
        type: typeSchool
      });
      setProfileImage(null);

      route.push("/masuk");
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

  const handleBack = (): void => {
    setShowForm(""); // Kembali ke halaman pilih form
  };

  const label = () => {
    if(typeSchool === "school") {
      return "Sekolah"
    }
    else if (typeSchool === "university") {
      return "Perguruan Tinggi"
    } else {
      return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="PrakerinID_ico.svg"
            alt=""
            className="lg:w-50 mb-4 mx-auto"
          />
          <h2 className="text-2xl font-semibold text-gray-700">
            {label()}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Photo Upload */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tambah Foto
              </label>
              <div className="relative">
                <div className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${
                  isSubmitting && "opacity-50"
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting}
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed "
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
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-4">
              {/* Username and Full Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Masukan username anda disini"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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
                    Nama {label()}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder={`Masukan nama ${label().toLowerCase()} anda`}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* School and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Masukan alamat ${label().toLowerCase()} anda`}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors appearance-none bg-white disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Masukan email anda disini"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
                      disabled={isSubmitting}
                      placeholder="Masukan password anda disini"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors pr-12 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                      type={showConfirmPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Masukan password anda disini"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors pr-12 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.confirm_password
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.confirm_password}
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
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium flex items-center space-x-2 cursor-pointer  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY as string}
                size="invisible"
                className="mb-4"
                ref={recaptchaRef}
              /> */}
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
  );
};

export default PrakerinRegistrationSekolahForm;
