"use client";
import { CalendarRangeIcon, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import Link from "next/link";
import { alertConfirm, alertSuccess } from "@/libs/alert";
import Loader from "@/components/loader";
import { formatToWhatsAppNumber } from "@/utils/formatToWhatsAppNumber";

interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  description: string;
  link: string | null;
  phone_number: string | null;
}


const DetailTasklistPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const router = useRouter();
  const { id } = use(params);
  const [task, setTask] = useState<Task>({
    id: "",
    title: "",
    due_date: "",
    status: "",
    description: "",
    link: "",
    phone_number: null,
  });
  const [authorization, setAuthorization] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Belum";
      case "in_progress":
        return "Sedang";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;

    const confirmed = await alertConfirm(
      "Apakah Anda yakin ingin mengubah status tugas ini?"
    );

    if (!confirmed) return;

    try {
      await API.patch(
        `${ENDPOINTS.TASKS}/${id}`,
        { status: newValue },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      fetchDetailTask();
      await alertSuccess("Status tugas berhasil diubah.");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDetailTask = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`${ENDPOINTS.TASKS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Detail task fetched successfully:", response.data.data);
      setTask(response.data.data);
    } catch (error) {
      console.error("Error fetching detail task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Task ID:", id);
    fetchDetailTask();
    setAuthorization(Cookies.get("authorization") as string);
  }, []);

  // 🔗 Format nomor WA langsung di sini
  const formattedWhatsAppNumber = formatToWhatsAppNumber(task.phone_number  || "");

  return (
    <main className="p-6">
      <h1 className="text-accent-dark text-sm mb-5">
        <Link
          className="hover:underline hover:text-accent"
          href={"/dashboard/tasklist/"}
        >
          Daftar Tugas
        </Link>{" "}
        -&gt; Detail Tugas
      </h1>
      <div className="mb-8">
        <div className="flex items-center space-x-2 font-extrabold text-accent">
          <ClipboardCheck className="w-5 h-5" />
          <h2 className="text-2xl mt-2">Detail Tugas</h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader height={64} width={64} />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-end lg:flex-row lg:items-start lg:justify-between gap-4 pb-5 mb-5 border-b-1 border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1 gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {task.title}
                  </h2>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <CalendarRangeIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{task.due_date}</span>
                  </div>
                  <span
                    className={`${getStatusColor(
                      task.status
                    )} rounded-full p-1 px-3`}
                  >
                    {getStatus(task.status)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-8">
                {(authorization === "company" || authorization === "student") && (
                  <div className="flex gap-4 items-center">
                    <label htmlFor="status" className="font-medium">
                      Pilih Status Tugas
                    </label>
                    <select
                      id="status"
                      value={task.status}
                      onChange={handleChange}
                      className="rounded-xl border px-4 py-2 border-gray-300 focus:border-transparent focus:outline-transparent focus:ring-2 focus:ring-accent text-md transition-colors"
                    >
                      <option value="pending">Belum</option>
                      <option value="cancelled">Dibatalkan</option>
                      <option value="in_progress">Sedang</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>
                )}

                {formattedWhatsAppNumber ? (
                  <Link
                    href={`https://wa.me/${formattedWhatsAppNumber}`}
                    target="_blank"
                    className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap"
                  >
                    <span className="">Lapor</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap"
                  >
                    {authorization === "company" ? (
                      <span>Perusahaan tidak memiliki nomor telepon</span>
                    ) : (
                      <span>Pemagang tidak memiliki nomor telepon</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Deskripsi
            </h3>
            <div className="text-gray-700 text-sm leading-relaxed space-y-3 mb-5">
              <p>{task.description}</p>
            </div>

            {task.link && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Link
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed space-y-3 mb-5">
                  <Link
                    href={task.link}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                    {task.link}
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default DetailTasklistPage;
