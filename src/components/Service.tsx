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
        className="flex items-center space-x-2 p-3 px-4 md:px-5 bg-green-400 shadow-xl text-white rounded-full pointer-events-auto cursor-pointer hover:bg-green-500 transition-colors duration-300"
      >
        <img src="/icons/WhatsApp.svg" alt="whatsapp" className="w-6 h-6" />
        <span className="font-bold">WhatsApp</span>
      </button>
    </div>
  );
}
