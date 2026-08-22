"use client";

// global-error.tsx catches errors thrown inside the root layout itself.
// It MUST include its own <html> and <body> tags since the layout is broken.
// Keep this file minimal — no imports from your layout or shared components.

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfeff 100%)",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          {/* Logo */}
          <img
            src="/Logo Prakerin ID Text (2).svg"
            alt="Prakerin.ID"
            style={{ height: 32, margin: "0 auto 24px", opacity: 0.8, display: "block" }}
          />

          {/* Icon circle */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#fffbeb",
              border: "4px solid #fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 36,
            }}
          >
            🔧
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>
            Sedang dalam Pemeliharaan
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 28 }}>
            Kami sedang melakukan pembaruan sistem. Halaman akan segera kembali
            normal — coba muat ulang dalam beberapa detik.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                background: "#0891b2",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🔄 Coba Lagi
            </button>
            <a
              href="/"
              style={{
                padding: "10px 24px",
                background: "#fff",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🏠 Ke Beranda
            </a>
          </div>

          <p style={{ marginTop: 24, fontSize: 12, color: "#9ca3af" }}>
            Jika masalah berlanjut,{" "}
            <a href="/hubungi-kami" style={{ color: "#0891b2" }}>
              hubungi kami
            </a>
            .
          </p>
        </div>
      </body>
    </html>
  );
}
