"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { UserCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import { getGreeting } from "@/utils/getGreeting";
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
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('api/', ''); //BASE_URL to fetch profile pictures correctly since previous added /api into the path

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string>("");
  const [profile, setProfile] = useState<Profile>({
    name: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await createApiCall({
        url: `${ENDPOINTS.USERS}/profile`,
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      }, signal);
      
      if (response.status === 200) {
        const data = response.data.data;
        
        // Optimize role mapping
        const roleMap: Record<string, string> = {
          student: "Siswa",
          company: "Perusahaan",
          school: "Sekolah",
          super_admin: "Super Admin",
        };
        
        setProfile({
          ...data,
          role: roleMap[data.role] || "",
        });
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
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

  // Role-specific subtitle for the welcome banner
  const getRoleSubtitle = (r: string) => {
    switch (r) {
      case "student":
        return "Pantau lamaranmu dan temukan magang impianmu";
      case "company":
        return "Kelola pemagang dan lowongan perusahaanmu";
      case "school":
        return "Monitor perkembangan dan penempatan siswa/mahasiswa";
      case "super_admin":
        return "Pantau statistik dan performa platform secara keseluruhan";
      default:
        return "Selamat datang di Prakerin ID";
    }
  };

  return (
    <main className="p-6 relative">
      {/* Welcome Section */}
      {!isLoading && (
        <>
          <div className="bg-gradient-to-r from-accent to-accent-light rounded-2xl p-6 text-white mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              {profile.photo_profile ? (
                <div className="w-14 h-14 relative rounded-full border-2 border-white/50 flex-shrink-0 overflow-hidden shadow-md">
                  <Image
                    src={`${BASE_URL}/storage/photo-profile/${profile.photo_profile}`}
                    alt="Photo Profile"
                    fill
                    sizes="100%"
                    className="object-cover"
                  />
                </div>
              ) : (
                <UserCircle className="w-14 h-14 text-white/80 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-white/75 font-medium">{getGreeting()}</p>
                <h1 className="text-xl font-bold truncate">
                  {profile.name ? profile.name : profile?.username}
                </h1>
                <p className="text-xs text-white/60 mt-0.5">{getRoleSubtitle(role)}</p>
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
