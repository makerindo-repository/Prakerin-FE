export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour <= 10) {
    return "Selamat Pagi.";
  } else if (hour >= 11 && hour <= 14) {
    return "Selamat Siang.";
  } else if (hour >= 15 && hour <= 17) {
    return "Selamat Sore.";
  } else {
    return "Selamat Malam.";
  }
}

export interface GreetingDetails {
  timeOfDay: string;
  sentence: string;
}

export function getGreetingDetails(date: Date = new Date()): GreetingDetails {
  const hour = date.getHours();

  if (hour >= 5 && hour <= 10) {
    const options = [
      "Semoga hari Anda menyenangkan dan penuh produktivitas!",
      "Awali hari ini dengan senyuman dan semangat baru!",
      "Mari awali pagi ini dengan fokus dan motivasi terbaik!"
    ];
    return {
      timeOfDay: "pagi",
      sentence: options[Math.floor(Math.random() * options.length)],
    };
  } else if (hour >= 11 && hour <= 14) {
    const options = [
      "Tetap semangat menjalani aktivitas hari ini!",
      "Jangan lupa istirahat sejenak di sela kesibukan Anda!",
      "Jaga fokus Anda dan semoga tugas hari ini berjalan lancar!"
    ];
    return {
      timeOfDay: "siang",
      sentence: options[Math.floor(Math.random() * options.length)],
    };
  } else if (hour >= 15 && hour <= 17) {
    const options = [
      "Selamat menyelesaikan pekerjaan Anda hari ini!",
      "Kerja bagus untuk hari ini, mari selesaikan dengan baik!",
      "Sore yang produktif! Tetap semangat menjelang akhir hari kerja!"
    ];
    return {
      timeOfDay: "sore",
      sentence: options[Math.floor(Math.random() * options.length)],
    };
  } else {
    const options = [
      "Selamat beristirahat dan bersiaplah untuk esok hari!",
      "Waktunya melepas lelah, selamat bersantai bersama keluarga!",
      "Semoga malam ini memberi Anda ketenangan untuk esok yang luar biasa!"
    ];
    return {
      timeOfDay: "malam",
      sentence: options[Math.floor(Math.random() * options.length)],
    };
  }
}

