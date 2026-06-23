export interface Lowongan {
  id: string;
  title: string;
  description: any;

  created_at: string;

  grade: "smk" | "mahasiswa" | "all";
  type: "full_time" | "part_time";
  location: "onsite" | "remote" | "hybrid";

  is_available: boolean;
  is_paid: boolean;
  qouta: number;
  save_job_opening: boolean;

  duration: {
    duration_value: number;
    duration_unit: "year" | "month" | "day";
  };

  company: {
    name: string;
    address: string;
  };

  user: {
    photo_profile: string;
  };

  city_regency: {
    name: string;
  };

  province: {
    name: string;
  };

  field: {
    name: string;
  };

  start_date: string;
  closing_date: string;

  test?: {
    title: string;
    description: string;
    type: string;
  }[];
}