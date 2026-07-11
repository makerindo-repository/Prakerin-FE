"use client";

import {
  ArrowRight,
  Search,
  ShieldCheck,
  Building2,
  UserCheck,
  Zap,
  School,
  GraduationCap,
  Users,
  UserRound,
  Briefcase,
  Send,
  Activity,
  UserPlus,
  ClipboardList,
  LineChart,
  ChevronDown,
  Code2,
  PenTool,
  Megaphone,
  BarChart3,
  Palette,
  Quote,
  CheckCheck,
  Factory,
  Scale,
  Lock,
  Landmark,
  ListChecks,
  Handshake,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getPhotoProfileUrl, getCommentPhotoUrl } from "@/utils/config";
import { useReveal } from "@/hooks/useReveal";
import { useCountUp } from "@/hooks/useCountUp";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Partner {
  id: string;
  name: string;
  logo: string;
  type: string;
}
interface CommentPrakerin {
  id: string;
  name: string;
  position: string;
  comment: string;
  photo_profile?: string | null;
  created_at?: string;
}
interface LandingStats {
  schools: number;
  universities: number;
  students: number;
  university_students: number;
  total_students: number;
  companies: number;
  partners: number;
  active_jobs: number;
  new_jobs_month: number;
  placement_rate: number;
}
interface Category {
  id: string;
  name: string;
  total: number;
}
interface Option {
  id: string;
  name: string;
}
interface Duration {
  id: string;
  duration_value: number;
  duration_unit: string;
}

interface LandingProps {
  homepages?: Record<string, string>;
  partners?: Partner[];
  commentPrakerins?: CommentPrakerin[];
  jobOpenings?: unknown[];
  stats?: LandingStats;
  popularCategories?: Category[];
  footer?: React.ReactNode;
}

/* ── Static content (KBBI-aligned copy) ─────────────────────────────────── */
const TRUST_BADGES = [
  { icon: ShieldCheck, title: "Lowongan Terverifikasi", desc: "100% terverifikasi & terpercaya" },
  { icon: Building2, title: "Mitra Industri Aktif", desc: "Perusahaan pilihan bergabung" },
  { icon: UserCheck, title: "Pendampingan Karier", desc: "Dibimbing hingga siap kerja" },
  { icon: Zap, title: "Proses Lamaran Mudah", desc: "Cepat, praktis, tanpa ribet" },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Terpercaya", desc: "Bekerja sama dengan ribuan industri terverifikasi di seluruh wilayah Indonesia." },
  { icon: Zap, title: "Mudah Digunakan", desc: "Pendaftaran, pencarian, dan pemantauan dirancang agar cepat dan praktis." },
  { icon: ListChecks, title: "Banyak Pilihan", desc: "Ribuan lowongan prakerin dari beragam sektor industri dan keahlian." },
  { icon: Handshake, title: "Bimbingan Penuh", desc: "Dukungan dan pendampingan komprehensif selama program berlangsung." },
  { icon: Briefcase, title: "Bangun Portofolio Nyata", desc: "Kerjakan proyek nyata dan perkuat rekam jejak kariermu." },
  { icon: Activity, title: "Pantau Status Real-Time", desc: "Lacak setiap tahap seleksi secara langsung tanpa menebak." },
];

const STEPS = [
  { icon: UserPlus, title: "Daftar", desc: "Buat akun gratis dengan mudah dan cepat." },
  { icon: ClipboardList, title: "Lengkapi Profil", desc: "Isi data diri, pendidikan, dan keahlianmu." },
  { icon: Send, title: "Lamar Magang", desc: "Temukan lowongan yang sesuai dan kirim lamaran." },
  { icon: LineChart, title: "Pantau Status", desc: "Lacak proses seleksi hingga mendapat penawaran." },
];

const AUDIENCE = [
  { icon: School, title: "Sekolah", desc: "Kelola pendaftaran siswa, administrasi, dan kerja sama industri dengan lebih tertata." },
  { icon: Landmark, title: "Perguruan Tinggi", desc: "Fasilitasi mahasiswa mencari tempat magang dan lakukan pemantauan secara efisien." },
  { icon: Factory, title: "Industri", desc: "Publikasikan lowongan magang dan temukan kandidat talenta muda terbaik dengan mudah." },
  { icon: GraduationCap, title: "Siswa & Mahasiswa", desc: "Eksplorasi dan lamar lowongan praktik kerja yang sesuai dengan minat dan jurusanmu." },
];

