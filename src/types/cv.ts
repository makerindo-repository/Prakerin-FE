export interface WorkExperience {
  job_title: string;
  company: string;
  start_date: string;
  end_date: string;
  description_points: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  graduation_year: string;
}

export interface CVData {
  summary: string;
  work_experience: WorkExperience[];
  education: Education[];
  skills: string[];
  // Data personal yang tidak ada di JSON tapi penting untuk CV
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  jobTitle?: string;
}

export interface CVTemplateProps {
  data: CVData;
}
