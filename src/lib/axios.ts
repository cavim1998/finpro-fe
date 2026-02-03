import axios from "axios";
import Cookies from "js-cookie";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

// Remove /api or /api/auth suffix to avoid double paths
const baseURL = rawBaseUrl
  .replace(/\/api\/auth\/?$/i, "")
  .replace(/\/api\/?$/i, "");

export const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Request to ${config.url} with auth token (${token.substring(0, 20)}...)`);
    } else {
      // Don't warn for auth endpoints (they don't need existing token)
      if (!config.url?.includes('/auth/')) {
        console.warn("No auth token found in cookies for request:", config.url);
      }
    }
  }
  return config;
});

// Response interceptor untuk handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - clearing token");
      if (typeof window !== "undefined") {
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
      }
    }
    return Promise.reject(error);
  }
);