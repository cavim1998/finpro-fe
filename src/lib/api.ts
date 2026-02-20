import axios, { AxiosHeaders } from "axios";
import { getToken } from "@/lib/token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  console.log("[API] attach token?", !!token, config.url);

  if (token) {
    // axios v1: headers bisa AxiosHeaders
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