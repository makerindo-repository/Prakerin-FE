// app/lowongan/page.tsx
"use client";

import { Suspense } from "react";
import InternshipPage from "./lowonganClient";

export const dynamic = "force-dynamic"; // <- optional, biar gak dipaksa SSG

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InternshipPage />
    </Suspense>
  );
}
