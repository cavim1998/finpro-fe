import axios, { AxiosHeaders } from "axios";
import { getSession, signOut } from "next-auth/react";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API ?? "http://localhost:8000",
});

api.interceptors.request.use(async (config) => {
  // NextAuth v5 session token is the primary source of truth.
  const session = typeof window !== "undefined" ? await getSession() : null;
  const sessionToken = session?.user?.accessToken;
  const token = sessionToken;

  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      await signOut({ callbackUrl: "/signin" });
    }

    return Promise.reject(error);
  },
);
