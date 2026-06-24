export const getGrade = (value: "smk" | "mahasiswa" | "all") => {
  const labels = {
    smk: "Tingkat SMK",
    mahasiswa: "Tingkat Mahasiswa",
    all: "Semua Tingkat",
  };

  return labels[value];
};

export const getType = (value: "full_time" | "part_time") => {
  const labels = {
    full_time: "Penuh Waktu",
    part_time: "Paruh Waktu",
  };

  return labels[value];
};

export const getLocation = (
  value: "onsite" | "remote" | "hybrid"
) => {
  const labels = {
    onsite: "WFO",
    remote: "WFH",
    hybrid: "WFO & WFH",
  };

  return labels[value];
};

export const getTypeTest = (value: string) => {
  // your existing logic
};
