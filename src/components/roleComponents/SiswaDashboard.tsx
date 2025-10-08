import { BriefcaseBusiness, Building, MapPin } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { API, ENDPOINTS } from "../../../utils/config";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { alertError } from "@/libs/alert";
import Loader from "@/components/loader";

interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  currentStep: number;
  steps: {
    name: string;
    date: string;
    completed: boolean;
  }[];
}

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
  };
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

// Sample static data kept outside the component so it's not recreated on every render
const jobApplicationsSample: JobApplication[] = [
  {
    id: "1",
    title: "Frontend Web Developer",
    company: "PT Makerindo Prima Solusi",
    location: "Kabupaten Bandung, Jawa Barat",
    currentStep: 3,
    steps: [
      { name: "Apply", date: "02-06-2025", completed: true },
      { name: "Pending", date: "03-06-2025", completed: true },
      { name: "Test", date: "05-06-2025", completed: true },
      { name: "Ditolak", date: "06-06-2025", completed: false },
    ],
  },
];

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
  switch (status) {
    case "completed":
      return (
        <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Selesai Magang
        </span>
      );
    case "not_started":
      return (
        <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Mencari Magang
        </span>
      );
    case "ongoing":
      return (
        <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Sedang Magang
        </span>
      );
    default:
      return null;
  }
}

// Small memoized component to render vertical progress steps
const StepTimeline = React.memo(function StepTimeline({
  steps,
  status,
}: {
  steps: Test[];
  status: string;
}) {
  // compute currentStep as number of passed tests + base step (Submitted)
  const currentStep = useMemo(() => {
    const passed = steps.reduce(
      (acc, s) => acc + (s.pivot?.is_passed ? 1 : 0),
      0
    );
    // base 1 for 'Submitted', plus passed tests
    let cs = 1 + passed;
    // if not in progress, move to final/result step
    if (status !== "in_progress") cs += 1;
    return cs;
  }, [steps, status]);

  // build a unified steps array: Submitted -> tests... -> Result
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
    <div className="relative">
      <div className="flex flex-col space-y-6">
        {allSteps.map((step, idx) => {
          // stepIndex here mirrors original indexing: 0..n
          const stepIndex = idx; // 0-based
          const circleColorClass = getStepColor(
            stepIndex,
            currentStep,
            !!step.isPassed,
            status
          );

          // connector between this step and the next: active when (idx + 1) < currentStep
          const connectorActive = idx + 1 < currentStep;

          return (
            <div key={idx} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${circleColorClass}`}
                >
                  {idx + 1}
                </div>
                {idx !== allSteps.length - 1 && (
                  <div
                    style={{
                      backgroundColor: connectorActive ? "#14b8a6" : "#e5e7eb",
                    }}
                    className="w-px h-6 mt-2"
                  />
                )}
              </div>

              <div className="pt-1">
                <div className="text-sm font-medium text-gray-800">
                  {step.title}
                </div>
                {/* optional small meta/date can go here */}
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

  const fetchData = async () => {
    setIsLoading(true);
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      const token = Cookies.get("userToken") || "";

      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const pProfile = API.get(`${ENDPOINTS.USERS}/profile`, { headers });
      const pCount = API.get(`${ENDPOINTS.INTERNSHIP_APPLICATIONS}/count`, {
        headers,
      });
      const pApps = API.get(ENDPOINTS.INTERNSHIP_APPLICATIONS, { headers });

      try {
        const results = await Promise.allSettled([pProfile, pCount, pApps]);
        console.log(results);

        // profile
        if (results[0].status === "fulfilled" && mounted) {
          setProfile(results[0].value.data.data);
        } else if (results[0].status === "rejected") {
          const err = results[0].reason;
          if (err instanceof AxiosError)
            await alertError(err.response?.data.errors);
        }

        // count
        if (results[1].status === "fulfilled" && mounted) {
          setInternshipApplicationCount(results[1].value.data.data);
        } else if (results[1].status === "rejected") {
          const err = results[1].reason;
          if (err instanceof AxiosError)
            await alertError(err.response?.data.errors);
        }

        // applications
        if (results[2].status === "fulfilled" && mounted) {
          setInternshipApplication(results[2].value.data.data);
        } else if (results[2].status === "rejected") {
          const err = results[2].reason;
          if (err instanceof AxiosError)
            await alertError(err.response?.data.errors);
        }
      } catch (err) {
        // Fallback catch (shouldn't normally happen since we used allSettled)
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
    return () => {
      mounted = false;
    };
  }, []);

  const statusBadge = useMemo(
    () => <StatusBadge status={profile.student.status} />,
    [profile.student.status]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen absolute inset-0 z-10 bg-blue-50">
        <Loader width={64} height={64} />
      </div>
    );
  }

  return (
    <>
      {/* Resume Section */}
      <div className=" p-6 mb-8">
        <div className="flex items-center pt-2 space-x-2 font-bold text-accent">
          <BriefcaseBusiness className="w-5 h-5" />
          <h2 className="text-xl mt-2">Resume Lamaran Magang</h2>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-600 text-sm">
            Lihat! Kamu sudah apply {internshipApplicationCount.total} lowongan!
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            {statusBadge}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {internshipApplication.map((application) => (
          <div
            key={application.id}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                {application.job_opening.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                <Building className="w-4 h-4" />
                <span>{application.company.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {application.city_regency.name}, {application.province.name}
                </span>
              </div>
            </div>

            {/* If the backend returns steps/currentStep in the future use StepTimeline. For now show sample steps timeline for demo */}
            <StepTimeline
              steps={application.test}
              status={application.status}
            />
          </div>
        ))}
      </div>

      {internshipApplication.length === 0 && (
        <p className="text-gray-500 p-6 text-center ">
          Kamu belum melamar magang di perusahaan manapun.
        </p>
      )}
    </>
  );
}
