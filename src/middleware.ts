import { NextRequest, NextResponse } from "next/server";

// Escape karakter regex selain '*'
const escapeRegex = (str: string) =>
  str.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");

// Cocokkan path dengan pola wildcard (*)
const matchPath = (path: string, patterns: string[]) => {
  return patterns.some((pattern) => {
    const regex = new RegExp(
      "^" + pattern.split("*").map(escapeRegex).join(".*") + "$"
    );
    return regex.test(path);
  });
};

// Allow-list per role (gunakan '*' untuk wildcard)
const accessMap: Record<string, string[]> = {
  super_admin: [
    "/dashboard*",
    "/dashboard/isi-halaman",
    "/dashboard/perusahaan",
    "/dashboard/sekolah",
    "/dashboard/penghargaan",
    "/dashboard/penghargaan/*",
    "/dashboard/profile",
    "/dashboard/master-data/*",
  ],
  company: [
    "/dashboard*",
    "/dashboard/siswa-magang*",
    "/dashboard/tasklist*",
    "/dashboard/industry/*",
    "/dashboard/lowongan/*", // company bisa akses fitur lowongan (buat, edit, dll)
    "/dashboard/profile",
  ],
  school: ["/dashboard*", "/dashboard/profile"],
  student: [
    "/dashboard",
    "/dashboard/lowongan*", // student bisa lihat lowongan
    "/dashboard/cv*",
    "/dashboard/perusahaan*",
    "/dashboard/tasklist*",
    "/dashboard/feedback",
    "/dashboard/sertifikat*",
    "/dashboard/pembimbing",
    "/dashboard/profile",
  ],
};

// Deny-list per role (cek terlebih dahulu)
const denyMap: Record<string, string[]> = {
  student: ["/dashboard/lowongan/*/ubah", "/dashboard/tasklist/tambah"],
};

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Guest: hanya boleh masuk/daftar
  const token = req.cookies.get("userToken")?.value;
  if (!token) {
    if (path === "/masuk" || path === "/daftar") {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/masuk", req.url));
    }
  }
  if (path === "/masuk" || path === "/daftar") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const role = req.cookies.get("authorization")?.value || "";

  // Cek deny-list dulu
  if (role in denyMap && matchPath(path, denyMap[role])) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Lalu cek allow-list
  if (role in accessMap && matchPath(path, accessMap[role])) {
    return NextResponse.next();
  }

  // Default: tolak ke dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/masuk", "/daftar"],
};
