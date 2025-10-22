import React from 'react';
import { CVResult } from '@/models/CV';

const CVAts: React.FC<{ data?: CVResult | null }> = ({ data }) => {
  // Map CVResult structure to the template's expected fields
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
    <div className="bg-white text-gray-800 p-8 font-sans text-sm">
      {/* --- HEADER --- */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold tracking-wider uppercase">{fullName}</h1>
        <p className="text-md mt-1">{jobTitle}</p>
        <div className="flex justify-center space-x-4 text-xs mt-2">
          <span>{phone}</span>
          <span>|</span>
          <span>{email}</span>
          <span>|</span>
          <span>{linkedin}</span>
        </div>
      </header>

      <main>
        {/* --- RINGKASAN --- */}
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-400 pb-1 mb-2">Ringkasan</h2>
          <p className="text-justify">{summary}</p>
        </section>

        {/* --- PENGALAMAN KERJA --- */}
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-400 pb-1 mb-2">Pengalaman Kerja</h2>
          {work_experience.map((job, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-md font-bold">{job.job_title}</h3>
              <div className="flex justify-between text-sm">
                <p className="font-semibold">{job.company}</p>
                <p className="italic">{job.start_date} - {job.end_date}</p>
              </div>
              <ul className="list-disc list-inside mt-1 text-sm space-y-1">
                {(job.description_points || []).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* --- PENDIDIKAN --- */}
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-400 pb-1 mb-2">Pendidikan</h2>
          {education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-md font-bold">{edu.institution}</h3>
              <p>{edu.degree}, {edu.field_of_study}</p>
              <p className="text-sm italic">Lulus: {edu.graduation_year}</p>
            </div>
          ))}
        </section>

        {/* --- KETERAMPILAN --- */}
        <section>
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-400 pb-1 mb-2">Keterampilan</h2>
          <p>{(skills || []).join(', ')}</p>
        </section>
      </main>
    </div>
  );
};

export default CVAts;
