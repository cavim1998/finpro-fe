import axios from "axios";
import { getSession, signOut } from "next-auth/react";

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

axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = session?.user?.accessToken;
    
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Request to ${config.url} with auth token`);
    } else {
      // Don't warn for auth endpoints (they don't need existing token)
      if (!config.url?.includes('/auth/')) {
        console.warn("No auth token found in session for request:", config.url);
      }
    }
  }
  return config;
});

// Response interceptor untuk handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - signing out");
      if (typeof window !== "undefined") {
        await signOut({ callbackUrl: "/signin" });
      }
    }
    return Promise.reject(error);
  }
);