import React from 'react';
import { Mail, Phone, Linkedin, GraduationCap, Briefcase } from 'lucide-react';
import { CVResult } from '@/models/CV'; // Asumsi model data

// Definisikan konstanta gaya di sini
const ACCENT_COLOR = '#3b82f6'; // Biru cerah (mirip Tailwind blue-500)
const BG_COLOR = '#1f2937'; // Abu-abu gelap (mirip Tailwind gray-800)
const TEXT_COLOR = '#4b5563'; // Abu-abu sedang

const CVModernPDF: React.FC<{data?: CVResult| null}> = ({ data }) => {
  const work_experience = data?.work_experience ?? [];
  const education = data?.education ?? [];
  const skills = data?.skills ?? [];

  const fullName = data?.full_name ?? "Nama Lengkap Anda";
  const jobTitle = work_experience[0]?.job_title ?? "Frontend Developer";
  const email = data?.email ?? "email@anda.com";
  const phone = data?.phone_number ?? "081234567890";
  const linkedin = data?.linkedin_url ?? "linkedin.com/in/username";
  const summary = data?.summary ?? "Ringkasan profesional Anda akan ditempatkan di sini. Jelaskan pengalaman, keterampilan, dan tujuan karier Anda secara singkat dan padat untuk menarik perhatian perekrut.";

  return (
    <div style={{
      display: 'flex',
      minHeight: '1123px', // A4 height
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10pt',
    }}>
      {/* --- SIDEBAR KIRI --- */}
      <aside style={{
        width: '33.333333%',
        backgroundColor: BG_COLOR,
        color: '#ffffff',
        padding: '32px',
      }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          {data?.photo_profile ? (
            <img
              src={data.photo_profile}
              alt={fullName}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                margin: '0 auto 16px',
                display: 'block',
                border: `3px solid ${ACCENT_COLOR}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            />
          ) : (
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: ACCENT_COLOR,
              borderRadius: '50%',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24pt',
              fontWeight: 'bold',
              color: '#ffffff',
            }}>
              {fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px 0' }}>{fullName}</h1>
          <h2 style={{ fontSize: '12pt', color: ACCENT_COLOR, fontWeight: '300', margin: '0' }}>{jobTitle}</h2>
        </header>

        {/* --- KONTAK --- */}
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '10pt', fontWeight: 'bold', color: ACCENT_COLOR, textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '4px', borderBottom: `1px solid ${ACCENT_COLOR}` }}>Kontak</h3>
          <div style={{ marginTop: '10px', fontSize: '9pt', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}><Mail size={14} style={{ marginRight: '8px' }} /><p style={{ margin: 0 }}>{email}</p></div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}><Phone size={14} style={{ marginRight: '8px' }} /><p style={{ margin: 0 }}>{phone}</p></div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}><Linkedin size={14} style={{ marginRight: '8px' }} /><p style={{ margin: 0 }}>{linkedin}</p></div>
          </div>
        </section>

        {/* --- KETERAMPILAN --- */}
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '10pt', fontWeight: 'bold', color: ACCENT_COLOR, textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '4px', borderBottom: `1px solid ${ACCENT_COLOR}` }}>Keterampilan</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {skills.slice(0, 10).map((skill, index) => (
              <span key={index} style={{
                backgroundColor: ACCENT_COLOR + '33', // Accent with 20% opacity
                color: '#ffffff',
                fontSize: '8pt',
                fontWeight: '500',
                padding: '3px 8px',
                borderRadius: '12px',
              }}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* --- PENDIDIKAN --- */}
        <section>
          <h3 style={{ fontSize: '10pt', fontWeight: 'bold', color: ACCENT_COLOR, textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '4px', borderBottom: `1px solid ${ACCENT_COLOR}` }}>Pendidikan</h3>
          <div style={{ marginTop: '10px' }}>
            {education.map((edu, index) => (
              <div key={index} style={{ fontSize: '9pt', marginBottom: '12px' }}>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{edu.degree}</p>
                <p style={{ color: '#d1d5db', margin: '0' }}>{edu.institution}</p>
                <p style={{ color: '#9ca3af', fontSize: '8pt', fontStyle: 'italic', margin: '0' }}>{edu.graduation_year}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main style={{ width: '66.666667%', padding: '40px', color: TEXT_COLOR }}>
        {/* --- RINGKASAN --- */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: BG_COLOR, borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase' }}>Ringkasan</h2>
          <p style={{ fontSize: '10pt', lineHeight: '1.5' }}>{summary}</p>
        </section>

        {/* --- PENGALAMAN KERJA --- */}
        <section>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: BG_COLOR, borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: '4px', marginBottom: '20px', textTransform: 'uppercase' }}>Pengalaman Kerja</h2>
          <div style={{}}>
            {work_experience.map((job, index) => (
              <div key={index} style={{ position: 'relative', paddingLeft: '20px', borderLeft: `2px solid #e5e7eb`, marginBottom: '20px' }}>
                 {/* Timeline dot */}
                 <div style={{ position: 'absolute', left: '-5px', top: '0', width: '10px', height: '10px', backgroundColor: ACCENT_COLOR, borderRadius: '50%', border: '2px solid #ffffff' }}></div>
                
                <p style={{ fontSize: '9pt', color: '#6b7280', margin: '0' }}>{job.start_date} - {job.end_date}</p>
                <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: ACCENT_COLOR, margin: '4px 0 2px 0' }}>{job.job_title}</h3>
                <p style={{ fontSize: '10pt', fontWeight: '500', color: TEXT_COLOR, margin: '0 0 8px 0' }}>{job.company}</p>
                
                <ul style={{ listStyleType: 'disc', listStylePosition: 'outside', marginLeft: '16px', padding: 0, fontSize: '9pt', color: '#374151' }}>
                  {job.description_points.map((point, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{point}</li>
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

export default CVModernPDF;