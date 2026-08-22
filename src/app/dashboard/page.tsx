"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { UserCircle, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import Link from "next/link";
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
  is_profile_complete?: boolean;
  missing_fields?: string[];
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
        const isUniSchool = data.school?.type === "university";
        const isUniStudent = data.student?.school?.type === "university";
        const roleMap: Record<string, string> = {
          student: isUniStudent ? "Mahasiswa" : "Siswa",
          company: "Perusahaan",
          school: isUniSchool ? "Perguruan Tinggi" : "Sekolah",
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
        
        const detectedSchoolType = data.school?.type ?? data.student?.school?.type ?? null;
        if (detectedSchoolType) {
          Cookies.set("school_type", detectedSchoolType, { expires: 30, path: "/" });
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

          {/* Alert Wajib Melengkapi Data Diri */}
          {profile.is_profile_complete === false && (
            <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-base">
                    Perhatian: Wajib Melengkapi Data Diri!
                  </h3>
                  <p className="text-sm text-amber-800 mt-1">
                    {profile.role === "Perusahaan"
                      ? "Akun Anda belum melengkapi profil perusahaan (alamat, kota/kabupaten). Beberapa fungsi mungkin tidak berjalan dengan baik hingga profil Anda dilengkapi."
                      : profile.role === "Perguruan Tinggi" || profile.role === "Mahasiswa"
                      ? "Akun Anda belum melengkapi data diri (perguruan tinggi/kampus, program studi, nomor telepon, alamat). Beberapa fungsi mungkin tidak berjalan dengan baik hingga data Anda dilengkapi."
                      : "Akun Anda belum melengkapi data diri (sekolah/kampus, jurusan, nomor telepon, alamat). Fungsi-fungsi semestinya seperti pembuatan CV dan pendaftaran magang tidak akan dapat berfungsi hingga data diri Anda dilengkapi."}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/profile"
                className="whitespace-nowrap px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm self-stretch md:self-auto text-center"
              >
                Lengkapi Data Diri
              </Link>
            </div>
          )}
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
          <SchoolDashboard
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            schoolType={profile.school?.type || (Cookies.get("school_type") as "school" | "university") || "school"}
          />
        )}
        {role === "super_admin" && (
          <AdminDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
        )}
      </Suspense>
    </main>
  );
};

export default Dashboard;