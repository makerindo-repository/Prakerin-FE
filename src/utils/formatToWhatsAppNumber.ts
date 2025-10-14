export function formatToWhatsAppNumber(phone: string): string {
  if (!phone) return "";

  // Hapus semua karakter selain angka dan tanda +
  let cleaned = phone.trim().replace(/[^0-9+]/g, "");

  // Kalau diawali dengan +62, ubah jadi 62
  if (cleaned.startsWith("+62")) {
    cleaned = cleaned.replace("+62", "62");
  }
  // Kalau diawali dengan 0, ubah jadi 62
  else if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  // Kalau belum diawali 62 sama sekali, tambahkan 62 di depan
  else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}