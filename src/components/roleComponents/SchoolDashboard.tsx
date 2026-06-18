  import {
  BadgeCheck,
  BriefcaseBusiness,
  Building,
  CircleArrowRight,
  Users,
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
    job_opening_count: {
      true: 0,
      false: 0,
      total: 0,
    },
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

      const studentCount = API.get(`${ENDPOINTS.STUDENTS}/count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const response = await Promise.all([
        userpCount,
        jobOpeningCount,
        achievementCount,
        rating,
        studentCount,
      ]);

      console.log(response);
      setSummary({
        student_count: response[0].data.data.student_count,
        student_internship_count:
          response[0].data.data.total_student_internship,
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

  useEffect(() => {
    fetchData();
  }, []);

  const ratingColors = ["#ff0000", "#ff6600", "#ffcc00", "#66cc00", "#009900"];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.student_count}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Total Siswa/Mahasiswa
            </h3>
          </div>
          <Users className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.student_internship_count}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Total Siswa Magang
            </h3>
          </div>
          <Users className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.job_opening_count.total}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Total Lowongan
            </h3>
          </div>
          <BriefcaseBusiness className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.company_count}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Total Perusahaan
            </h3>
          </div>
          <Building className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex justify-between items-center gap-2">
          <div className="text-accent-dark min-w-0 flex-1">
            <h1 className="font-extrabold text-xl sm:text-2xl whitespace-nowrap">
              {summary.achievement_count}
            </h1>
            <h3 className="text-xs sm:text-sm leading-tight break-words">
              Total Penghargaan
            </h3>
          </div>
          <BadgeCheck className="text-accent w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
        </div>
      </div>

      {/* School Rating Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row mb-4 gap-2 sm:gap-4 justify-between items-start">
          <div className="flex flex-col flex-1">
            <h3 className="font-bold text-base sm:text-lg">Penilaian Sekolah</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Penilaian didapat dari siswa/mahasiswa dan perusahaan yang terdaftar sebagai
              pengguna Prakerin
            </p>
          </div>
          <Link href="/dashboard/feedback" className="self-end sm:self-auto">
            <CircleArrowRight
              className="text-accent/75 hover:text-accent transition-colors"
              size={28}
            />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="w-full lg:w-1/2">
            {/* <RatingSummaryCompenent data={ratingSummary} /> */}
          </div>
          <div className="w-full lg:w-1/2">
            {/* <PieChartCompenent
              legend="Persentase Penilaian"
              tooltip="Persentase Penilaian"
              dataList={mapRatingToData(ratingSummary, ratingColors)}
            /> */}
          </div>
        </div>
      </div>

      {/* Student Statistics Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex flex-col mb-4">
          <h3 className="font-bold text-base sm:text-lg">Statistik Siswa</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Visualisasi total siswa/mahasiswa yang telah magang
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="w-full lg:w-1/2">
            <PieChartCompenent
              legend="Distribusi Siswa dan Lowongan"
              tooltip="Persentasi Siswa dan Lowongan"
              dataList={[
                {
                  name: "Total Siswa",
                  value: summary.student_count,
                  color: "#4f46e5",
                },
                {
                  name: "Lowongan",
                  value: summary.job_opening_count.total,
                  color: "#22c55e",
                },
              ]}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <PieChartCompenent
              legend="Status Magang Siswa"
              tooltip="Distribusi Status Magang"
              dataList={[
                {
                  name: "Belum Magang",
                  value: studentCount.not_started,
                  color: "#ff0000",
                },
                {
                  name: "Sedang Magang",
                  value: studentCount.ongoing,
                  color: "#ffcc00",
                },
                {
                  name: "Telah Magang",
                  value: studentCount.completed,
                  color: "#66cc00",
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Company and Job Opening Statistics Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex flex-col mb-4">
          <h3 className="font-bold text-base sm:text-lg">
            Statistik Perusahaan dan Lowongan
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Visualisasi total perusahaan dan lowongan
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="w-full lg:w-1/2">
            <PieChartCompenent
              legend="Perusahaan dan Lowongan"
              tooltip="Total Perusahaan dan Lowongan"
              dataList={[
                {
                  name: "Perusahaan",
                  value: summary.company_count,
                  color: "#4f46e5",
                },
                {
                  name: "Lowongan",
                  value: summary.job_opening_count.total,
                  color: "#22c55e",
                },
              ]}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <PieChartCompenent
              legend="Status Lowongan"
              tooltip="Lowongan Aktif & Tidak Aktif"
              dataList={[
                {
                  name: "Lowongan Aktif",
                  value: summary.job_opening_count.true,
                  color: "#66cc00",
                },
                {
                  name: "Lowongan Tidak Aktif",
                  value: summary.job_opening_count.false,
                  color: "#ff0000",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}