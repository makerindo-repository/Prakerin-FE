"use client";

import React, { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { can, role, permissions } = usePermission();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Wait for permissions to load from Zustand
    if (role !== null) {
      setIsChecking(false);
    }
  }, [role, permissions]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-gray-500 font-medium">Memeriksa hak akses...</p>
      </div>
    );
  }

  // Super Admin always bypasses checking. Other roles check permission.
  if (role === "super_admin" || can(permission)) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-red-50 border border-red-200 rounded-2xl text-center shadow-lg">
      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-red-800 mb-2">Akses Ditolak</h3>
      <p className="text-red-600 text-sm mb-6">
        Anda tidak memiliki hak akses (<code>{permission}</code>) yang diperlukan untuk membuka halaman ini.
      </p>
      <button
        onClick={() => router.push("/dashboard")}
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-md cursor-pointer"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
}

export default PermissionGuard;
