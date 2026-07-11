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
    template: "%s | PRAKERIN.ID",
    default: "PRAKERIN.ID — Platform Magang No. 1 di Indonesia",
  },
  description:
    "Platform magang terpercaya yang menghubungkan talenta muda dengan perusahaan berkualitas di seluruh Indonesia. Mulai karier Anda dengan pengalaman magang yang berharga.",
  keywords: [
    "magang",
    "prakerin",
    "internship",
    "praktik kerja lapangan",
    "lowongan magang",
    "magang indonesia",
    "magang smk",
    "magang mahasiswa",
  ],
  authors: [{ name: "Makerindo Prima Solusi" }],
  creator: "Makerindo Prima Solusi",
  publisher: "PRAKERIN.ID",
  icons: { icon: "/prakerin.ico" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://prakerin.id",
    title: "PRAKERIN.ID — Platform Magang No. 1 di Indonesia",
    description:
      "Raih pengalaman nyata dan bangun karier impianmu bersama ribuan mitra industri terpercaya.",
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
