import {
  Award,
  Briefcase,
  CircleArrowRight,
  Info,
  Search,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import PieChartCompenent from "../Charts/PieChartCompenent";
import BarChartComponent from "../Charts/BarChartCompenent";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "@/utils/config";
import { RatingSummary } from "@/models/feedback";
import NotFoundComponent from "../NotFoundComponent";
import Loader from "../loader";
import useDebounce from "@/hooks/useDebounce";
import KPICard from "../dashboard/KPICard";
import InsightCard from "../dashboard/InsightCard";
import SectionHeader from "../dashboard/SectionHeader";

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
    job_opening_count: { true: 0, false: 0, total: 0 },
    achievement_count: 0,
    task: { cancelled: 0, completed: 0, in_progress: 0, pending: 0, students: [] },
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
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      const jobOpeningCount = API.get(`${ENDPOINTS.JOB_OPENINGS}/count`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        params: { dashboard: true },
      });
      const achievementCount = API.get(`${ENDPOINTS.ACHIEVEMENTS}/count`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      const rating = API.get(`${ENDPOINTS.FEEDBACKS}/rating`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      const taskCount = API.get(`${ENDPOINTS.TASKS}/count`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });

      const response = await Promise.all([
        internshipCount,
        jobOpeningCount,
        achievementCount,
        rating,
        taskCount,
      ]);

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
        params: { search: inputSearch, limit: 10, is_deadline: true },
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      setTasks(response.data.data);
    } catch (error) {
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const getDeadline = (deadline: string) => {
    const d = deadline.split("-");
    return `${d[2]}-${d[1]}-${d[0]}`;
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (inputSearch.trim() !== "") {
      if (!debouncedQuery) { setTasks([]); return; }
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

  const taskTotal =
    summary.task.completed +
    summary.task.in_progress +
    summary.task.pending +
    summary.task.cancelled;

  const completionRate =
    taskTotal > 0
      ? Math.round((summary.task.completed / taskTotal) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* === KPI Cards === */}
      <section>
        <SectionHeader
          title="Ringkasan Perusahaan"
          subtitle="Statistik pemagang, lowongan, dan tugas aktif"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard
            title="Total Pemagang"
            value={summary.internship_count}
            icon={<Users className="w-5 h-5" />}
            iconBg="bg-teal-100"
            iconColor="text-teal-600"
            description="Siswa/Mahasiswa aktif magang"
          />
          <KPICard
            title="Total Lowongan"
            value={summary.job_opening_count.total}
            icon={<Briefcase className="w-5 h-5" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            description={`${summary.job_opening_count.true} aktif · ${summary.job_opening_count.false} tidak aktif`}
          />
          <KPICard
            title="Total Penghargaan"
            value={summary.achievement_count}
            icon={<Award className="w-5 h-5" />}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            description="Diberikan kepada pemagang"
          />
          <KPICard
            title="Tugas Selesai"
            value={summary.task.completed}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            description={`${completionRate}% dari total tugas`}
          />
        </div>
      </section>

      {/* === Insight Cards === */}
      <section>
        <SectionHeader
          title="Insights Rekrutmen"
          subtitle="Ringkasan performa dan status tugas saat ini"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InsightCard
            icon={<Clock className="w-5 h-5" />}
            title="Tugas Tertunda"
            metric={summary.task.pending}
            description="Tugas yang belum dikerjakan pemagang — perlu diperhatikan."
            status={summary.task.pending > 5 ? "warning" : "neutral"}
          />
          <InsightCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Tingkat Penyelesaian Tugas"
            metric={`${completionRate}%`}
            description="Persentase tugas yang sudah diselesaikan pemagang."
            status={completionRate >= 70 ? "positive" : completionRate >= 40 ? "warning" : "negative"}
          />
          <InsightCard
            icon={<XCircle className="w-5 h-5" />}
            title="Tugas Dibatalkan"
            metric={summary.task.cancelled}
            description="Tugas yang dibatalkan sebelum selesai dikerjakan."
            status={summary.task.cancelled > 0 ? "negative" : "positive"}
          />
        </div>
      </section>

      {/* === Charts === */}
      <section>
        <SectionHeader
          title="Distribusi Tugas & Pemagang"
          subtitle="Visualisasi status dan performa pemagang"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Grafik Tugas Selesai per Pemagang</h4>
            <BarChartComponent
              legend=""
              hideCardStyle={true}
              dataList={summary.task.students.map((item) => ({
                name: item.name,
                value: item.completed_tasks,
              }))}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Status Semua Tugas</h4>
            <PieChartCompenent
              tooltip="Persentase Status Tugas"
              legend=""
              hideCardStyle={true}
              dataList={[
                { name: "Selesai", value: summary.task.completed, color: "#4ade80" },
                { name: "Sedang Berjalan", value: summary.task.in_progress, color: "#60a5fa" },
                { name: "Tertunda", value: summary.task.pending, color: "#facc15" },
                { name: "Dibatalkan", value: summary.task.cancelled, color: "#f87171" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* === Penilaian Perusahaan === */}
      <section>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-accent-dark">Penilaian Perusahaan</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Penilaian dari siswa/mahasiswa yang magang di perusahaan ini
              </p>
            </div>
            <Link href="/dashboard/feedback">
              <CircleArrowRight className="text-accent/75 hover:text-accent transition-colors w-6 h-6" />
            </Link>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="text-4xl font-extrabold text-accent-dark">
              {ratingSummary.average_rating?.toFixed(1) || "—"}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-lg">
                {"★".repeat(Math.round(ratingSummary.average_rating || 0))}
                {"☆".repeat(5 - Math.round(ratingSummary.average_rating || 0))}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                dari {ratingSummary.rating_count || 0} ulasan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === Task Table === */}
      <section>
        <SectionHeader
          title="Daftar Tugas Mendekati Deadline"
          subtitle="10 tugas terdekat berdasarkan tenggat waktu"
          actionLabel="Lihat Semua"
          actionHref="/dashboard/tasklist"
        />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="w-full bg-accent text-white placeholder-white/60 pl-10 pr-4 py-3 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">No</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Tugas</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Pemagang</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenggat Waktu</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tasks && !isLoadingTasks ? (
                  tasks.map((task, index) => (
                    <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="p-4 text-sm font-medium text-gray-800">{task.title}</td>
                      <td className="p-4 text-sm text-gray-700">{task.internship?.student?.name ?? "-"}</td>
                      <td className="p-4 text-sm text-gray-500">{getDeadline(task.due_date)}</td>
                      <td className="p-4">
                        <Link
                          href={`/dashboard/tasklist/${task.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-6">
                      <Loader />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {tasks.length === 0 && !isLoadingTasks && (
            <div className="text-center py-12">
              <NotFoundComponent text="Anda belum memiliki tugas." />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
