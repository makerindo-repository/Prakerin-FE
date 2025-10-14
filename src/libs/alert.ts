import Swal from "sweetalert2";

export const alertSuccess = async (message: string, timer: number = 3000) => {
  return toast.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: timer,
  });
};

export const alertError = async (message: string) => {
  return toast.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    timer: 3000,
  });
};

export const alertConfirm = async (message: string) => {
  const result = await Swal.fire({
    icon: "question",
    title: "Apakah Anda yakin?",
    text: message,
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
  timerProgressBar: true,
});
