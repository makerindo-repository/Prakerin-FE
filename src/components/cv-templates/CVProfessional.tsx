import React from 'react';
import { CVTemplateProps } from '@/types/cv';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { CVResult } from '@/models/CV';

const CVProfessional: React.FC<{data: CVResult| null}> = ({ data }) => {
  //  const profile = data?.profile_user ?? null;
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
    <div className="bg-white text-gray-900 p-10 font-serif">
      {/* --- HEADER --- */}
      <header className="mb-8 flex justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{fullName}</h1>
          <p className="text-lg text-accent-dark mt-1">{jobTitle}</p>
          <div className="flex items-center space-x-6 text-sm text-gray-600 mt-3 flex-wrap gap-y-2">
            <div className="flex items-center gap-2"><Mail size={14} /><span>{email}</span></div>
            <div className="flex items-center gap-2"><Phone size={14} /><span>{phone}</span></div>
            <div className="flex items-center gap-2"><Linkedin size={14} /><span>{linkedin}</span></div>
          </div>
        </div>
        {data?.photo_profile && (
          <img 
            src={data.photo_profile} 
            alt={fullName} 
            className="w-24 h-32 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0" 
          />
        )}
      </header>
      <hr className="mb-8" />

      <main>
        {/* --- RINGKASAN --- */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-accent-dark border-b border-gray-200 pb-2 mb-3">Ringkasan Profesional</h2>
          <p className="text-base leading-relaxed">{summary}</p>
        </section>

        {/* --- PENGALAMAN KERJA --- */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-accent-dark border-b border-gray-200 pb-2 mb-4">Pengalaman Kerja</h2>
          {work_experience.map((job, index) => (
            <div key={index} className="mb-5">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-semibold">{job.job_title}</h3>
                <p className="text-sm text-gray-600">{job.start_date} - {job.end_date}</p>
              </div>
              <p className="text-md text-gray-700 font-medium italic">{job.company}</p>
              <ul className="list-disc list-outside ml-5 mt-2 text-base space-y-1 text-gray-700">
                {job.description_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* --- PENDIDIKAN --- */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-accent-dark border-b border-gray-200 pb-2 mb-3">Pendidikan</h2>
          {education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold">{edu.institution}</h3>
              <p className="text-md text-gray-700">{edu.degree} di {edu.field_of_study}</p>
              <p className="text-sm text-gray-600">Lulus {edu.graduation_year}</p>
            </div>
          ))}/*  */
        </section>

        {/* --- KETERAMPILAN --- */}
        <section>
          <h2 className="text-xl font-bold text-accent-dark border-b border-gray-200 pb-2 mb-3">Keterampilan</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CVProfessional;
