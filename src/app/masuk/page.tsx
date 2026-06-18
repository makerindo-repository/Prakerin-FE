"use client";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import { useRef, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { alertError, alertSuccess } from "@/libs/alert";
import { AxiosError } from "axios";

interface FormData {
  email: string;
  password: string;
  recaptcha_token: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const route = useRouter();

  const [data, setData] = useState<FormData>({
    email: "",
    password: "",
    recaptcha_token: "",
  });
  const [isRemember, setIsRemember] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const recaptchaRef = useRef<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowPassword(false);

    try {
      setIsSubmitting(true);

      const token = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();
      data.recaptcha_token = token;

      const response = await API.post(`${ENDPOINTS.USERS}/login`, {
        email: data.email,
        password: data.password,
        recaptcha_token: data.recaptcha_token,
      });

      // console.log(response.data);

      Cookies.set("userToken", response.data.token, {
        expires: isRemember ? 30 : 1,
        path: "/",
        sameSite: "strict",
      });
      Cookies.set("authorization", response.data.role, {
        expires: isRemember ? 30 : 1,
        path: "/",
        sameSite: "strict",
      });

      Cookies.set("active", response.data.is_verified,{
        expires: isRemember ? 30 : 1,
        path: "/",
        sameSite: 'strict'
      });

      localStorage.setItem("login-success", "OK");

      route.push("/dashboard");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) { //just a much more robust error checking, to see what went wrong on login before
        const responseData = error.response?.data;
        console.error("Login error response:", responseData);
        if (responseData?.errors) {
          if (typeof responseData.errors === "string") {
            await alertError(responseData.errors);
          } else if (typeof responseData.errors === "object" && responseData.errors !== null) {
            setErrors(responseData.errors);
          } else {
            await alertError("Login Failed");
          }
        } else if (responseData?.message) {
          await alertError(responseData.message);
        } else {
          await alertError("Login Failed");
        }
      } else {
        await alertError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => window.location.href = "/"}
        className="absolute top-4 left-4 p-3 rounded-full hover:bg-accent-hover transition bg-accent cursor-pointer shadow-md"
      >
        <ArrowLeft className="text-white" />
      </button>
      <section className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="w-full max-w-md space-y-6 bg-white shadow-2xl p-6 md:p-10 rounded-xl">
          <div className="flex justify-center">
            <img
              src="/PrakerinID_ico.svg"
              alt="Logo"
              className="w-28 md:w-48"
            />
          </div>
          <h1 className="text-2xl font-bold text-center">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <div className="relative ">
                <input
                  name="email"
                  placeholder="Masukan email kamu"
                  onChange={handleChange}
                  type="text"
                  id="email"
                  disabled={isSubmitting}
                  className={`w-full px-12 py-3 border rounded-lg pr-12 focus:ring-accent focus:border-accent outline-none transition-colors ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                />
                <UserRound className="text-accent absolute left-4 top-3.5 w-5 h-5" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={data.password}
                  disabled={isSubmitting}
                  onChange={handleChange}
                  placeholder="Masukan password kamu"
                  className={`w-full px-12 py-3 border rounded-lg pr-12  focus:ring-accent focus:border-accent  outline-none transition-colors ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }  disabled:cursor-not-allowed disabled:opacity-50`}
                />
                <LockKeyhole className="text-accent absolute left-4 top-3.5 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 flex items-center px-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 text-accent" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-accent" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="remember"
                id="remember"
                disabled={isSubmitting}
                className="h-4 w-4"
                checked={isRemember}
                onChange={(e) => setIsRemember(e.target.checked)}
              />
              <label
                htmlFor="remember"
                className="text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ingat saya
              </label>
            </div>

            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY as string}
              size="invisible"
              ref={recaptchaRef}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent text-white py-2 rounded-md hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sedang masuk..." : "Masuk"}
            </button>

            <div className="text-center">
              <p className="text-sm">
                Belum memiliki akun?{" "}
                <Link href="/daftar" className="text-blue-500 hover:underline">
                  Daftar
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
