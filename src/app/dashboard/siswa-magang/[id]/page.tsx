"use client";
import {
  Briefcase,
  Calendar,
  Clock,
  Cookie,
  Info,
  MapIcon,
  MapPin,
  Search,
  User,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import UnderConstruction from "@/components/UnderConstruction";
import { API, ENDPOINTS } from "../../../../../utils/config";
import NotFoundComponent from "@/components/NotFoundComponent";
import { getDateIndonesia } from "@/utils/getDateIndonesia";
import Loader from "@/components/loader";

interface Student {
  photo_profile: string | null;
  email: string;
  student: {
    phone_number: string | null;
    name: string;
    class: string;
    status: string;
    gender: string | null;
    major: {
      name: string;
    } | null;
  };
  city_regency: {
    name: string;
  } | null;
  province: {
    name: string;
  } | null;
  company: {
    name: string;
    user: {
      photo_profile: string | null;
    };
  };
  internship: {
    id: string;
    start_date: string;
    end_date: string;
  };
  field: string;
  tipe: string;
}

interface Task {
  id: number;
  title: string;
  due_date: string;
  status: "in_progress" | "pending" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

const detailPenempatan = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const route = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoad, setIsLoad] = useState<boolean>(true);
  const [data, setData] = useState<Student>({
    photo_profile: null,
    email: "",
    student: {
      phone_number: "",
      name: "",
      class: "",
      status: "",
      gender: "",
      major: {
        name: "",
      },
    },
    city_regency: {
      name: "",
    },
    province: {
      name: "",
    },
    company: {
      name: "",
      user: { photo_profile: null },
    },
    internship: {
      id: "",
      start_date: "",
      end_date: "",
    },
    field: "",
    tipe: "",
  });

  const [tasks, setTasks] = useState<Task[]>([]);

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

  const getDeadline = (deadline: string) => {
    const deadlineArray = deadline.split("-");

    return `${deadlineArray[2]}-${deadlineArray[1]}-${deadlineArray[0]}`;
  };

  const fetchData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsLoad(true);
    try {
      const task = API.get(`${ENDPOINTS.TASKS}`, {
        params: {
          page: 1,
          limit: 100,
          student_id: id,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const student = API.get(`${ENDPOINTS.USERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      //Fixed the problem where internship data did not shows up, I just hope tasks won't be the same, haven't testicle- I mean tested that.
      //Anyway, added internship const, added internship in the response, and change setData
      //The fix on line 274 is to make Gender not a link but an actual text, and for 290, 291, and 332 as safeguard should internship data missing.
      const internship = API.get(`${ENDPOINTS.INTERNSHIPS}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`
        }
      });

      const response = await Promise.all([student, task, internship]);
      console.log(response);
      setData({
        ...response[0].data.data,
        internship: response[2].data.data
      });
      setTasks(response[1].data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGender = (status: string) => {
    switch (status) {
      case "male":
        return "Laki-laki";
      case "female":
        return "Perempuan";
      default:
        return "-";
    }
  };

  const getTimestamp = (timestamp: string) => {
    if (timestamp === "-") {
      return "-";
    }

    const data = timestamp.split("T");
    return getDeadline(data[0]);
  };

  return (
    <>
      {isLoading && isLoad ? (
        <div className="flex justify-center items-center h-screen">
          <Loader width={64} height={64} />;
        </div>
      ) : (
        <main className="p-6">
          <h1 className="text-accent-dark text-sm mb-5">
            <Link
              className="hover:underline hover:text-accent"
              href={`/dashboard/siswa-magang`}
            >
              Siswa Magang
            </Link>{" "}
            -&gt; Detail Siswa Magang
          </h1>
          <div className="mb-8">
            <div className="flex items-center space-x-2 font-extrabold text-accent">
              <Users className="w-5 h-5" />
              <h2 className="text-2xl mt-2">Detail Penempatan Siswa</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 overflow-hidden">
              {/* Card header */}
              <div className="border-b-1 px-6 py-4">
                <h2 className="text-accent text-lg font-semibold">
                  Informasi Siswa Magang
                </h2>
              </div>

              {/* Card content */}
              <div className="p-4 flex flex-col gap-4">
                {/* Student info */}
                <div className="flex flex-col items-center space-x-4 gap-2">
                  {data.photo_profile ? (
                    <div className="w-16 h-16 relative self-center rounded-full border-white border">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${data.photo_profile}`}
                        alt="Foto Profile Siswa Magang"
                        fill
                        sizes="100%"
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 relative flex rounded-full  overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 border-white border">
                      <User className="w-16 h-16 self-center text-[var(--color-accent)]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {data.student.name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      Email : {data.email}
                    </div>
                    <div className="text-sm text-gray-600">
                      Nomer Telepon : {data.student.phone_number ?? "-"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Jenis Kelamin : {getGender(data.student.gender ?? "")}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          Durasi
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {getDateIndonesia(data.internship?.start_date)} -{" "}
                          {getDateIndonesia(data.internship?.end_date)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          Sebagai
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {data.field}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          Tipe Magang
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {data.tipe === 'full_time' ? 'Full Time' : data.tipe === 'part_time' ? 'Part Time' : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-8 flex justify-between">
                <Link
                  href="/dashboard/siswa-magang"
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Kembali
                </Link>
                <Link
                  href={`/dashboard/siswa-magang/${data.internship?.id}/penempatan`}
                  className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
                >
                  Ubah
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden lg:col-span-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari tugas..."
                  // value={inputSearch}
                  // onChange={(e) => setInputSearch(e.target.value)}
                  className="w-full bg-accent text-white placeholder-teal-200 pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600 uppercase">
                        No
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600 uppercase">
                        Nama Tugas
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600 uppercase">
                        Tanggal Pemberian
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600 uppercase">
                        Tanggal Selesai
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600 uppercase">
                        Tenggat Waktu
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-gray-800">{index + 1}</td>
                        <td className="p-4 text-gray-800">{task.title}</td>
                        <td className="p-4 text-gray-600">
                          {getTimestamp(task.created_at)}
                        </td>
                        <td className="p-4 text-gray-600">
                          {getTimestamp(task.updated_at ?? "-")}
                        </td>
                        <td className="p-4 text-gray-600">
                          {getDeadline(task.due_date)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {getStatus(task.status)}
                          </span>
                        </td>
                        <td className="p-4 flex items-center">
                          <Link
                            href={`/dashboard/tasklist/${task.id}`}
                            className="w-fit h-fit text-blue-600 hover:text-blue-600/75 rounded-full transition-colors cursor-pointer"
                          >
                            <Info className="w-4 h-4 " />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State (if no tasks) */}
              {tasks.length === 0 && (
                <div className="text-center py-12 col-span-2 ">
                  <NotFoundComponent text="Siswa ini belum memiliki tugas." />
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </>
  );
};
export default detailPenempatan;
