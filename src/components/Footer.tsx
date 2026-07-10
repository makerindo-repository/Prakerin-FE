"use client";

import Link from "next/link";
import { Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Layanan",
    links: [
      { label: "Cari Magang", href: "/lowongan" },
      { label: "Daftar Perusahaan", href: "/daftar" },
      { label: "Panduan Magang", href: "/panduan" },
      { label: "Sertifikat Magang", href: "/dashboard/sertifikat" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "/tentang-kami" },
      { label: "Mitra Industri", href: "/mitra?type=company" },
      { label: "Mitra Pendidikan", href: "/mitra?type=education" },
      { label: "Karier", href: "/lowongan" },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Pusat Bantuan", href: "/hubungi-cs" },
      { label: "Hubungi Kami", href: "/hubungi-kami" },
      { label: "Kebijakan Privasi", href: "/tentang-kami" },
      { label: "Syarat & Ketentuan", href: "/tentang-kami" },
    ],
  },
];

export default function FooterPage() {
  return (
    <footer className="bg-accent-dark text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <img src="/PrakerinID_ico.svg" alt="PRAKERIN.ID" className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Platform magang terpercaya yang menghubungkan talenta muda dengan
              perusahaan berkualitas di seluruh Indonesia.
            </p>
            <div className="mt-5 flex gap-3">
              <SocialIcon href="https://www.instagram.com/officialprakerin.id" label="Instagram">
                <Instagram className="h-5 w-5" />
              </SocialIcon>
              <SocialIcon href="https://www.linkedin.com/in/prakerin-id-933549389" label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <Youtube className="h-5 w-5" />
              </SocialIcon>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-400 transition-colors hover:text-accent-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Kontak</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-light" />
                <span>PT. Makerindo Prima Solusi, Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent-light" />
                <a href="tel:+622112345678" className="hover:text-accent-light">(021) 1234 5678</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent-light" />
                <a href="mailto:halo@prakerin.id" className="hover:text-accent-light">halo@prakerin.id</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-gray-400">
            © 2026 PT. Makerindo Prima Solusi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-300 transition-all hover:bg-accent hover:text-white"
    >
      {children}
    </a>
  );
}
