"use client";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import Loader from "@/components/loader";

// Lazy load components
const Navigation = dynamic(() => import("@/components/Navigation"), {
  loading: () => <div className="h-16 bg-white" />,
});
const LandingPage = dynamic(() => import("./Landingpage"), {
  loading: () => <Loader width={64} height={64} />,
});
const FooterPage = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-16" />,
});
const ServiceButton = dynamic(() => import("@/components/Service"), {
  loading: () => null,
});

interface Partner {
  id: string;
  name: string;
  address: string;
  logo: string;
  type: string;
}

interface CommentPrakerin {
  id: string;
  photo_profile: string | null;
  user?: {
    photo_profile?: string | null;
  };
  name: string;
  position: string;
  comment: string;
  created_at: string;
}

interface JobOpening {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  city_regency: {
    name: string;
  };
  province: {
    name: string;
  };
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    photo_profile: string;
  };
  save_job_opening?: boolean;
}

interface HomepageData {
  homepages: any;
  partners: Partner[];
  comment_prakerins: CommentPrakerin[];
  job_openings: JobOpening[];
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);

      const [csrfResponse, homepageResponse] = await Promise.allSettled([
        createApiCall({ url: "/sanctum/csrf-cookie" }, signal),
        createApiCall({ url: ENDPOINTS.HOMEPAGES }, signal),
      ]);

      if (homepageResponse.status === "fulfilled") {
        setData(homepageResponse.value.data);
      } else {
        console.error("Homepage API error:", homepageResponse.reason);
        throw homepageResponse.reason;
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data. Silakan refresh halaman.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const memoizedProps = useMemo(
    () => ({
      homepages: data?.homepages,
      partners: data?.partners || [],
      comments: data?.comment_prakerins || [],
      jobOpenings: data?.job_openings || [],
      // FooterPage di-pass sebagai prop ReactNode ke LandingPage
      // agar footer berada di dalam snap container yang sama
      footer: (
        <Suspense fallback={<div className="h-16" />}>
          <FooterPage />
        </Suspense>
      ),
    }),
    [data]
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchData();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white" />}>
        <Navigation section={activeSection} setSection={setActiveSection} />
      </Suspense>

      {loading ? (
        <div className="fixed w-full inset-0 flex justify-center items-center h-screen z-10 bg-white">
          <Loader width={64} height={64} />
        </div>
      ) : (
        <>
          <Suspense fallback={<Loader width={64} height={64} />}>
            {/* Footer sudah di-pass sebagai prop, tidak perlu render FooterPage di sini lagi */}
            <LandingPage {...memoizedProps} />
          </Suspense>

          <Suspense fallback={null}>
            <ServiceButton />
          </Suspense>
        </>
      )}
    </>
  );
}
