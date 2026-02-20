"use client";

import Cookies from "js-cookie";

const LS_KEY = "access_token";
const COOKIE_KEY = "auth_token";

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, token);
  }

  Cookies.set(COOKIE_KEY, token, {
    sameSite: "lax",
  });
}

export function getToken() {
  const fromCookie = Cookies.get(COOKIE_KEY);
  if (fromCookie) return fromCookie;

  if (typeof window !== "undefined") {
    return localStorage.getItem(LS_KEY);
  }
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LS_KEY);
  }
  Cookies.remove(COOKIE_KEY);
}