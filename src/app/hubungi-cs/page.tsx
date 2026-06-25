import { Construction } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
          <Construction className="w-10 h-10 text-accent" />
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Halaman Sedang Dalam Pengembangan
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Fitur ini sedang kami siapkan untuk memberikan pengalaman yang lebih
          baik. Silakan kembali lagi dalam waktu dekat.
        </p>

        <a
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}