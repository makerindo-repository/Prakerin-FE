import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prakerin.id"),
  title: {
    default: "PRAKERIN.ID — Platform Magang Terpercaya di Indonesia",
    template: "%s | PRAKERIN.ID",
  },
  description:
    "PRAKERIN.ID menghubungkan siswa, mahasiswa, sekolah, universitas, dan perusahaan dalam satu ekosistem magang yang terverifikasi, transparan, dan terpercaya.",
  keywords: [
    "magang",
    "prakerin",
    "lowongan magang",
    "internship",
    "siswa",
    "mahasiswa",
    "SMK",
    "perusahaan",
  ],
  icons: { icon: "/prakerin.ico" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "PRAKERIN.ID — Platform Magang Terpercaya di Indonesia",
    description:
      "Raih pengalaman nyata dan bangun karier impianmu bersama ribuan mitra industri terpercaya.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id-ID" className={poppins.variable}>
      <head>
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
      </head>
      <body className="font-poppins! antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
