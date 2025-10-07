"use client";
import emailJs from "emailjs-com";
import { Facebook, Instagram, Mail, MapPin, Share } from "lucide-react";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { FaInstagram } from "react-icons/fa";

interface contactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactPage({ homepages }: { homepages?: any }) {
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaRef.current) return;

    // Jalankan reCAPTCHA invisible
    const token = await recaptchaRef.current.executeAsync();
    if (!token) {
      recaptchaRef.current.reset();
      alert("Please complete the reCAPTCHA.");
      return;
    }

    if (!formRef.current) return;

    emailJs
      .sendForm(
        "service_t598gze",
        "template_w76bqwl",
        formRef.current,
        "Q_nxvshDO3z0nsyVg"
      )
      .then(() => {
        alert("Pesan berhasil dikirim!");
        formRef.current?.reset();
      })
      .catch((err) => {
        console.error(err);
        alert("Gagal mengirim pesan.");
      });
  };
  return (
    <section id="contact" className="py-16 ">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
            {homepages?.["title-landing-7"] ?? "-"}
          </h2>
          <p className="text-gray-600 mb-5">
            {homepages?.["subtitle-landing-7"] ?? "-"}
          </p>
          <div className="w-[170px] h-0 border-2 border-accent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Info Kontak */}
          <div className="space-y-9">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-prakerin" />
                Lokasi
              </h3>
              <p className="text-gray-600 text-sm">
                Jl. Dago Giri No. 4, Jababeka
                <br />
                Kp. Benteng, Padaleunyi, Kabupaten Bandung Barat
                <br />
                Jawa Barat 40552
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-prakerin" />
                Kontak Kami
              </h3>
              <p className="text-gray-600 text-sm">
                cs@prakerin.id
                <br />
                +62 8564885888
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Share className="w-5 h-5 mr-2 text-prakerin" />
                Media Sosial
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Form Kontak */}
          <div className="bg-white md:col-span-2 rounded-2xl p-8 shadow-lg flex flex-col justify-between">
            <form className="space-y-6" ref={formRef} onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prakerin focus:border-transparent transition-all duration-300"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prakerin focus:border-transparent transition-all duration-300"
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan
                </label>
                <textarea
                  name="message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-prakerin focus:border-transparent transition-all duration-300"
                  placeholder="Tulis pesan Anda di sini..."
                  rows={3}
                ></textarea>
              </div>
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY as string}
                size="invisible"
                ref={recaptchaRef}
              />
              <button
                type="submit"
                className="w-full bg-prakerin bg-accent text-white py-3 rounded-lg font-medium hover:bg-prakerin-dark transition-all duration-300 transform hover:scale-105"
              >
                Kirim Pesan
              </button>
            </form>
          </div>

          {/* Map */}
          <div className="bg-white md:col-span-3 rounded-2xl p-4 shadow-lg flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.52204155400318!2d107.65891012411763!3d-6.9676570406016225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e9465bf21013%3A0x52be50500715e36c!2sPT.%20Makerindo%20Prima%20Solusi!5e0!3m2!1sid!2sid!4v1752132302971!5m2!1sid!2sid"
              className="w-full h-60 md:h-72 rounded-2xl border-0"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
