"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { Menu, X, ChevronDown, LayoutDashboard, Building2, School, GraduationCap } from "lucide-react";

interface NavigationProps {
  section?: string;
  setSection?: Dispatch<SetStateAction<string>>;
}

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/tentang-kami" },
  { label: "Lowongan", href: "/lowongan" },
  { label: "Kontak", href: "/tentang-kami#hubungi-kami" },
];

export default function Navigation({}: NavigationProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!Cookies.get("userToken"));
  }, []);

  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      if (pathName === "/tentang-kami") {
        const contactSection = document.getElementById("hubungi-kami");
        if (contactSection) {
          const rect = contactSection.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            setActiveSection("hubungi-kami");
          } else {
            setActiveSection("tentang");
          }
        }
      } else {
        setActiveSection("");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathName]);

  // Close the mobile drawer on route change.
  useEffect(() => setMobileOpen(false), [pathName]);

  const isActive = (href: string) => {
    if (href === "/") return pathName === "/";
    if (href === "/tentang-kami") {
      return pathName === "/tentang-kami" && activeSection !== "hubungi-kami";
    }
    if (href === "/tentang-kami#hubungi-kami") {
      return pathName === "/tentang-kami" && activeSection === "hubungi-kami";
    }
    return pathName.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white/70 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="PRAKERIN.ID Beranda">
          <img src="/PrakerinID_ico.svg" alt="PRAKERIN.ID" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.slice(0, 3).map((l) => (
            <NavItem key={l.label} href={l.href} active={isActive(l.href)}>
              {l.label}
            </NavItem>
          ))}

          {/* Pendaftaran dropdown */}
          <div className="group relative">
            <button
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                pathName.startsWith("/mitra")
                  ? "bg-[#FDE047] text-gray-900 shadow-sm"
                  : "text-gray-700 hover:bg-accent/5 hover:text-accent"
              }`}
            >
              Mitra
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-0 top-full w-64 translate-y-1 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link href="/mitra?type=company" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-accent/5 hover:text-accent">
                <Building2 className="h-4 w-4 text-gray-400" /> Industri
              </Link>
              <Link href="/mitra?type=school" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-accent/5 hover:text-accent">
                <School className="h-4 w-4 text-gray-400" /> Sekolah
              </Link>
              <Link href="/mitra?type=university" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-accent/5 hover:text-accent">
                <GraduationCap className="h-4 w-4 text-gray-400" /> Perguruan Tinggi
              </Link>
            </div>
          </div>

          {NAV_LINKS.slice(3).map((l) => (
            <NavItem key={l.label} href={l.href} active={isActive(l.href)}>
              {l.label}
            </NavItem>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {!mounted ? (
            <div className="h-9 w-40" />
          ) : isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-light px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/masuk"
                className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-accent hover:text-accent"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-light px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white transition-[max-height] duration-300 md:hidden ${
          mobileOpen ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        <div className="space-y-1 px-4 py-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                isActive(l.href) ? "bg-[#FDE047] text-gray-900" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/mitra?type=company" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Mitra - Industri
          </Link>
          <Link href="/mitra?type=school" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Mitra - Sekolah
          </Link>
          <Link href="/mitra?type=university" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Mitra - Perguruan Tinggi
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {!mounted ? null : isLoggedIn ? (
              <Link href="/dashboard" className="col-span-2 rounded-lg bg-gradient-to-r from-accent to-accent-light px-4 py-2.5 text-center text-sm font-semibold text-white">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/masuk" className="rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700">
                  Masuk
                </Link>
                <Link href="/daftar" className="rounded-lg bg-gradient-to-r from-accent to-accent-light px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
        active ? "bg-[#FDE047] text-gray-900 shadow-sm" : "text-gray-700 hover:bg-accent/5 hover:text-accent"
      }`}
    >
      {children}
    </Link>
  );
}
