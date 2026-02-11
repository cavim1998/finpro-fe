import axios from "axios";
import { getToken } from "@/lib/token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  console.log("[API] attach token?", !!token, config.url);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});