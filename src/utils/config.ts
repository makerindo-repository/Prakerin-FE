import axios from "axios";

export const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ENDPOINTS = {
  USERS: "/users",
  HOMEPAGES: "/homepages",
//   PRODUCTS: "/products",
//   ORDERS: "/orders",
//   CATEGORIES: "/categories",
//   DASHBOARD: "/dashboard",
  CURRICULUM_VITAE: "/curriculum-vitaes",
  INTERNSHIP_APPLICATIONS: "/internship-applications",
  JOB_OPENINGS: "/job-openings",
  FIELDS: "/fields",
  DURATIONS: "/durations",
  TESTS: "/tests",
  PARTNERS: "/partners",
  COMMENTPRAKERINS: "/comment-prakerins",
  SAVE_JOB_OPENINGS: "/save-job-openings",
  MAJORS: "/majors",
  CITY_REGENCIES: "/city-regencies",
  PROVINCES: "/provinces",
  ROLES: "/roles",
  SECTORS: "/sectors",
  MOUS: "/mous",
  CERTIFICATES: "/certificates",
  TASKS: "/tasks",
  ADMIN: "/admin",
  DEV: "/dev",
  CONTACT_US: "/contact-us",
  REPORT_TASKS: "/report-tasks",
  FEEDBACKS: "/feedbacks",
  INTERNSHIPS: "/internships",
  ACHIEVEMENTS: "/achievements",
  STUDENTS: "/students"

};

export const createApiCall = async (options: { url: string; method?: string; data?: any ; headers?: any ; params?: any }, signal?: AbortSignal) => {
  const { url, method = "GET", data, headers, params } = options;
  return API.request({
    url,
    method,
    data,
    headers,
    params,
    signal,
  });
};
// export default API;