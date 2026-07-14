"use client";
import PembimbingManager from "@/components/Pembimbing/PembimbingManager";

const PembimbingPerusahaanPage = () => {
  return (
    <PembimbingManager
      roleFilter="company"
      title="Pembimbing Perusahaan"
      eyebrow="Manajemen Pembimbing Perusahaan"
    />
  );
};

export default PembimbingPerusahaanPage;