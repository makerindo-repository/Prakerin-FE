"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";

interface PermissionContextType {
  permissions: string[];
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  can: () => false,
  canAny: () => false,
});

export const PermissionProvider = ({
  permissions = [],
  children,
}: {
  permissions?: string[];
  children: ReactNode;
}) => {
  const normalizedPermissions = useMemo(() => permissions || [], [permissions]);

  const can = (permission: string) => {
    return normalizedPermissions.includes(permission);
  };

  const canAny = (perms: string[]) => {
    return perms.some((p) => normalizedPermissions.includes(p));
  };

  return (
    <PermissionContext.Provider
      value={{ permissions: normalizedPermissions, can, canAny }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);
