import React from 'react';
import { Mail, Phone, Linkedin, MapPin, GraduationCap } from 'lucide-react';
import { CVResult } from '@/models/CV';


const CVModern: React.FC<{data?: CVResult| null}> = ({ data }) => {
  // const profile = data?.profile_user ?? null;
  // const personal = profile?.presonal_detail ?? {} as any;
  const work_experience = data?.work_experience ?? [];
  const education = data?.education ?? [];
  const skills = data?.skills ?? [];

  const fullName = data?.full_name ?? "Nama Lengkap Anda";
  const jobTitle = work_experience[0]?.job_title ?? "Frontend Developer";
  const email = data?.email ?? "email@anda.com";
  const phone = data?.phone_number ?? "081234567890";
  const linkedin = data?.linkedin_url ?? "linkedin.com/in/username";
  // summary isn't part of CVResult; create a short summary from first responsibilities if available
  const summary = data?.summary?? "null"

  return (
    <div className="flex min-h-[1123px] bg-white shadow-lg font-sans">
      {/* --- SIDEBAR KIRI --- */}
      <aside className="w-1/3 bg-gray-800 text-white p-8">
        <header className="text-center mb-12">
          <div className="w-32 h-32 bg-accent rounded-full mx-auto mb-4"></div>
          <h1 className="text-3xl font-bold text-white">{fullName}</h1>
          <h2 className="text-lg text-accent font-light">{jobTitle}</h2>
        </header>

        {/* --- KONTAK --- */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-accent uppercase tracking-wider mb-3">Kontak</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Mail size={16} /><p>{email}</p></div>
            <div className="flex items-center gap-3"><Phone size={16} /><p>{phone}</p></div>
            <div className="flex items-center gap-3"><Linkedin size={16} /><p>{linkedin}</p></div>
          </div>
        </section>

        {/* --- KETERAMPILAN --- */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-accent uppercase tracking-wider mb-3">Keterampilan</h3>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 10).map((skill, index) => (
              <span key={index} className="bg-accent/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* --- PENDIDIKAN --- */}
        <section>
          <h3 className="text-lg font-semibold text-accent uppercase tracking-wider mb-3">Pendidikan</h3>
          {education.map((edu, index) => (
            <div key={index} className="text-sm">
              <p className="font-bold">{edu.degree}</p>
              <p className="text-gray-300">{edu.institution}</p>
              <p className="text-gray-400 text-xs italic">{edu.graduation_year}</p>
            </div>
          ))}
        </section>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="w-2/3 p-10 text-gray-800">
        {/* --- RINGKASAN --- */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-accent pb-2 mb-4">Ringkasan</h2>
          <p className="text-base leading-relaxed">{summary}</p>
        </section>

        {/* --- PENGALAMAN KERJA --- */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-accent pb-2 mb-6">Pengalaman Kerja</h2>
          <div className="space-y-6">
            {work_experience.map((job, index) => (
              <div key={index} className="relative pl-6 border-l-2 border-gray-200">
                 <div className="absolute -left-[9px] top-1 w-4 h-4 bg-accent rounded-full border-4 border-white"></div>
                <p className="text-xs text-gray-500">{job.start_date} - {job.end_date}</p>
                <h3 className="text-lg font-semibold text-accent-dark">{job.job_title}</h3>
                <p className="text-md font-medium text-gray-600 mb-2">{job.company}</p>
                <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700">
                  {job.description_points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CVModern;
