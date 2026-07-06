"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import {
  Shield,
  GraduationCap,
  Briefcase,
  Building,
  User,
  UsersRound,
  Search,
  CheckSquare,
  Square,
  Loader2,
  Lock,
  Unlock,
  AlertCircle,
  FolderLock,
  FileCheck2,
} from "lucide-react";
import { alertConfirm } from "@/libs/alert";

interface RoleData {
  id: string | number;
  name: string;
  permissions: string[];
}

// Group permissions by resource category for better UI organization
const PERMISSION_GROUPS: Record<string, { label: string; permissions: string[] }> = {
  vacancies: {
    label: "Lowongan & Lamaran (Job Openings & Applicants)",
    permissions: ["view-lowongan", "create-lowongan", "edit-lowongan", "delete-lowongan", "apply-lowongan", "view-applicants"],
  },
  tasks: {
    label: "CV & Daftar Tugas (CV & Tasks)",
    permissions: ["manage-cv", "view-tasklist", "submit-task", "manage-tasklist"],
  },
  feedback: {
    label: "Ulasan & Sertifikat (Feedback & Certificates)",
    permissions: ["view-feedback", "create-feedback", "view-sertifikat", "create-sertifikat"],
  },
  school: {
    label: "Sekolah & Penempatan (School & Placement)",
    permissions: ["view-students", "manage-placement", "view-companies", "manage-mou"],
  },
  system: {
    label: "Sistem & Master Data (System & Master Data)",
    permissions: ["manage-master-data", "manage-users", "edit-page-content"],
  },
};

