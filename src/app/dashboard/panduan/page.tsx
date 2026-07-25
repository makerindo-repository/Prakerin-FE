"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

import Cookies from "js-cookie";

export default function DashboardPanduanRedirect() {
  const router = useRouter();

  useEffect(() => {
    const role = Cookies.get("authorization") || "student";
    if (role === "company") {
      router.replace("/dashboard/panduan/company");
    } else if (role === "school") {
      router.replace("/dashboard/panduan/school");
    } else {
      router.replace("/dashboard/panduan/student");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader />
    </div>
  );
}
