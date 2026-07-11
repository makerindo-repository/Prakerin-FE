"use client";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Share,
  Linkedin,
} from "lucide-react";
import { useRef, useState } from "react";
// import ReCAPTCHA from "react-google-recaptcha"; // CAPTCHA disabled for local dev

interface contactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactPage({ homepages }: { homepages?: any }) {
  const formRef = useRef<HTMLFormElement>(null);
  // const recaptchaRef = useRef<ReCAPTCHA>(null); // CAPTCHA disabled for local dev

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const message = (formData.get("message") as string) || "";

    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Harap lengkapi semua bidang yang wajib diisi!");
      return;
    }

    // TODO: Implement actual contact form submission API
    // For now, just show success message
    alert("Pesan berhasil dikirim!");
    formRef.current?.reset();
  };
  return (
    <section id="hubungi-kami" className="py-16 mx-auto w-[85%]">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 md:grid-cols-10 gap-6 items-start">
          {/* Subtitle - left */}
          <div className="md:col-span-7">
            <p className="text-gray-600 text-lg leading-relaxed">
              {homepages?.["subtitle-landing-7"] ?? "-"}
            </p>
          </div>

          {/* Title - right */}
          <div className="md:col-span-3 flex flex-col items-end">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent mb-4 text-right">
              {homepages?.["title-landing-7"] ?? "-"}
            </h2>
            <div className="w-[320px] border-t-4 border-accent"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Form Kontak */}
          <div className="md:col-span-5 flex flex-col justify-between h-full">
            <form className="space-y-6" ref={formRef} onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prakerin focus:border-transparent transition-all duration-300"
                  placeholder="Nama"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prakerin focus:border-transparent transition-all duration-300"
                  placeholder="Email"
                  required
                />
              </div>
              <div>
                <textarea
                  name="message"
                  className="w-full h-36 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prakerin focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Pesan..."
                  rows={3}
                  required
                ></textarea>
              </div>
              {/* <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY as string}
                size="invisible"
                ref={recaptchaRef}
              /> */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent to-accent-light text-white py-3 rounded-lg font-medium hover:bg-prakerin-dark transition-all duration-300 transform hover:scale-105"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
          
          {/* Info Kontak */}
          <div className="space-y-4 md:col-span-7">
            <div className="bg-white rounded-2xl p-4 hover-lift border border-gray-500">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-prakerin text-accent" />
                Lokasi
              </h3>
              <p className="text-gray-600 text-sm">
                Komplek Pesona Ciganitri Blok A39
                <br />
                Cipagalo, Kec. Bojongsoang, Kabupaten Bandung, Jawa Barat
                <br />
                Jawa Barat 40287
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 hover-lift border border-gray-500">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-prakerin text-accent" />
                Kontak Kami
              </h3>
              <p className="text-gray-600 text-sm">
                idprakerin@gmail.com
                <br />
                +62 815-4686-5286
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 hover-lift border border-gray-500">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Share className="w-5 h-5 mr-2 text-prakerin text-accent" />
                Media Sosial
              </h3>
              <div className="flex space-x-4">
                <a
                  href="www.linkedin.com/in/prakerin-id-933549389"
                  target="_blank"
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/officialprakerin.id?igsh=Z3d3eTF3cWQ0MDBz"
                  target="_blank"
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Map
          <div className="bg-white md:col-span-3 rounded-2xl p-4 shadow-lg flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.52204155400318!2d107.65891012411763!3d-6.9676570406016225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e9465bf21013%3A0x52be50500715e36c!2sPT.%20Makerindo%20Prima%20Solusi!5e0!3m2!1sid!2sid!4v1752132302971!5m2!1sid!2sid"
              className="w-full h-60 md:h-72 rounded-2xl border-0"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div> */}
        </div>
      </div>
    </section>
  );
}
