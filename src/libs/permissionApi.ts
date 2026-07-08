// Permission API helpers
// Calls the backend RBAC endpoints

const getBaseUrl = () => {
  const root = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
  const cleanRoot = root.endsWith("/") ? root.slice(0, -1) : root;
  return cleanRoot.endsWith("/api/v1") ? cleanRoot : cleanRoot + "/api/v1";
};

const BASE_URL = getBaseUrl();

export interface UserPermissionsResponse {
  role: string;
  roles: string[];
  permissions: string[];
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  permissions: string[];
}

/**
 * Fetch the current authenticated user's roles + permissions.
 * Called once after login and stored in Zustand.
 */
export async function getUserPermissions(
  token: string
): Promise<UserPermissionsResponse> {
  const res = await fetch(BASE_URL + "/users/me/permissions", {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch permissions");
  const json = await res.json();
  return json.data as UserPermissionsResponse;
}

/**
 * Get all roles and their current permissions (super_admin only).
 */
export async function getAllRoles(
  token: string
): Promise<RoleWithPermissions[]> {
  const res = await fetch(BASE_URL + "/system/roles", {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch roles");
  const json = await res.json();
  return json.data as RoleWithPermissions[];
}

/**
 * Get all available permission names (super_admin only).
 */
export async function getAllPermissions(token: string): Promise<string[]> {
  const res = await fetch(BASE_URL + "/system/permissions", {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch permissions list");
  const json = await res.json();
  return json.data as string[];
}

/**
 * Sync permissions for a role (super_admin only).
 */
export async function updateRolePermissions(
  token: string,
  roleName: string,
  permissions: string[]
): Promise<void> {
  const res = await fetch(BASE_URL + "/system/roles/" + roleName + "/permissions", {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ permissions }),
  });
  if (!res.ok) throw new Error("Failed to update role permissions");
}
