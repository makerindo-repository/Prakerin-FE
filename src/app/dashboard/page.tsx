"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { UserCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { createApiCall, ENDPOINTS, getPhotoProfileUrl } from "@/utils/config";
import { getGreeting, getGreetingDetails } from "@/utils/getGreeting";
import Image from "next/image";
import { alertSuccess } from "@/libs/alert";
import Loader from "@/components/loader";

// Lazy load role-specific dashboards
const SiswaDashboard = dynamic(() => import("@/components/roleComponents/SiswaDashboard"), {
  loading: () => <Loader width={64} height={64} />,
});
const IndustryDashboard = dynamic(() => import("@/components/roleComponents/industryDashboard"), {
  loading: () => <Loader width={64} height={64} />,
});
const SchoolDashboard = dynamic(() => import("@/components/roleComponents/SchoolDashboard"), {
  loading: () => <Loader width={64} height={64} />,
});
const AdminDashboard = dynamic(() => import("@/components/roleComponents/adminDashboard"), {
  loading: () => <Loader width={64} height={64} />,
});

interface Profile {
  photo_profile?: string | null;
  name: string;
  username?: string;
  role?: string;
  student?: {
    photo_profile?: string | null;
    school?: {
      type?: string | null;
    };
  };
  school?: {
    photo_profile?: string | null;
    type?: string | null;
  };
  company?: {
    photo_profile?: string | null;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('api/', ''); //BASE_URL to fetch profile pictures correctly since previous added /api into the path

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string>("");
  const [profile, setProfile] = useState<Profile>({
    name: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const greetingDetails = getGreetingDetails();

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await createApiCall({
        url: `${ENDPOINTS.USERS}/profile`,
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
        signal,
      });
      
      if (response && response.data) {
        const data = response.data;
        
        // Optimize role mapping
        const roleMap: Record<string, string> = {
          student: "Siswa",
          company: "Perusahaan",
          school: "Sekolah",
          super_admin: "Super Admin",
        };
        
        let photoProfile = null;
        if (data.role === "student" && data.student?.photo_profile) {
          photoProfile = data.student.photo_profile;
        } else if (data.role === "school" && data.school?.photo_profile) {
          photoProfile = data.school.photo_profile;
        } else if (data.role === "company" && data.company?.photo_profile) {
          photoProfile = data.company.photo_profile;
        } else if (data.photo_profile) {
          photoProfile = data.photo_profile;
        }
        
        setProfile({
          ...data,
          photo_profile: photoProfile,
          role: roleMap[data.role] || "",
        });
      }
    } catch (error: any) {
      const isCanceled =
        error?.name === "AbortError" ||
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED" ||
        error?.message === "canceled";

      if (!isCanceled) {
        console.error("Error fetching profile:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const alertLogin = async () => {
    const loginSuccess = localStorage.getItem("login-success");
    if (loginSuccess) {
      await alertSuccess("Berhasil masuk!");
      localStorage.removeItem("login-success");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    
    fetchProfile(controller.signal);
    alertLogin();
    setRole(Cookies.get("authorization") as string);
    
    return () => controller.abort();
  }, [fetchProfile]);

  return (
    <main className="p-6 relative">
      {/* Welcome Section */}
      {!isLoading && (
        <>
          <h1 className="text-accent-dark mb-5 font-medium">Dashboard</h1>

          <div className="bg-gradient-to-r from-accent-light to-accent rounded-lg p-6 text-white mb-8">
            <div className="flex items-center space-x-4">
              {profile.photo_profile ? (
                <div className="w-16 h-16 rounded-full border-white border overflow-hidden flex-shrink-0">
                  <img
                    src={getPhotoProfileUrl(profile.photo_profile) || ""}
                    alt="Photo Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <UserCircle className="w-16 h-16 text-white flex-shrink-0" />
              )}
              {/*There should be something that made a random text appear, with the content of current page name / username if in profile page*/}
              <div>
                <h1 className="text-xl font-semibold">
                  Selamat {greetingDetails.timeOfDay}, {profile.name || profile.username || "User"}.
                </h1>
                <p className="text-sm opacity-90 mt-0.5">{greetingDetails.sentence}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <Suspense fallback={<Loader width={64} height={64} />}>
        {role === "student" && (
          <SiswaDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
        )}
        {role === "company" && (
          <IndustryDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
        )}
        {role === "school" && (
          <SchoolDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
        )}
        {role === "super_admin" && (
          <AdminDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
        )}
      </Suspense>
    </main>
  );
};

export default Dashboard;