// Help map friendly role names and icons
const ROLE_CONFIG: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  super_admin: { label: "Super Admin", icon: Shield, color: "text-red-500 bg-red-50 border-red-200" },
  siswa: { label: "Siswa Magang", icon: GraduationCap, color: "text-blue-500 bg-blue-50 border-blue-200" },
  mahasiswa: { label: "Mahasiswa Magang", icon: GraduationCap, color: "text-indigo-500 bg-indigo-50 border-indigo-200" },
  company_owner: { label: "Pemilik Perusahaan", icon: Building, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
  company_admin: { label: "Admin Perusahaan", icon: Briefcase, color: "text-teal-500 bg-teal-50 border-teal-200" },
  school_admin: { label: "Admin Sekolah", icon: UsersRound, color: "text-amber-500 bg-amber-50 border-amber-200" },
  university_admin: { label: "Admin Universitas", icon: UsersRound, color: "text-orange-500 bg-orange-50 border-orange-200" },
};

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingPermission, setSyncingPermission] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles and all permissions
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      
      const rolesRes = await createApiCall({
        url: ENDPOINTS.ROLES,
        headers,
      });

      const permissionsRes = await createApiCall({
        url: `${ENDPOINTS.ROLES}/permissions`,
        headers,
      });

      const rolesList = rolesRes?.data || [];
      const permsList = permissionsRes?.data || [];

      setRoles(rolesList);
      setAllPermissions(permsList);

      if (rolesList.length > 0) {
        // Set first role as default selection
        setSelectedRoleName(rolesList[0].name);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memuat data roles & permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Currently selected role data
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.name === selectedRoleName);
  }, [roles, selectedRoleName]);

  // Handle permission toggle for the selected role
  const handleTogglePermission = async (permissionName: string, isAssigned: boolean) => {
    if (!selectedRole || selectedRoleName === "super_admin") return;

    setSyncingPermission(permissionName);
    try {
      const currentRolePermissions = selectedRole.permissions;
      let newPermissions: string[];

      if (isAssigned) {
        // Remove permission
        newPermissions = currentRolePermissions.filter((p) => p !== permissionName);
      } else {
        // Add permission
        newPermissions = [...currentRolePermissions, permissionName];
      }

      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      await createApiCall({
        url: `${ENDPOINTS.ROLES}/${selectedRoleName}/permissions`,
        method: "post",
        headers,
        data: { permissions: newPermissions },
      });

      // Update state locally
      setRoles((prevRoles) =>
        prevRoles.map((r) =>
          r.name === selectedRoleName ? { ...r, permissions: newPermissions } : r
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Gagal memperbarui permission.");
    } finally {
      setSyncingPermission(null);
    }
  };

  // Select all or deselect all permissions for a role
  const handleBulkPermission = async (action: "grant_all" | "revoke_all") => {
    if (!selectedRole || selectedRoleName === "super_admin") return;

    const confirmMsg =
      action === "grant_all"
        ? `Apakah Anda yakin ingin memberikan SEMUA permission untuk role ${selectedRoleName}?`
        : `Apakah Anda yakin ingin mencabut SEMUA permission untuk role ${selectedRoleName}?`;

    const isConfirmed = await alertConfirm(confirmMsg);
    if (!isConfirmed) return;

    setBulkUpdating(true);
    try {
      const newPermissions = action === "grant_all" ? allPermissions : [];
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      
      await createApiCall({
        url: `${ENDPOINTS.ROLES}/${selectedRoleName}/permissions`,
        method: "post",
        headers,
        data: { permissions: newPermissions },
      });

      // Update state locally
      setRoles((prevRoles) =>
        prevRoles.map((r) =>
          r.name === selectedRoleName ? { ...r, permissions: newPermissions } : r
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Gagal memperbarui bulk permissions.");
    } finally {
      setBulkUpdating(false);
    }
  };

  // Filter permissions based on search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery) return allPermissions;
    return allPermissions.filter((p) =>
      p.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPermissions, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Memuat Roles & Permissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-800 mb-1">Terjadi Kesalahan</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-accent-dark flex items-center gap-2">
            <Shield className="w-7 h-7 text-accent" />
            Pengaturan Role & Hak Akses
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola fitur dan aksesibilitas halaman untuk setiap kelompok pengguna secara dinamis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Roles List Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Daftar Kelompok Role
            </h2>
            <div className="flex flex-col gap-2">
              {roles.map((role) => {
                const config = ROLE_CONFIG[role.name] || {
                  label: role.name,
                  icon: User,
                  color: "text-gray-500 bg-gray-50 border-gray-200",
                };
                const Icon = config.icon;
                const isSelected = selectedRoleName === role.name;

                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleName(role.name)}
                    className={`flex items-center w-full px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent text-white border-accent shadow-md translate-x-1"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg mr-3 transition-colors ${
                        isSelected ? "bg-white/20 text-white" : config.color.split(" ")[0]
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{config.label}</p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected ? "text-white/80" : "text-gray-400"
                        }`}
                      >
                        {role.name === "super_admin"
                          ? "Bypass Akses Penuh"
                          : `${role.permissions.length} Hak Akses Aktif`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Permissions Checker Board */}
        <div className="lg:col-span-8">
          {selectedRole && (
            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              {/* Header checker board */}
              <div className="bg-accent-dark/5 p-6 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${ROLE_CONFIG[selectedRole.name]?.color}`}>
                    {React.createElement(ROLE_CONFIG[selectedRole.name]?.icon || Shield, {
                      className: "w-6 h-6",
                    })}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      Hak Akses: {ROLE_CONFIG[selectedRole.name]?.label || selectedRole.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Rincian fitur yang diizinkan untuk {ROLE_CONFIG[selectedRole.name]?.label}
                    </p>
                  </div>
                </div>

                {/* Bulk Actions (hanya jika bukan super_admin) */}
                {selectedRoleName !== "super_admin" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkPermission("grant_all")}
                      disabled={bulkUpdating}
                      className="px-3 py-1.5 border border-accent text-accent hover:bg-accent/5 disabled:opacity-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <button
                      onClick={() => handleBulkPermission("revoke_all")}
                      disabled={bulkUpdating}
                      className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                  </div>
                )}
              </div>

              {/* Warnings / Notices */}
              {selectedRoleName === "super_admin" ? (
                <div className="m-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Super Admin Bypass Aktif</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Role Super Admin memiliki bypass hak akses penuh di tingkat sistem (Gate). 
                      Semua permission akan otomatis bernilai aktif untuk Super Admin terlepas dari pilihan di bawah ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mx-6 mt-6 mb-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2.5 text-blue-700 text-xs">
                  <FolderLock className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Modifikasi permission di bawah ini akan langsung mengubah hak akses user secara real-time.</span>
                </div>
              )}

              {/* Search Permissions */}
              <div className="px-6 py-3 border-b border-gray-100 flex items-center bg-gray-50/50">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Cari hak akses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none border-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Checker Content */}
              {bulkUpdating ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  <p className="text-sm font-medium animate-pulse">Menyinkronkan permission...</p>
                </div>
              ) : (
                <div className="flex-grow p-6 space-y-6 overflow-y-auto max-h-[600px]">
                  {searchQuery ? (
                    // Flat searched view
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredPermissions.length > 0 ? (
                        filteredPermissions.map((perm) => (
                          <PermissionCheckbox
                            key={perm}
                            permission={perm}
                            isSelected={selectedRole.permissions.includes(perm) || selectedRoleName === "super_admin"}
                            isDisabled={selectedRoleName === "super_admin"}
                            isSyncing={syncingPermission === perm}
                            onToggle={() =>
                              handleTogglePermission(
                                perm,
                                selectedRole.permissions.includes(perm)
                              )
                            }
                          />
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
                          Tidak menemukan permission dengan kata kunci "{searchQuery}"
                        </div>
                      )}
                    </div>
                  ) : (
                    // Grouped view
                    Object.entries(PERMISSION_GROUPS).map(([key, group]) => {
                      // Only show group if it has permissions mapped to the seeded ones
                      const availableInGroup = group.permissions.filter((p) =>
                        allPermissions.includes(p)
                      );

                      if (availableInGroup.length === 0) return null;

                      return (
                        <div key={key} className="space-y-3 bg-gray-50/30 p-4 rounded-xl border border-gray-100">
                          <h4 className="font-bold text-accent-dark text-sm flex items-center gap-2 border-b border-gray-200 pb-2">
                            <FileCheck2 className="w-4 h-4 text-accent" />
                            {group.label}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {availableInGroup.map((perm) => (
                              <PermissionCheckbox
                                key={perm}
                                permission={perm}
                                isSelected={selectedRole.permissions.includes(perm) || selectedRoleName === "super_admin"}
                                isDisabled={selectedRoleName === "super_admin"}
                                isSyncing={syncingPermission === perm}
                                onToggle={() =>
                                  handleTogglePermission(
                                    perm,
                                    selectedRole.permissions.includes(perm)
                                  )
                                }
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CheckboxProps {
  permission: string;
  isSelected: boolean;
  isDisabled: boolean;
  isSyncing: boolean;
  onToggle: () => void;
}

function PermissionCheckbox({ permission, isSelected, isDisabled, isSyncing, onToggle }: CheckboxProps) {
  return (
    <button
      onClick={() => !isDisabled && !isSyncing && onToggle()}
      disabled={isDisabled || isSyncing}
      className={`flex items-center text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "bg-accent/5 border-accent/20 text-accent-dark font-medium"
          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
      } ${isDisabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
    >
      <div className="mr-3">
        {isSyncing ? (
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        ) : isSelected ? (
          <CheckSquare className="w-4 h-4 text-accent shrink-0" />
        ) : (
          <Square className="w-4 h-4 text-gray-300 shrink-0" />
        )}
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="text-xs break-all tracking-wide select-none">{permission}</span>
        {isDisabled && isSelected && (
          <span title="Locked">
            <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1.5" />
          </span>
        )}
      </div>
    </button>
  );
}
