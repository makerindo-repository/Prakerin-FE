"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RolesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/subscription-tiers");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-6">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Mengarahkan ke Manajemen Subscription Tiers...
      </p>
    </div>
  );
}
