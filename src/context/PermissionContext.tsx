"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";

interface PermissionContextType {
  permissions: string[];
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  can: () => false,
  canAny: () => false,
  canAll: () => false,
});

/**
 * PermissionProvider — reads permissions from Zustand (populated after login).
 * Optionally accepts a `permissions` prop override (for SSR/testing).
 */
export const PermissionProvider = ({
  permissions: propPermissions,
  children,
}: {
  permissions?: string[];
  children: ReactNode;
}) => {
  const storePermissions = useAuthStore((s) => s.permissions);
  const storeRole = useAuthStore((s) => s.role);

  const permissions = useMemo(
    () => propPermissions ?? storePermissions,
    [propPermissions, storePermissions]
  );

  const can = (permission: string) => {
    if (storeRole === "super_admin") return true;
    return permissions.includes(permission);
  };
  const canAny = (perms: string[]) => {
    if (storeRole === "super_admin") return true;
    return perms.some((p) => permissions.includes(p));
  };
  const canAll = (perms: string[]) => {
    if (storeRole === "super_admin") return true;
    return perms.every((p) => permissions.includes(p));
  };

  return (
    <PermissionContext.Provider value={{ permissions, can, canAny, canAll }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);