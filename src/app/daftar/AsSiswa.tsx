"use client";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { Upload, User, Mail, Lock, School, Eye, EyeOff } from "lucide-react";
import { API, ENDPOINTS } from "@/utils/config";
import axios, { AxiosError } from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { json } from "stream/consumers";
import { alertError, alertSuccess } from "@/libs/alert";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Select from "react-select";
import  useDebounce  from "@/hooks/useDebounce";

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
}


interface FormErrors {
  [key: string]: string | undefined;
}

interface PrakerinRegistrationFormProps {
  setShowForm: (value: string) => void;
  typeStudent: string;
}

interface SchoolData {
  value: string,
  label: string
}



const PrakerinRegistrationSiswaForm: React.FC<
  PrakerinRegistrationFormProps
> = ({ setShowForm, typeStudent }) => {
  const route = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    school_id: "",
    email: "",
    password: "",
    password_confirmation: "",
    recaptcha_token: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirmation, setShowpasswordConfirmation] =
    useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const recaptchaRef = useRef<any>(null);


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      console.log(file);

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setShowPassword(false);
    setShowpasswordConfirmation(false);
    setIsSubmitting(true);
    const token = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();
    formData.recaptcha_token = token;
    try {

      // const data = new FormData(); //Penambahan const data untuk melewati format FormData

      // data.append("username", formData.username);
      // data.append("name", formData.name);
      // data.append("school_id", formData.school_id);
      // data.append("email", formData.email);
      // data.append("password", formData.password);
      // data.append("password_confirmation", formData.password_confirmation);
      // data.append("recaptcha_token", formData.recaptcha_token);
      // data.append("role", formData.role);

      // if (profileImage) {
      //   data.append("profile_image", profileImage);
      // }

      const response = await API.post(`${ENDPOINTS.USERS}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await alertSuccess("Daftar Berhasil, Silahkan Cek Email Anda!");


      Cookies.set("userToken", response.data.token, {
      expires: 1,
      path: "/",
        sameSite: "strict",
      });
      Cookies.set("authorization", response.data.role, {
        expires:  1,
        path: "/",
        sameSite: "strict",
      });

      localStorage.setItem("login-success", "OK");
    

      setShowForm("");

      setFormData({
        username: "",
        name: "",
        school_id: "",
        email: "",
        password: "",
        password_confirmation: "",
        recaptcha_token: "",
        role: "student",
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
    return typeStudent[0].toUpperCase() + typeStudent.slice(1);
  };

 
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 600);
  const [schoolOptions, setSchoolOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const res = await API.get(ENDPOINTS.USERS, {
          params: { 
            role: "school",
            search: debouncedQuery,
            is_school: typeStudent === "siswa" ? true : false,
            limit: 5 },
        });
        setSchoolOptions(
          res.data.data.map((school: any) => ({
            value: school.id,
            label: school.name,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSchools(false);
      }
    };

    fetchSchools();
  }, [debouncedQuery]);


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
            Daftar {label()} Magang
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
                <div
                  className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors ${
                    isSubmitting
                      && "opacity-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting}
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
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
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                    placeholder="Masukan username anda disini"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    disabled={isSubmitting}
                    placeholder="Masukan nama anda disini"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    Asal {typeStudent === "siswa" ? "Sekolah" : "Perguruan Tinggi"}
                    <span className="text-red-500">*</span>
                  </label>

                  <Select
                    isClearable
                    isDisabled={isSubmitting}
                    isLoading={isLoadingSchools}
                    value={
                      schoolOptions.find((opt) => opt.value === formData.school_id) || null
                    }
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        school_id: selected?.value || "",
                      })
                    }
                    onInputChange={(val) => setInputSearch(val)}
                    options={schoolOptions}
                    placeholder={`Pilih ${
                      typeStudent === "siswa" ? "sekolah" : "perguruan tinggi"
                    } anda`}
                    className="text-sm"
                    classNames={{
                      control: ({ isFocused }) =>
                        `w-full px-2 py-1 border rounded-lg transition-all ${
                          errors?.school_id
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${
                          isFocused
                            ? "ring-2 ring-accent border-accent"
                            : "focus:border-accent"
                        }`,
                      menu: () =>
                        "bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50",
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
                  {errors?.school_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.school_id}</p>
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
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                    placeholder="Masukan email anda disini"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors pr-12 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                      type={showPasswordConfirmation ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Masukan password anda disini"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors pr-12 disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.password_confirmation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowpasswordConfirmation(!showPasswordConfirmation)
                      }
                      disabled={isSubmitting}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPasswordConfirmation ? (
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
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Kembali
            </button>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY as string}
              size="invisible"
              className="mb-4"
              ref={recaptchaRef}
            />
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
  );
};

export default PrakerinRegistrationSiswaForm;
