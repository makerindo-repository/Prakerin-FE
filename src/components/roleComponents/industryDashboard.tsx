import {
  Award,
  Briefcase,
  CircleArrowRight,
  Info,
  Search,
  Users,
} from "lucide-react";
import RatingSummaryCompenent from "../RatingSummaryCompenent";
import PieChartCompenent, { DataPieChart } from "../Charts/PieChartCompenent";
import BarChartComponent from "../Charts/BarChartCompenent";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "@/utils/config";
import { RatingSummary } from "@/models/feedback";
import { mapRatingToData } from "@/utils/mapRatingToData";
import NotFoundComponent from "../NotFoundComponent";
import Loader from "../loader";
import useDebounce from "@/hooks/useDebounce";

interface Summary {
  internship_count: number;
  job_opening_count: {
    true: number;
    false: number;
    total: number;
  };
  achievement_count: number;
  task: {
    cancelled: number;
    completed: number;
    in_progress: number;
    pending: number;
    students: {
      name: string;
      completed_tasks: number;
    }[];
  };
}

interface Task {
  id: number;
  title: string;
  due_date: string;
  internship: {
    student: {
      name: string;
    };
  };
}

export default function IndustryDashboard({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [summary, setSummary] = useState<Summary>({
    internship_count: 0,
    job_opening_count: {
      true: 0,
      false: 0,
      total: 0,
    },
    achievement_count: 0,
    task: {
      cancelled: 0,
      completed: 0,
      in_progress: 0,
      pending: 0,
      students: [],
    },
  });
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    rating_count: 0,
    average_rating: 0,
    rating_1: 0,
    rating_2: 0,
    rating_3: 0,
    rating_4: 0,
    rating_5: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [inputSearch, setInputSearch] = useState("");
  const debouncedQuery = useDebounce(inputSearch, 1000);

  const fetchData = async () => {
    try {
      const internshipCount = API.get(`${ENDPOINTS.INTERNSHIPS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const jobOpeningCount = API.get(`${ENDPOINTS.JOB_OPENINGS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const achievementCount = API.get(`${ENDPOINTS.ACHIEVEMENTS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const rating = API.get(`${ENDPOINTS.FEEDBACKS}/rating`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const taskCount = API.get(`${ENDPOINTS.TASKS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const response = await Promise.all([
        internshipCount,
        jobOpeningCount,
        achievementCount,
        rating,
        taskCount,
      ]);

      console.log(response);
      setSummary({
        internship_count: response[0].data.data,
        job_opening_count: response[1].data.data,
        achievement_count: response[2].data.data,
        task: response[4].data.data,
      });
      setRatingSummary(response[3].data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (isLoadingTasks) return;
    setIsLoadingTasks(true);

    try {
      const response = await API.get(`${ENDPOINTS.TASKS}`, {
        params: {
          search: inputSearch,
          limit: 10,
          is_deadline: true,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      console.log("Tasks fetched successfully:", response.data.data);
      setTasks(response.data.data);
    } catch (error) {
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const getDeadline = (deadline: string) => {
    const deadlineArray = deadline.split("-");

    return `${deadlineArray[2]}-${deadlineArray[1]}-${deadlineArray[0]}`;
  };

  const ratingColors = ["#ff0000", "#ff6600", "#ffcc00", "#66cc00", "#009900"]; // contoh warna

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (inputSearch.trim() !== "") {
      if (!debouncedQuery) {
        setTasks([]);
        return;
      }
    }

    fetchTasks();
  }, [debouncedQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 col-span-5  gap-6">
        <div className="bg-white rounded-lg shadow-sm p-3 px-5 flex justify-between">
          <div className="text-accent-dark">
            <h1 className="font-extrabold  text-2xl">
              {summary.internship_count}
            </h1>
            <h3 className=" text-md">Total Magang</h3>
          </div>
          <Users className="text-accent w-7 h-7 my-auto" />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 px-5 flex justify-between">
          <div className="text-accent-dark">
            <h1 className="font-extrabold  text-2xl">
              {summary.job_opening_count.total}
            </h1>
            <h3 className=" text-md">Total Lowongan</h3>
          </div>
          <Briefcase className="text-accent w-7 h-7 my-auto" />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 px-5 flex justify-between">
          <div className="text-accent-dark">
            <h1 className="font-extrabold  text-2xl">
              {summary.achievement_count}
            </h1>
            <h3 className=" text-md">Total Penghargaan</h3>
          </div>
          <Award className="text-accent w-7 h-7 my-auto" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3 px-5 flex flex-col justify-between">
        <div className="flex  mb-4   justify-between">
          <div className="flex flex-col ">
            <h3 className="font-bold text-lg">Penilaian Perusahaan </h3>
            <p className="text-sm text-gray-600">
              Penilaian didapat dari siswa/mahasiswa yang melakukan magang di perusahaan
              ini
            </p>
          </div>
          <Link href="/dashboard/feedback">
            <CircleArrowRight
              className="text-accent/75  hover:text-accent"
              size={32}
            />
          </Link>
        </div>

        <div className="flex gap-6">
          <div className="w-1/2 ">
            {/* <RatingSummaryCompenent data={ratingSummary} /> */}
          </div>
          <div className="w-1/2 ">
            {/* <PieChartCompenent
              legend="Persentase Penilaian"
              tooltip="Persentase Penilaian"
              dataList={mapRatingToData(ratingSummary, ratingColors)}
            /> */}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3 px-5 flex flex-col justify-between">
        <div className="flex flex-col mb-4">
          <h3 className="font-bold text-lg">
            Distribusi Total Siswa/Mahasiswa Magang
          </h3>
          <p className="text-sm text-gray-600">Visualisasi Status Tugas</p>
        </div>

        <div className="flex gap-6">
          <div className="w-1/2 ">
            <BarChartComponent
              legend="Grafik Distribusi Tugas Selesai Siswa/Mahasiswa Magang"
              dataList={summary.task.students.map((item) => {
                return {
                  name: item.name,
                  value: item.completed_tasks,
                };
              })}
            />
          </div>
          <div className="w-1/2 ">
            <PieChartCompenent
              tooltip="Persentase Status Tugas"
              legend="Distribusi Status Tugas"
              dataList={[
                {
                  name: "Selesai",
                  value: summary.task.completed,
                  color: "#4ade80", // Hijau
                },
                {
                  name: "Sedang Berjalan",
                  value: summary.task.in_progress,
                  color: "#60a5fa", // Biru
                },
                {
                  name: "Tertunda",
                  value: summary.task.pending,
                  color: "#facc15", // Kuning
                },
                {
                  name: "Dibatalkan",
                  value: summary.task.cancelled,
                  color: "#f87171", // Merah
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
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
                    Nama Pemagang
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600 uppercase">
                    Tenggat Waktu
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks && !isLoadingTasks ? (
                  tasks.map((task, index) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-800">{index + 1}</td>
                      <td className="p-4 text-gray-800">{task.title}</td>
                      <td className="p-4 text-gray-800">
                        {task.internship.student.name}
                      </td>
                      <td className="p-4 text-gray-600">
                        {getDeadline(task.due_date)}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-600">
                      <Loader />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Empty State (if no tasks) */}
          {tasks.length === 0 && !isLoadingTasks && (
            <div className="text-center py-12 col-span-2 ">
              <NotFoundComponent text="Anda belum memiliki tugas." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
