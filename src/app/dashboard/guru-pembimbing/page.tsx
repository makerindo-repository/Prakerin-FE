"use client";
import PembimbingManager from "@/components/Pembimbing/PembimbingManager";

const GuruPembimbingPage = () => {
  return (
    <PembimbingManager
      roleFilter="school"
      title="Pembimbing"
      eyebrow="Manajemen Pembimbing"
    />
  );
};

export default GuruPembimbingPage;