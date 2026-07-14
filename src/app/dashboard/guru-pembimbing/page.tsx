"use client";
import PembimbingManager from "@/components/Pembimbing/PembimbingManager";

const GuruPembimbingPage = () => {
  return (
    <PembimbingManager
      roleFilter="school"
      title="Guru Pembimbing"
      eyebrow="Manajemen Guru Pembimbing"
    />
  );
};

export default GuruPembimbingPage;