const SECURITY = [
  { icon: ShieldCheck, title: "Keamanan Data", desc: "Kami menerapkan standar enkripsi tinggi untuk menjaga keamanan dan kerahasiaan data pengguna." },
  { icon: Scale, title: "Kepatuhan Regulasi", desc: "Platform ini beroperasi mematuhi peraturan dan undang-undang (UU ITE) yang berlaku." },
  { icon: Lock, title: "Privasi Terjamin", desc: "Informasi pribadi Anda tidak akan dibagikan kepada pihak ketiga tanpa persetujuan eksplisit." },
];

const REGISTER_ROLES = [
  { icon: School, title: "Sekolah", type: "sekolah" },
  { icon: Factory, title: "Industri", type: "company" },
  { icon: Landmark, title: "Perguruan Tinggi", type: "university" },
  { icon: GraduationCap, title: "Siswa", type: "siswa" },
  { icon: UserRound, title: "Mahasiswa", type: "mahasiswa" },
];

const FAQS = [
  { q: "Bagaimana cara mendaftar magang di PRAKERIN.ID?", a: "Buat akun gratis, lengkapi profil beserta berkas, lalu ajukan lamaran ke lowongan yang sesuai. Seluruh proses dilakukan daring dalam hitungan menit." },
  { q: "Berapa lama durasi magang yang tersedia?", a: "Durasi mengikuti kebutuhan mitra industri, umumnya 1–6 bulan. Anda dapat menyaring lowongan berdasarkan durasi yang diinginkan." },
  { q: "Apa saja syarat untuk mendaftar magang?", a: "Anda cukup berstatus pelajar SMK, mahasiswa, atau lulusan baru, memiliki akun terverifikasi, serta melengkapi data diri dan portofolio." },
  { q: "Apakah ada biaya untuk mendaftar magang?", a: "Tidak. Pendaftaran dan pencarian lowongan di PRAKERIN.ID sepenuhnya gratis bagi pencari magang." },
  { q: "Apakah seluruh lowongan sudah terverifikasi?", a: "Ya. Setiap mitra industri dan lowongan melewati proses verifikasi tim kami untuk memastikan keamanan dan keabsahannya." },
  { q: "Bagaimana cara memantau status lamaran saya?", a: "Seluruh tahapan seleksi—dari lamaran terkirim hingga penerimaan—dapat dipantau secara real-time melalui dasbor pribadi Anda." },
];

const FALLBACK_CATEGORIES: Category[] = [
  { id: "web-developer", name: "Web Developer", total: 0 },
  { id: "ui-ux-designer", name: "UI/UX Designer", total: 0 },
  { id: "digital-marketing", name: "Digital Marketing", total: 0 },
  { id: "data-analyst", name: "Data Analyst", total: 0 },
  { id: "desain-multimedia", name: "Desain Multimedia", total: 0 },
];

