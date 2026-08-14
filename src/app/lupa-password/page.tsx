"use client";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import { alertError, alertSuccess } from "@/libs/alert";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Timer for OTP resend
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Silakan masukan email Anda.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post(ENDPOINTS.FORGOT_PASSWORD, { email });
      if (res.data?.status || res.status === 200) {
        alertSuccess("Kode OTP telah dikirim ke email Anda.");
        setStep(2);
        setTimer(60);
        setCanResend(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim kode OTP. Pastikan email terdaftar.";
      setErrorMessage(msg);
      alertError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: OTP Input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setErrorMessage("Silakan masukan 6 digit kode OTP.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post(ENDPOINTS.VERIFY_OTP, {
        email,
        otp: otpCode,
      });

      if (res.data?.status || res.status === 200) {
        setStep(3);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Kode OTP tidak valid atau sudah kedaluwarsa.";
      setErrorMessage(msg);
      alertError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isSubmitting) return;
    setErrorMessage("");

    try {
      setIsSubmitting(true);
      const res = await API.post(ENDPOINTS.FORGOT_PASSWORD, { email });
      if (res.data?.status || res.status === 200) {
        alertSuccess("Kode OTP baru berhasil dikirim ulang.");
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim ulang kode OTP.";
      alertError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!password) {
      setErrorMessage("Password baru tidak boleh kosong.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password minimal harus 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post(ENDPOINTS.RESET_PASSWORD, {
        email,
        otp: otp.join(""),
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.data?.status || res.status === 200) {
        setStep(4);
        alertSuccess("Password Anda telah berhasil diperbarui!");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal memperbarui password. Silakan coba lagi.";
      setErrorMessage(msg);
      alertError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => (window.location.href = "/masuk")}
        className="absolute top-4 left-4 p-3 rounded-full hover:bg-accent-hover transition bg-accent cursor-pointer shadow-md text-white"
        title="Kembali ke Halaman Login"
      >
        <ArrowLeft size={20} />
      </button>

      <section className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
        <div className="w-full max-w-md space-y-6 bg-white shadow-2xl p-6 md:p-10 rounded-xl transition-all">
          {/* Logo & Header */}
          <div className="flex justify-center">
            <img src="/Logo Prakerin ID Text (2).svg" alt="Logo Prakerin.id" className="w-28 md:w-44" />
          </div>

          {step === 1 && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-gray-800">Lupa Password?</h1>
                <p className="text-sm text-gray-500">
                  Masukkan email yang terdaftar untuk menerima kode OTP verifikasi.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Terdaftar
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="contoh@domain.com"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:opacity-50"
                    />
                    <Mail className="text-accent absolute left-4 top-3.5 w-5 h-5" />
                  </div>
                  {errorMessage && <p className="mt-1 text-sm text-red-500">{errorMessage}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-hover font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? "Mengirim Kode OTP..." : "Kirim Kode OTP"}
                </button>

                <div className="text-center pt-2">
                  <Link href="/masuk" className="text-sm text-gray-600 hover:text-accent font-medium transition">
                    Ingat password? <span className="text-accent font-semibold">Masuk</span>
                  </Link>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-gray-800">Verifikasi Kode OTP</h1>
                <p className="text-sm text-gray-500">
                  Kode verifikasi 6-digit telah dikirimkan ke <span className="font-semibold text-gray-700">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Masukkan 6-Digit Kode OTP
                  </label>
                  <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors"
                      />
                    ))}
                  </div>
                  {errorMessage && <p className="mt-2 text-sm text-red-500 text-center">{errorMessage}</p>}
                </div>

                <div className="flex justify-between items-center text-sm px-1">
                  <span className="text-gray-500">Tidak menerima kode?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || isSubmitting}
                    className="flex items-center gap-1 font-medium text-accent hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                    {canResend ? "Kirim Ulang OTP" : `Kirim Ulang (${timer}s)`}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-hover font-medium transition cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? "Memverifikasi..." : "Verifikasi OTP"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-600 hover:text-accent font-medium transition"
                  >
                    Ubah Email
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-gray-800">Password Baru</h1>
                <p className="text-sm text-gray-500">
                  Silakan buat password baru yang aman untuk akun Anda.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Minimal 8 karakter"
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:opacity-50"
                    />
                    <Lock className="text-accent absolute left-4 top-3.5 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-accent"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      id="passwordConfirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Ulangi password baru"
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors disabled:opacity-50"
                    />
                    <KeyRound className="text-accent absolute left-4 top-3.5 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-accent"
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  {errorMessage && <p className="mt-1 text-sm text-red-500">{errorMessage}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-hover font-medium transition cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? "Menyimpan Password..." : "Simpan Password Baru"}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-2">
                <CheckCircle2 size={40} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-800">Password Berhasil Diperbarui!</h1>
                <p className="text-sm text-gray-600">
                  Password akun Anda telah berhasil diubah. Silakan masuk kembali dengan password baru Anda.
                </p>
              </div>

              <Link
                href="/masuk"
                className="inline-block w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-hover font-medium transition shadow-md"
              >
                Masuk ke Akun
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
