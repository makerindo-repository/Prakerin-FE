import { NextRequest, NextResponse } from "next/server";

// Cache compiled regex patterns for better performance
const regexCache = new Map<string, RegExp>();

// Escape karakter regex selain '*'
const escapeRegex = (str: string) =>
  str.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");

// Optimized path matching with caching
const matchPath = (path: string, patterns: string[]) => {
  return patterns.some((pattern) => {
    let regex = regexCache.get(pattern);
    if (!regex) {
      regex = new RegExp(
        "^" + pattern.split("*").map(escapeRegex).join(".*") + "$"
      );
      regexCache.set(pattern, regex);
    }
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
  
  // Early return for static assets and API routes
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/api/') ||
    path.includes('.') ||
    path.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Allow access to homepage and public routes for everyone
  const publicRoutes = ["/", "/masuk", "/daftar", "/tentang-kami", "/hubungi-cs", "/lapor-bug"];
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Optimize cookie access
  const token = req.cookies.get("userToken")?.value;
  const role = req.cookies.get("authorization")?.value || "";
  const activeCookie = req.cookies.get("active")?.value;
  
  // Require authentication only for dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL("/masuk", req.url));
    }
  } else {
    // Allow all other routes for everyone
    return NextResponse.next();
  }

  // Optimize active status check
  const isActive = !!activeCookie && ["true", "1", "yes", "on"].includes(activeCookie.toLowerCase());
  
  // Cache active-required patterns
  const requiresActive = [
    "/dashboard/lowongan*",
    "/dashboard/cv*",
    "/dashboard/tasklist*",
    "/dashboard/feedback*",
    "/dashboard/sertifikat*",
  ];

  // Early return for inactive users on protected routes
  if (!isActive && matchPath(path, requiresActive)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

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
  matcher: [
    "/dashboard/:path*",
    "/masuk",
    "/daftar",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
