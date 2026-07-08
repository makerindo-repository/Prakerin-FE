import {
  BadgeCheck,
  BriefcaseBusiness,
  Building,
  CircleArrowRight,
  Users,
  TrendingUp,
  Activity,
  Star,
} from "lucide-react";
import RatingSummaryCompenent from "../RatingSummaryCompenent";
import PieChartCompenent from "../Charts/PieChartCompenent";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RatingSummary } from "@/models/feedback";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { mapRatingToData } from "@/utils/mapRatingToData";
import Loader from "../loader";
import KPICard from "../dashboard/KPICard";
import InsightCard from "../dashboard/InsightCard";
import SectionHeader from "../dashboard/SectionHeader";

interface Summary {
  student_count: number;
  student_internship_count: number;
  job_opening_count: {
    true: number;
    false: number;
    total: number;
  };
  company_count: number;
  achievement_count: number;
}

interface StudentCount {
  not_started: number;
  ongoing: number;
  completed: number;
}

export default function SchoolDashboard({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [summary, setSummary] = useState<Summary>({
    student_count: 0,
    student_internship_count: 0,
    job_opening_count: { true: 0, false: 0, total: 0 },
    company_count: 0,
    achievement_count: 0,
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
  const [studentCount, setStudentCount] = useState<StudentCount>({
    not_started: 0,
    ongoing: 0,
    completed: 0,
  });

  const fetchData = async () => {
    try {
      const userpCount = API.get(`${ENDPOINTS.USERS}/count`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      const jobOpeningCount = API.get(`${ENDPOINTS.JOB_OPENINGS}/count`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      const achievementCount = API.get(`${ENDPOINTS.ACHIEVEMENTS}/count`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      const rating = API.get(`${ENDPOINTS.FEEDBACKS}/rating`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });
      const studentCountReq = API.get(`${ENDPOINTS.STUDENTS}/count`, {
        headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
      });

      const response = await Promise.all([
        userpCount,
        jobOpeningCount,
        achievementCount,
        rating,
        studentCountReq,
      ]);

      setSummary({
        student_count: response[0].data.data.student_count,
        student_internship_count: response[0].data.data.total_student_internship,
        job_opening_count: response[1].data.data,
        company_count: response[0].data.data.company_count,
        achievement_count: response[2].data.data,
      });
      setRatingSummary(response[3].data.data);
      setStudentCount(response[4].data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const ratingColors = ["#ff0000", "#ff6600", "#ffcc00", "#66cc00", "#009900"];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  const totalStudents = studentCount.not_started + studentCount.ongoing + studentCount.completed;
  const placementRate =
    totalStudents > 0
      ? Math.round(((studentCount.ongoing + studentCount.completed) / totalStudents) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* === KPI Cards === */}
      <section>
        <SectionHeader
          title="Ringkasan Sekolah"
          subtitle="Statistik siswa, lowongan, dan penempatan magang"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Siswa/Mahasiswa"
            value={summary.student_count}
            icon={<Users className="w-5 h-5" />}
            iconBg="bg-teal-100"
            iconColor="text-teal-600"
            description="Terdaftar di institusi ini"
          />
          <KPICard
            title="Siswa Magang"
            value={summary.student_internship_count}
            icon={<Activity className="w-5 h-5" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            description="Sedang atau pernah magang"
          />
          <KPICard
            title="Total Lowongan"
            value={summary.job_opening_count.total}
            icon={<BriefcaseBusiness className="w-5 h-5" />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            description={`${summary.job_opening_count.true} aktif · ${summary.job_opening_count.false} tidak aktif`}
          />
          <KPICard
            title="Total Perusahaan"
            value={summary.company_count}
            icon={<Building className="w-5 h-5" />}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            description="Perusahaan partner aktif"
          />
          <KPICard
            title="Total Penghargaan"
            value={summary.achievement_count}
            icon={<BadgeCheck className="w-5 h-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            description="Diraih siswa/mahasiswa"
          />
        </div>
      </section>

      {/* === Insight Cards === */}
      <section>
        <SectionHeader
          title="Insights Penempatan"
          subtitle="Analisis cepat status penempatan siswa"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InsightCard
            icon={<Activity className="w-5 h-5" />}
            title="Siswa Sedang Magang"
            metric={studentCount.ongoing}
            description="Siswa yang saat ini sedang menjalani program magang."
            status="positive"
          />
          <InsightCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Tingkat Penempatan"
            metric={`${placementRate}%`}
            description="Persentase siswa yang sudah atau sedang magang dari total siswa."
            status={placementRate >= 60 ? "positive" : placementRate >= 30 ? "warning" : "negative"}
          />
          <InsightCard
            icon={<Star className="w-5 h-5" />}
            title="Rating Sekolah"
            metric={ratingSummary.average_rating?.toFixed(1) || "—"}
            metricUnit=" / 5"
            description={`Dari ${ratingSummary.rating_count || 0} ulasan pengguna Prakerin.`}
            status={
              (ratingSummary.average_rating || 0) >= 4
                ? "positive"
                : (ratingSummary.average_rating || 0) >= 2.5
                ? "warning"
                : "negative"
            }
          />
        </div>
      </section>

      {/* === Charts === */}
      <section>
        <SectionHeader
          title="Statistik Siswa"
          subtitle="Visualisasi distribusi dan status magang siswa"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Student distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Status Magang Siswa</h4>
            <PieChartCompenent
              legend=""
              tooltip="Distribusi Status Magang"
              hideCardStyle={true}
              dataList={[
                { name: "Belum Magang", value: studentCount.not_started, color: "#ff0000" },
                { name: "Sedang Magang", value: studentCount.ongoing, color: "#ffcc00" },
                { name: "Telah Magang", value: studentCount.completed, color: "#66cc00" },
              ]}
            />
          </div>

          {/* Grid vs Lowongan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Siswa vs Lowongan</h4>
            <PieChartCompenent
              legend=""
              tooltip="Persentase Siswa dan Lowongan"
              hideCardStyle={true}
              dataList={[
                { name: "Total Siswa", value: summary.student_count, color: "#4f46e5" },
                { name: "Lowongan", value: summary.job_opening_count.total, color: "#22c55e" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* === Company & Job Opening Stats === */}
      <section>
        <SectionHeader
          title="Statistik Perusahaan & Lowongan"
          subtitle="Visualisasi total perusahaan dan status lowongan"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Perusahaan & Lowongan</h4>
            <PieChartCompenent
              legend=""
              tooltip="Total Perusahaan dan Lowongan"
              hideCardStyle={true}
              dataList={[
                { name: "Perusahaan", value: summary.company_count, color: "#4f46e5" },
                { name: "Lowongan", value: summary.job_opening_count.total, color: "#22c55e" },
              ]}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-4">Status Lowongan</h4>
            <PieChartCompenent
              legend=""
              tooltip="Lowongan Aktif & Tidak Aktif"
              hideCardStyle={true}
              dataList={[
                { name: "Lowongan Aktif", value: summary.job_opening_count.true, color: "#66cc00" },
                { name: "Lowongan Tidak Aktif", value: summary.job_opening_count.false, color: "#ff0000" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* === School Rating Section === */}
      <section>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div>
              <h3 className="font-bold text-sm text-accent-dark">Penilaian Sekolah</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Penilaian dari siswa/mahasiswa dan perusahaan pengguna Prakerin
              </p>
            </div>
            <Link href="/dashboard/feedback" className="flex-shrink-0">
              <CircleArrowRight className="text-accent/75 hover:text-accent transition-colors w-6 h-6" />
            </Link>
          </div>

          {ratingSummary.rating_count > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RatingSummaryCompenent data={ratingSummary} />
              <PieChartCompenent
                legend=""
                tooltip="Persentase Penilaian"
                dataList={mapRatingToData(ratingSummary, ratingColors)}
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada penilaian untuk sekolah ini.</p>
              <p className="text-xs text-gray-400 mt-1">
                Penilaian akan muncul setelah siswa/mahasiswa memberikan ulasan.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}