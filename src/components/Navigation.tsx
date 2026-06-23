"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { Menu } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

interface NavigationProps {
  section: string;
  setSection: Dispatch<SetStateAction<string>>;
}

export default function Navigation({ setSection }: NavigationProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentHash, setCurrentHash] = useState("");
  const pathName = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Jalankan hanya di client setelah mount
    setMounted(true);
    const token = Cookies.get("userToken");
    setIsLoggedIn(!!token);
  }, []);


  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== "undefined") {
        setCurrentHash(window.location.hash);
      }
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isBerandaActive = pathName === "/" && currentHash === "";
  const isMitraActive = pathName === "/" && currentHash === "#mitra-sekolah";

  const handleBerandaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
    setCurrentHash("");
  };

  const handleMitraClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/#mitra-sekolah");
    setCurrentHash("#mitra-sekolah");
  };

  const handleOtherNavClick = () => setCurrentHash("");

  return (
    <nav className="w-[85%] mx-auto bg-white mt-10 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <img
                src="/PrakerinID_ico.svg"
                className="cursor-pointer"
                alt=""
              />
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 ml-auto mr-8">
            <Link
              href="/"
              onClick={handleBerandaClick}
              className={`font-semibold hover:text-accent transition-colors duration-300 ${
                isBerandaActive ? "text-accent" : "text-gray-700"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/lowongan"
              onClick={handleOtherNavClick}
              className={`font-semibold hover:text-accent transition-colors duration-300 ${
                pathName === "/lowongan" || pathName.startsWith("/lowongan/")
                  ? "text-accent"
                  : "text-gray-700"
              }`}
            >
              Lowongan
            </Link>
            <Link
              href="/mitra"
              onClick={handleOtherNavClick}
              className={`font-semibold hover:text-accent transition-colors duration-300 ${
                pathName === "/mitra" || pathName.startsWith("/mitra/")
                  ? "text-accent"
                  : "text-gray-700"
              }`}
            >
              Mitra
            </Link>
            <Link
              href="/tentang-kami"
              onClick={handleOtherNavClick}
              className={`font-semibold hover:text-accent transition-colors duration-300 ${
                pathName === "/tentang-kami" ? "text-accent" : "text-gray-700"
              }`}
            >
              Tentang Kami
            </Link>
          </div>

          <div className="hidden md:flex space-x-4 items-center">
            {/* Tambahan: Toggle untuk versi Desktop */}
            <DarkModeToggle />
            {!mounted ? null : isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 font-semibold bg-gradient-to-r from-accent to-accent-light text-white rounded-lg hover:from-accent-light hover:to-accent-light duration-300 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/masuk"
                  className="px-8 py-2 font-semibold bg-gradient-to-r from-accent to-accent-light text-white rounded-lg hover:from-accent-light hover:to-accent-light duration-300 transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Tambahan: Toggle untuk versi Mobile */}
          <div className="flex items-center space-x-2 md:hidden">
            <DarkModeToggle />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center p-2 text-gray-700 hover:text-accent transition-colors duration-300"
            onClick={() => {
              const mobileMenu = document.getElementById("mobile-menu");
              if (mobileMenu) {
                mobileMenu.classList.toggle("hidden");
              }
            }}
          >
            <Menu />
          </button>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" className="md:hidden hidden mt-4 space-y-2">
          <Link
            href="/"
            onClick={handleBerandaClick}
            className={`block py-2 hover:text-prakerin transition-colors duration-300 ${
              isBerandaActive ? "text-accent" : "text-gray-700"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/tentang-kami"
            onClick={handleOtherNavClick}
            className={`block py-2  hover:text-prakerin transition-colors duration-300 ${
              pathName === "/tentang-kami" ? "text-accent" : "text-gray-700"
            }`}
          >
            Tentang Kami
          </Link>
          <Link
            href="/lowongan"
            onClick={handleOtherNavClick}
            className={`block py-2  hover:text-prakerin transition-colors duration-300 ${
              pathName === "/lowongan" || pathName.startsWith("/lowongan/")
                ? "text-accent"
                : "text-gray-700"
            }`}
          >
            Lowongan
          </Link>
          <Link
            href="/#mitra-sekolah"
            onClick={handleMitraClick}
            className={`block py-2  hover:text-prakerin transition-colors duration-300 ${
              isMitraActive ? "text-accent" : "text-gray-700"
            }`}
          >
            Mitra
          </Link>
          <div className="flex flex-col gap-2 mt-2">
            {!mounted ? null : isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full px-4 py-2 font-semibold bg-gradient-to-r from-accent to-accent-light text-white rounded-lg hover:from-accent-light hover:to-accent-light duration-300 transition-all text-center"
              >
                Dahsboard
              </Link>
            ) : (
              <>
                <Link
                  href="/daftar"
                  className="w-full px-4 py-2 font-semibold border border-accent text-accent rounded-lg hover:bg-accent-light hover:border-accent-light hover:text-white transition-all duration-300 text-center"
                >
                  Daftar
                </Link>
                <Link
                  href="/masuk"
                  className="w-full px-4 py-2 font-semibold bg-gradient-to-r from-accent to-accent-light text-white rounded-lg hover:from-accent-light hover:to-accent-light duration-300 transition-all text-center"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}