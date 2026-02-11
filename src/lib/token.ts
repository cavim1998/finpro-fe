import { api } from "@/lib/api";

const KEY = "access_token";

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function getToken() {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}