import {
  BriefcaseBusiness,
  Building,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  BarChart3,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { API, ENDPOINTS } from "@/utils/config";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { alertError } from "@/libs/alert";
import Loader from "@/components/loader";
import KPICard from "@/components/dashboard/KPICard";
import InsightCard from "@/components/dashboard/InsightCard";
import SectionHeader from "@/components/dashboard/SectionHeader";
import PieChartCompenent from "../Charts/PieChartCompenent";

interface InternshipApplicationCount {
  total: number;
  accepted: number;
  rejected: number;
  in_progress: number;
}

interface InternshipApplication {
  id: string;
  job_opening: {
    title: string;
  };
  company: {
    name: string;
  };
  city_regency: {
    name: string;
  };
  province: {
    name: string;
  };
  status: string;
  test: Test[];
}

interface Profile {
  student: {
    status: Status;
    photo_profile?: string;
  };
  name?: string;
}

interface Test {
  title: string;
  type: string;
  pivot: {
    is_passed: boolean;
    test_id: string;
    internship_application_id: string;
  };
}

type Status = "not_started" | "ongoing" | "completed" | "";

// Pure helper: compute color class for a step
function getStepColor(
  stepIndex: number,
  currentStep: number,
  isCompleted: boolean,
  status: string
) {
  if (stepIndex < currentStep) return "bg-accent";
  if (stepIndex === currentStep && isCompleted) return "bg-accent";
  if (stepIndex === currentStep && !isCompleted) return "bg-teal-500";
  if (stepIndex === currentStep && status === "accepted") return "bg-green-500";
  if (stepIndex === currentStep && status === "rejected") return "bg-red-500";
  return "bg-gray-300";
}

// Pure helper: render status badge
function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, { label: string; class: string }> = {
    completed: {
      label: "Selesai Magang",
      class: "bg-green-100 text-green-700 border border-green-200",
    },
    not_started: {
      label: "Mencari Magang",
      class: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    ongoing: {
      label: "Sedang Magang",
      class: "bg-amber-100 text-amber-700 border border-amber-200",
    },
    "": { label: "", class: "" },
  };
  const s = styles[status];
  if (!s?.label) return null;
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.class}`}>
      {s.label}
    </span>
  );
}

// Application status label
function ApplicationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
    accepted: {
      label: "Diterima",
      class: "bg-green-100 text-green-700 border border-green-200",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    rejected: {
      label: "Ditolak",
      class: "bg-red-100 text-red-700 border border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
    in_progress: {
      label: "Sedang Proses",
      class: "bg-blue-100 text-blue-700 border border-blue-200",
      icon: <Clock className="w-3 h-3" />,
    },
  };
  const s = map[status] ?? {
    label: status,
    class: "bg-gray-100 text-gray-700 border border-gray-200",
    icon: null,
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${s.class}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

// Small memoized component to render vertical progress steps
const StepTimeline = React.memo(function StepTimeline({
  steps,
  status,
}: {
  steps: Test[];
  status: string;
}) {
  const currentStep = useMemo(() => {
    const passed = steps.reduce(
      (acc, s) => acc + (s.pivot?.is_passed ? 1 : 0),
      0
    );
    let cs = 1 + passed;
    if (status !== "in_progress") cs += 1;
    return cs;
  }, [steps, status]);

  const allSteps = useMemo(() => {
    const arr: { title: string; isPassed?: boolean }[] = [];
    arr.push({ title: "Submitted", isPassed: true });
    steps.forEach((s) =>
      arr.push({ title: s.title, isPassed: s.pivot?.is_passed })
    );
    arr.push({
      title: "Result",
      isPassed: status === "completed" || status === "rejected",
    });
    return arr;
  }, [steps, status]);

  return (
    <div className="relative mt-4">
      <div className="flex flex-col space-y-4">
        {allSteps.map((step, idx) => {
          const stepIndex = idx;
          const circleColorClass = getStepColor(
            stepIndex,
            currentStep,
            !!step.isPassed,
            status
          );
          const connectorActive = idx + 1 < currentStep;

          return (
            <div key={idx} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${circleColorClass}`}
                >
                  {idx + 1}
                </div>
                {idx !== allSteps.length - 1 && (
                  <div
                    style={{
                      backgroundColor: connectorActive ? "#00809d" : "#e5e7eb",
                    }}
                    className="w-0.5 h-5 mt-1"
                  />
                )}
              </div>
              <div className="pt-1">
                <div className="text-sm font-medium text-gray-700">
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default function SiswaDashboard({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [profile, setProfile] = useState<Profile>({ student: { status: "" } });
  const [internshipApplication, setInternshipApplication] = useState<
    InternshipApplication[]
  >([]);
  const [internshipApplicationCount, setInternshipApplicationCount] =
    useState<InternshipApplicationCount>({
      total: 0,
      accepted: 0,
      rejected: 0,
      in_progress: 0,
    });

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      const token = Cookies.get("userToken") || "";
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const pProfile = API.get(`${ENDPOINTS.USERS}/profile`, { headers });
      const pCount = API.get(`${ENDPOINTS.INTERNSHIP_APPLICATIONS}/count`, { headers });
      const pApps = API.get(ENDPOINTS.INTERNSHIP_APPLICATIONS, { headers });

      try {
        const results = await Promise.allSettled([pProfile, pCount, pApps]);

        if (results[0].status === "fulfilled" && mounted) {
          setProfile(results[0].value.data.data);
        } else if (results[0].status === "rejected") {
          const err = results[0].reason;
          if (err instanceof AxiosError) await alertError(err.response?.data.errors);
        }

        if (results[1].status === "fulfilled" && mounted) {
          setInternshipApplicationCount(results[1].value.data.data);
        } else if (results[1].status === "rejected") {
          const err = results[1].reason;
          if (err instanceof AxiosError) await alertError(err.response?.data.errors);
        }

        if (results[2].status === "fulfilled" && mounted) {
          setInternshipApplication(results[2].value.data.data);
        } else if (results[2].status === "rejected") {
          const err = results[2].reason;
          if (err instanceof AxiosError) await alertError(err.response?.data.errors);
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          await alertError(err.response?.data.errors);
        } else {
          console.error(err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const statusBadge = useMemo(
    () => <StatusBadge status={profile?.student?.status || ""} />,
    [profile?.student?.status]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  const count = internshipApplicationCount;
  const pieData = [
    { name: "Sedang Proses", value: count.in_progress, color: "#06b6d4" },
    { name: "Diterima", value: count.accepted, color: "#22c55e" },
    { name: "Ditolak", value: count.rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* === KPI Cards === */}
      <section>
        <SectionHeader
          title="Ringkasan Lamaranmu"
          subtitle="Statistik semua lamaran magang yang sudah kamu kirim"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Lamaran Aktif"
            value={count.in_progress}
            icon={<Clock className="w-5 h-5" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            description="Sedang dalam proses seleksi"
          />
          <KPICard
            title="Berhasil Dipanggil"
            value={count.accepted}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            description="Lolos tahap akhir seleksi"
          />
          <KPICard
            title="Tidak Lolos"
            value={count.rejected}
            icon={<XCircle className="w-5 h-5" />}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            description="Belum berhasil pada seleksi"
          />
          <KPICard
            title="Total Lamaran"
            value={count.total}
            icon={<FileText className="w-5 h-5" />}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            description="Jumlah semua berkas dikirim"
          />
        </div>
      </section>

      {/* === Insights Section === */}
      {count.total > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Insights */}
          <div className="flex flex-col gap-4">
            <InsightCard
              icon={<BriefcaseBusiness className="w-5 h-5" />}
              title="Status Magang Kamu"
              metric={count.in_progress}
              description="Lamaran yang sedang aktif dalam proses seleksi saat ini."
              status={count.in_progress > 0 ? "neutral" : "warning"}
            />
            <InsightCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              title="Tingkat Keberhasilan"
              metric={
                count.total > 0
                  ? `${Math.round((count.accepted / count.total) * 100)}%`
                  : "0%"
              }
              description="Persentase lamaran yang berhasil masuk ke tahap selanjutnya."
              status={count.accepted > 0 ? "positive" : "neutral"}
            />
            <InsightCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Tingkat Penolakan"
              metric={
                count.total > 0
                  ? `${Math.round((count.rejected / count.total) * 100)}%`
                  : "0%"
              }
              description="Persentase lamaran yang tidak lolos ke tahap selanjutnya."
              status={count.rejected > count.accepted ? "negative" : "neutral"}
            />
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Distribusi Lamaran</h4>
            <p className="text-xs text-gray-500 mb-4">Visualisasi status semua lamaran kamu</p>
            {pieData.length > 0 ? (
              <PieChartCompenent
                legend=""
                tooltip="Status Lamaran"
                hideCardStyle={true}
                dataList={pieData}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Belum ada data lamaran
              </div>
            )}
          </div>
        </section>
      )}

      {/* === Applications List === */}
      <section>
        <SectionHeader
          title="Resume Lamaran Magang"
          subtitle={`Kamu sudah apply ${count.total} lowongan magang`}
          actionLabel="Lihat Semua"
          actionHref="/dashboard/lowongan"
        />

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Status saat ini:</span>
          {statusBadge}
        </div>

        {internshipApplication.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {internshipApplication.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
              >
                {/* Job info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                      {application?.job_opening?.title ?? "Lowongan Magang"}
                    </h3>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Building className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{application.company?.name ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {application.city_regency?.name ?? "N/A"}, {application.province?.name ?? "N/A"}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Progress Seleksi
                  </p>
                  <StepTimeline
                    steps={application?.test || []}
                    status={application.status}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BriefcaseBusiness className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Belum Ada Lamaran</h3>
            <p className="text-sm text-gray-400 mb-4">
              Kamu belum melamar magang di perusahaan manapun.
            </p>
            <a
              href="/dashboard/lowongan"
              className="inline-block bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
            >
              Cari Lowongan Magang
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
