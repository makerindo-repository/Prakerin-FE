import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrakerinID",
  description: "Magang mudah dan nyaman",
  icons: {
    icon: "/prakerin.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PrakerinID",
    description: "Magang mudah dan nyaman",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id-ID">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
      </head>
      <body className="font-poppins! antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
