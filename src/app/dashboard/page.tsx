"use client";
import React, { useEffect, useState } from "react";
import {
  Building,
  User,
  MapPin,
  BriefcaseBusiness,
  UserCircle,
} from "lucide-react";
import SiswaDashboard from "@/components/roleComponents/SiswaDashboard";
import IndustryDashboard from "@/components/roleComponents/industryDashboard";
import SchoolDashboard from "@/components/roleComponents/SchoolDashboard";
import Cookies from "js-cookie";
import { API, ENDPOINTS } from "../../../utils/config";
import { getGreeting } from "@/utils/getGreeting";
import Image from "next/image";
import { alertSuccess } from "@/libs/alert";
import Loader from "@/components/loader";
import AdminDashboard from "@/components/roleComponents/adminDashboard";

interface Profile {
  photo_profile?: string | null;
  name: string;
  username?: string;
}

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string>("");
  const [profile, setProfile] = useState<Profile>({
    name: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const response = await API.get(`${ENDPOINTS.USERS}/profile`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      if (response.status === 200) {
        switch (response.data.data.role) {
          case "student":
            response.data.data.role = "Siswa";
            break;
          case "company":
            response.data.data.role = "Perusahaan";
            break;
          case "school":
            response.data.data.role = "Sekolah";
            break;
          case "super_admin":
            response.data.data.role = "Super Admin";
            break;
          default:
            response.data.data.role = "";
        }
        setProfile(response.data.data);
        console.log(response.data.data);
        
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const alertLogin = async () => {
    const loginSuccess = localStorage.getItem("login-success");
    if (loginSuccess) {
      await alertSuccess("Berhasil masuk!");
      localStorage.removeItem("login-success");
    }
  };

  useEffect(() => {
    fetchProfile();
    alertLogin();
    setRole(Cookies.get("authorization") as string);
  }, []);

  return (
    <main className="p-6 relative">
      {/* Welcome Section */}
      {!isLoading && (
        <>
          <h1 className="text-accent-dark mb-5 font-medium">Dashboard</h1>

          <div className="bg-gradient-to-r from-accent-light to-accent rounded-lg p-6 text-white mb-8">
            <div className="flex items-center space-x-4">
              {profile.photo_profile ? (
                <div className="w-16 h-16 relative rounded-full border-white border">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/photo-profile/${profile.photo_profile}`}
                    alt="Photo Profile"
                    fill
                    sizes="100%"
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <UserCircle className="w-16 h-16 text-white" />
              )}
              <div>
                <p className="text-sm opacity-90">{getGreeting()}</p>
                <h1 className="text-xl font-semibold">{profile.name ? profile.name : profile?.username}</h1>
              </div>
            </div>
          </div>
        </>
      )}

      {role && role === "student" && (
        <SiswaDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
      )}
      {role && role === "company" && (
        <IndustryDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
      )}
      {role && role === "school" && (
        <SchoolDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
      )}
      {role && role === "super_admin" && (
        <AdminDashboard isLoading={isLoading} setIsLoading={setIsLoading} />
      )}
    </main>
  );
};

export default Dashboard;
