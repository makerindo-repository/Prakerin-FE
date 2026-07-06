"use client";

import React from "react";
import { usePermission } from "@/context/PermissionContext";

interface CanProps {
  perform: string | string[];
  yes: React.ReactNode;
  no?: React.ReactNode;
}

export const Can = ({ perform, yes, no = null }: CanProps) => {
  const { can, canAny } = usePermission();

  if (Array.isArray(perform)) {
    return canAny(perform) ? <>{yes}</> : <>{no}</>;
  }

  return can(perform) ? <>{yes}</> : <>{no}</>;
};

export default Can;
