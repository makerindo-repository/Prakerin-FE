import { MessageSquare } from "lucide-react";

export default function ServiceButton() {
  const handleClick = () => {
    window.open(
      "https://api.whatsapp.com/send?phone=6281546865286&text=Halo%20PrakerinID%2C%20saya%20ingin%20bertanya%20tentang%20layanan%20yang%20tersedia.",
      "_blank"
    );
  };
  return (
    <div className="fixed bottom-5 right-5 md:bottom-6 md:right-8 z-40 flex justify-end pointer-events-none">
      <button
        onClick={handleClick}
        className="flex items-center justify-center p-4 bg-accent shadow-2xl text-white rounded-full pointer-events-auto cursor-pointer hover:bg-accent-hover transition-transform duration-300 hover:scale-105"
        aria-label="Chat via WhatsApp"
      >
        <MessageSquare className="w-7 h-7" />
      </button>
    </div>
  );
}
