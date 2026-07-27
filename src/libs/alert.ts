import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export const alertSuccess = async (message: string, timer?: number) => {
  const calculatedTimer = timer !== undefined ? timer : Math.min(10000, Math.max(3000, message.length * 50));
  return toast.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: calculatedTimer,
  });
};

export const alertError = async (message?: string | null) => {
  const safeMessage =
    typeof message === "string" && message.trim() !== ""
      ? message
      : "Terjadi kesalahan. Silakan coba lagi.";
  const calculatedTimer = Math.min(10000, Math.max(3000, safeMessage.length * 50));
  return toast.fire({
    icon: "error",
    title: "Gagal",
    text: safeMessage,
    timer: calculatedTimer,
  });
};

export const alertConfirm = async (message: string, text?: string) => {
  const result = await Swal.fire({
    icon: "question",
    title: text ? message : "Apakah Anda yakin?",
    text: text || message,
    showCancelButton: true,
    cancelButtonColor: "#d33",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
};

const toast = Swal.mixin({
  toast: true,
  position: "top-right",
  iconColor: "white",
  customClass: {
    popup: "colored-toast",
  },
  showConfirmButton: false,
  showCloseButton: true,
  timerProgressBar: true,
});