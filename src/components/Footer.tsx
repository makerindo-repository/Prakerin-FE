"use client";

import { Linkedin, Instagram } from "lucide-react";

export default function FooterPage() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-prakerin rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm"></span>
              </div>
              <span className="text-xl font-bold">PRAKERIN.ID</span>
            </div>
            <p className="text-gray-400 mb-4">
              Platform terpercaya untuk menghubungkan talenta muda dengan
              perusahaan berkualitas.
            </p>
            <div className="flex space-x-4">
              <a
                href="www.linkedin.com/in/prakerin-id-933549389"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin />
              </a>
              <a
                href="https://www.instagram.com/officialprakerin.id?igsh=Z3d3eTF3cWQ0MDBz"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Layanan</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cari Magang
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Daftar Perusahaan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Konsultasi Karier
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sertifikat Magang
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Karier
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Press Release
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Dukungan</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/hubungi-kami"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Hubungi Kami
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Syarat & Ketentuan
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2026 Prakerin.ID. Semua hak dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
