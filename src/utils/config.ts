import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.prakerin.id';
const TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 60000;

export const ENDPOINTS = {
  // Authentication & User
  LOGIN: '/api/v1/users/login',
  REGISTER: '/api/v1/users/register',
  LOGOUT: '/api/v1/users/logout',
  USERS: '/api/v1/users', 

  // Dashboard Admin
  ADMIN: '/api/v1/admin',
  DASHBOARD: '/api/v1/admin/dashboard',

  // Landing Page Components
  HOMEPAGES: '/api/v1/homepages',
  PARTNERS: '/api/v1/partners',
  COMMENT_PRAKERINS: '/api/v1/comment-prakerins',
  CONTACT_US: '/api/v1/contact-us',

  // Core Features
  JOB_OPENINGS: '/api/v1/job-openings',
  SAVE_JOB_OPENINGS: '/api/v1/save-job-openings',
  INTERNSHIP_APPLICATIONS: '/api/v1/internship-applications',
  INTERNSHIPS: '/api/v1/internships',
  TASKS: '/api/v1/tasks',
  REPORT_TASKS: '/api/v1/report-tasks',
  CURRICULUM_VITAE: '/api/v1/curriculum-vitaes',
  CERTIFICATES: '/api/v1/certificates',
  FEEDBACKS: '/api/v1/feedbacks',

  // Notifications & Inbox
  INBOX: '/api/v1/inbox',
  NOTIFICATION_SETTINGS: '/api/v1/users/notification-settings',

  // Master & Supporting Data
  MAJORS: '/api/v1/majors',
  TESTS: '/api/v1/tests',
  DURATIONS: '/api/v1/durations',
  MOUS: '/api/v1/mous',
  ROLES: '/api/v1/job-positions',
  SYSTEM_ROLES: '/api/v1/system/roles',
  SYSTEM_PERMISSIONS: '/api/v1/system/permissions',
  ACHIEVEMENTS: '/api/v1/achievements',
  SECTORS: '/api/v1/sectors',
  PROVINCES: '/api/v1/provinces',
  CITY_REGENCIES: '/api/v1/city-regencies',
  FIELDS: '/api/v1/fields',
  STUDENTS: '/api/v1/students',
  COMPANIES: '/api/v1/companies',
  SETTINGS: '/api/v1/settings',

  // Subscription & Revenue
  SUBSCRIPTIONS: '/api/v1/subscriptions',
  ADMIN_SUBSCRIPTIONS: '/api/v1/admin/subscriptions',
  ADMIN_REVENUE: '/api/v1/admin/revenue',
};

export const API = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true, // WAJIB TRUE untuk session & cookie Laravel Sanctum lokal
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor Token bearer otomatis
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      Cookies.get('userToken') ||
      Cookies.get('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const createApiCall = async <T = any>(arg1: any, arg2: any = {}): Promise<T> => {
  try {
    let config: any = {};

    // 1. Satukan format argumen (Object atau String) ke dalam satu objek config
    if (typeof arg1 === 'object' && arg1 !== null) {
      const { url, endpoint, method = 'get', data, ...rest } = arg1;
      config = { url: endpoint || url || '', method, data, ...rest, ...arg2 };
    } else {
      config = { url: arg1, method: arg2.method || 'get', ...arg2 };
    }

    let targetUrl = config.url;

    // 2. Normalisasi URL Rute pencegah double prefix / salah ketik
    if (targetUrl && targetUrl.includes('sanctum/csrf-cookie')) {
      targetUrl = '/sanctum/csrf-cookie'; // Bersihkan jika ada api/v1 nempel di cookie
    } else if (targetUrl && !targetUrl.startsWith('/api/v1')) {
      if (targetUrl.startsWith('/api')) {
        // Kasus jika tertulis /api/users/login (kurang v1)
        targetUrl = targetUrl.replace('/api', '/api/v1');
      } else {
        // Kasus jika tertulis rute pendek /users/login
        targetUrl = targetUrl.startsWith('/') ? `/api/v1${targetUrl}` : `/api/v1/${targetUrl}`;
      }
    }

    config.url = targetUrl;
    config.method = config.method.toLowerCase();

    // 3. Eksekusi Request
    const response = await API(config);
    
    // 4. Selalu kembalikan .data agar konsisten di komponen Frontend kamu
    return response.data;
  } catch (error: any) {
    // Re-throw the original error so callers can inspect error.response
    throw error;
  }
};

export const getPhotoProfileUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }
  const cleanPhoto = photo.startsWith("/") ? photo.slice(1) : photo;
  return `${BASE_URL}/storage/photo-profile/${cleanPhoto}`;
};

export const getCommentPhotoUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }
  const cleanPhoto = photo.startsWith("/") ? photo.slice(1) : photo;
  if (cleanPhoto.startsWith("pfpupload/")) {
    return `${BASE_URL}/storage/photo-profile/${cleanPhoto}`;
  }
  return `${BASE_URL}/storage/comment-prakerin/${cleanPhoto}`;
};

export const getPosterUrl = (poster: string | null | undefined): string | null => {
  if (!poster) return null;
  if (poster.startsWith("http://") || poster.startsWith("https://")) {
    return poster;
  }
  const cleanPoster = poster.startsWith("/") ? poster.slice(1) : poster;
  return `${BASE_URL}/storage/job-opening-posters/${cleanPoster}`;
};