const FALLBACK_STORIES: CommentPrakerin[] = [
  {
    id: "s1",
    name: "Muhammad Mufti",
    position: "Web Developer",
    comment: "Aplikasi yang sangat membantu untuk saya pribadi, jadi bisa mencari perusahaan yang sesuai dengan minat dan keahlian.",
    photo_profile: null,
  },
  {
    id: "s2",
    name: "Aufa Azhar",
    position: "UI/UX Designer",
    comment: "Sangat membantu dan memudahkan saya untuk mencari pengalaman kerja yang relevan sejak dini.",
    photo_profile: null,
  },
  {
    id: "s3",
    name: "Syahdan Alfiansyah",
    position: "Digital Marketing",
    comment: "Prosesnya jelas dan transparan. Saya menemukan tempat magang dengan lebih mudah dan cepat.",
    photo_profile: null,
  },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */
const nf = new Intl.NumberFormat("id-ID");
const fmt = (n: number) => nf.format(n);

const partnerLogo = (logo?: string): string | null =>
  logo
    ? logo.startsWith("pfpupload/")
      ? getPhotoProfileUrl(logo)
      : `${process.env.NEXT_PUBLIC_API_URL}/storage/partner/${logo}`
    : null;

function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("web") || n.includes("develop") || n.includes("program")) return Code2;
  if (n.includes("ui") || n.includes("ux") || n.includes("desain grafis")) return PenTool;
  if (n.includes("market")) return Megaphone;
  if (n.includes("data") || n.includes("analis")) return BarChart3;
  if (n.includes("desain") || n.includes("multimedia") || n.includes("kreatif")) return Palette;
  return Briefcase;
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function LandingPage({
  partners = [],
  commentPrakerins = [],
  stats,
  popularCategories,
  footer,
}: LandingProps) {
  const categories =
    popularCategories && popularCategories.length > 0
      ? popularCategories
      : FALLBACK_CATEGORIES;
  const stories = commentPrakerins.filter((c) => c.comment);
  const displayStories = stories.length ? stories : FALLBACK_STORIES;

  const companyPartners = partners.filter((p) => p.type === "company");
  const schoolPartners = partners.filter((p) => p.type === "school");
  const universityPartners = partners.filter((p) => p.type === "university");
  const [partnerTab, setPartnerTab] = useState<"company" | "school" | "university">(
    companyPartners.length ? "company" : schoolPartners.length ? "school" : "university"
  );
  const partnersByTab = {
    company: companyPartners,
    school: schoolPartners,
    university: universityPartners,
  };
  const activePartners = partnersByTab[partnerTab].slice(0, 12);
  const hasPartners = partners.length > 0;

  return (
    <main className="overflow-x-hidden bg-white">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section id="beranda" className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-accent-light/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent">
              <ShieldCheck className="h-4 w-4" /> Platform Magang No. 1 di Indonesia
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-gray-900 sm:text-5xl">
              Temukan Tempat{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Praktik Kerja Industri
              </span>{" "}
              Terbaik untuk Masa Depanmu.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              PRAKERIN.ID menjembatani siswa, mahasiswa, perguruan tinggi, dan
              industri dalam program praktik kerja yang berkualitas, terstruktur,
              dan mudah diakses.
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/daftar"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-light px-7 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-accent/25 hover:brightness-105"
              >
                Daftar Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:border-accent hover:text-accent"
              >
                <Search className="h-4 w-4" /> Cari Lowongan
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent/5 to-accent-light/10" />
            <img
              src="/Hiring.png"
              alt="Ilustrasi siswa dan mahasiswa mencari magang di PRAKERIN.ID"
              width={640}
              height={520}
              className="mx-auto h-auto w-full max-w-lg relative z-10"
              loading="eager"
            />
            
            {/* Floating Badges Surrounding Image */}
            <div className="floating absolute -left-10 top-12 flex max-w-[200px] items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur z-20">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">Lowongan Terverifikasi</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">100% terverifikasi & terpercaya</p>
              </div>
            </div>

            <div className="floating-delayed absolute -right-8 top-8 flex max-w-[200px] items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur z-20">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">Mitra Industri Aktif</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">
                  {stats ? `${fmt(stats.companies)}+ perusahaan bergabung` : '26+ perusahaan bergabung'}
                </p>
              </div>
            </div>

            <div className="floating absolute -left-6 bottom-20 flex max-w-[200px] items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur z-20">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <UserCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">Pendampingan Karier</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">Dibimbing hingga siap kerja</p>
              </div>
            </div>

            <div className="floating-delayed absolute -right-2 bottom-12 flex max-w-[200px] items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur z-20">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">Proses Lamaran Mudah</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">Cepat, praktis, tanpa ribet</p>
              </div>
            </div>

            {stats && (
              <>
                <div className="floating absolute left-1/2 -top-6 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur z-20">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Lowongan Baru</p>
                    <p className="text-lg font-extrabold leading-none text-gray-900">
                      +{fmt(stats.new_jobs_month)}
                      <span className="ml-1 text-xs font-medium text-gray-400">/ bulan</span>
                    </p>
                  </div>
                </div>
                <div className="floating-delayed absolute right-1/4 -bottom-6 translate-x-1/2 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur z-20">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vip/15 text-vip">
                    <CheckCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Tingkat Penempatan</p>
                    <p className="text-lg font-extrabold leading-none text-gray-900">{stats.placement_rate}%</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ───────────────────────────────────────────────── */}
      <section id="keunggulan" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Nilai Tambah Kami"
          title="Mengapa Memilih PRAKERIN.ID?"
          subtitle="Kami menawarkan ekosistem terpadu yang menyederhanakan proses magang dari hulu ke hilir untuk semua pihak."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <article className="group h-full rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mb-2 font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── UNTUK SIAPA (Solusi Terintegrasi) ────────────────────────── */}
      <section id="untuk-siapa" className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Solusi Terintegrasi"
            title="Untuk Siapa PRAKERIN.ID?"
            subtitle="Menghubungkan seluruh elemen ekosistem pendidikan vokasi dan industri dalam satu platform."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((a, i) => (
              <Reveal key={a.title} delay={i * 80}>
                <div className="group h-full rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
                  <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <a.icon className="h-9 w-9" />
                  </span>
                  <h3 className="mb-3 text-lg font-bold text-gray-900">{a.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR CATEGORIES ───────────────────────────────────────── */}
      <section id="kategori" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Kategori Populer"
            title="Bidang Magang Paling Diminati"
            subtitle="Jelajahi bidang yang paling banyak dicari oleh mitra industri kami."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((c, i) => {
              const Icon = categoryIcon(c.name);
              const href = c.total > 0 ? `/lowongan?field_id=${c.id}` : `/lowongan?search=${encodeURIComponent(c.name)}`;
              return (
                <Reveal key={c.id} delay={i * 70}>
                  <Link
                    href={href}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-tight text-gray-900">{c.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {c.total > 0 ? `${fmt(c.total)} lowongan` : "Jelajahi"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link href="/lowongan" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5 transition-all">
              Lihat semua kategori <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="alur" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Alur Menggunakan PRAKERIN.ID"
          title="Empat Langkah Menuju Magang Impian"
          subtitle="Prosesnya ringkas dan transparan—Anda bisa mulai hari ini juga."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="relative h-full rounded-2xl border border-gray-100 bg-white p-6 text-center">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-light px-3 py-0.5 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="mx-auto mt-2 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <s.icon className="h-7 w-7" />
                </span>
                <h3 className="mb-1.5 font-bold text-gray-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SUCCESS STORIES (Marquee) ────────────────────────────────── */}
      <section id="ulasan" className="bg-gray-50 py-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Cerita Sukses"
              title="Dipercaya Talenta Muda di Seluruh Indonesia"
              subtitle="Pengalaman nyata mereka yang menemukan tempat magang lewat PRAKERIN.ID."
            />
          </div>

          {/* Marquee container */}
          <div className="relative mt-12">
            {/* Edge fade gradients */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-gray-50 to-transparent" />

            {/* Row 1 — scrolls left */}
            <div className="group mb-5">
              <div
                className="flex w-max gap-5 group-hover:[animation-play-state:paused]"
                style={{ animation: 'marquee-left 40s linear infinite' }}
              >
                {[...displayStories, ...displayStories].map((s, i) => (
                  <StoryCard key={`r1-${s.id}-${i}`} story={s} />
                ))}
              </div>
            </div>

            {/* Row 2 — scrolls right (only if enough stories) */}
            {displayStories.length > 3 && (
              <div className="group">
                <div
                  className="flex w-max gap-5 group-hover:[animation-play-state:paused]"
                  style={{ animation: 'marquee-right 45s linear infinite' }}
                >
                  {[...displayStories.slice().reverse(), ...displayStories.slice().reverse()].map((s, i) => (
                    <StoryCard key={`r2-${s.id}-${i}`} story={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────── */}
      <StatsSection stats={stats} />

      {/* ── MITRA (Sekolah & Perguruan Tinggi) ───────────────────────── */}
      {hasPartners && (
        <section id="mitra" className="border-t border-gray-100 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Jaringan Mitra"
              title="Mitra Industri, Sekolah dan Perguruan Tinggi"
              subtitle="Bergabung bersama industri dan institusi pendidikan yang memercayakan program magangnya kepada PRAKERIN.ID."
            />
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <TabPill active={partnerTab === "company"} onClick={() => setPartnerTab("company")} count={companyPartners.length}>
                Industri
              </TabPill>
              <TabPill active={partnerTab === "school"} onClick={() => setPartnerTab("school")} count={schoolPartners.length}>
                Sekolah
              </TabPill>
              <TabPill active={partnerTab === "university"} onClick={() => setPartnerTab("university")} count={universityPartners.length}>
                Perguruan Tinggi
              </TabPill>
            </div>

            {activePartners.length > 0 ? (
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {activePartners.map((p, i) => (
                  <Reveal key={p.id} delay={i * 50}>
                    <PartnerLogo name={p.name} logo={p.logo} kind={partnerTab} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-center text-sm text-gray-400">
                Mitra untuk kategori ini akan segera hadir.
              </p>
            )}

            <div className="mt-8 text-center">
              <Link href="/mitra" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-all hover:gap-2.5">
                Lihat semua mitra <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── KEAMANAN & PRIVASI ───────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {SECURITY.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-accent shadow-sm">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="mb-1 font-bold text-gray-900">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AKSI CEPAT ───────────────────────────────────────────────── */}
      <section id="daftar" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Aksi Cepat"
          title="Mulai Perjalanan Anda"
          subtitle="Pilih peran Anda dan daftar sekarang—gratis, cepat, dan mudah."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {REGISTER_ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 70}>
              <a
                href={`/daftar?type=${r.type}`}
                className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg"
              >
                <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <r.icon className="h-7 w-7" />
                </span>
                <span className="text-xs font-medium text-gray-400">Daftar Sebagai</span>
                <span className="text-sm font-bold text-gray-900">{r.title}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent transition-all group-hover:gap-2">
                  Mulai <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Pertanyaan yang Sering Ditanyakan"
          subtitle="Belum menemukan jawaban? Hubungi tim kami kapan saja."
        />
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <FaqItem key={i} question={f.q} answer={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {footer}
    </main>
  );
}

/* ── Subcomponents ─────────────────────────────────────────────────────── */
function TabPill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-accent text-white shadow-sm"
          : "border border-gray-200 bg-white text-gray-600 hover:border-accent hover:text-accent"
      }`}
    >
      {children}
      <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
        {count}
      </span>
    </button>
  );
}

function PartnerLogo({
  name,
  logo,
  kind,
}: {
  name: string;
  logo?: string;
  kind: "company" | "school" | "university";
}) {
  const [err, setErr] = useState(false);
  const src = partnerLogo(logo);
  const Icon = kind === "company" ? Building2 : kind === "school" ? School : GraduationCap;
  return (
    <div className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:-translate-y-1 hover:border-accent/20 hover:shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
        {src && !err ? (
          <img
            src={src}
            alt={name}
            onError={() => setErr(true)}
            className="h-full w-full object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
          />
        ) : (
          <Icon className="h-7 w-7 text-accent/50" />
        )}
      </div>
      <p className="text-center text-xs font-semibold text-gray-700">{name}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-gray-500">{subtitle}</p>}
    </Reveal>
  );
}

function StoryCard({ story: s }: { story: CommentPrakerin }) {
  return (
    <figure className="flex w-[340px] shrink-0 flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Quote className="h-7 w-7 text-accent/20" />
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
        &ldquo;{s.comment}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
        <img
          src={
            getCommentPhotoUrl(s.photo_profile) ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=00809d&color=fff`
          }
          alt={s.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=00809d&color=fff`;
          }}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-bold text-gray-900">{s.name}</p>
          {s.position && <p className="truncate text-xs text-gray-500">{s.position}</p>}
        </div>
      </figcaption>
    </figure>
  );
}

function StatsSection({ stats }: { stats?: LandingStats }) {
  const { ref, visible } = useReveal();
  const items = [
    { icon: Building2, value: stats?.companies ?? 0, label: "Industri Bergabung" },
    { icon: Landmark, value: stats?.universities ?? 0, label: "Perguruan Tinggi" },
    { icon: Briefcase, value: stats?.active_jobs ?? 0, label: "Lowongan Tersedia" },
    { icon: Users, value: stats?.total_students ?? 0, label: "Peserta Terdaftar" },
  ];
  return (
    <section
      id="statistik"
      className="relative overflow-hidden bg-gradient-to-br from-accent to-accent-dark py-16"
    >
      {/* dotted pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-white/70">
          Dipercaya oleh ribuan mitra
        </p>
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:divide-x md:divide-white/20">
          {items.map((it, i) => (
            <StatItem key={it.label} {...it} start={visible} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
  start,
  delay,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  start: boolean;
  delay: number;
}) {
  const n = useCountUp(value, 1600, start);
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`px-4 transition-all duration-700 ${
        start ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="mb-4 flex justify-center text-vip">
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-3xl font-extrabold text-white sm:text-4xl">
        {fmt(n)}
        {value > 0 && "+"}
      </p>
      <p className="mt-2 text-sm font-medium text-white/80">{label}</p>
    </div>
  );
}

function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-accent transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-gray-500">{answer}</p>
        </div>
      </div>
    </div>
  );
}
