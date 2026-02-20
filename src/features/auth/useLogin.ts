"use client";

import { useMutation } from "@tanstack/react-query";
import { loginApi } from "./auth.api";
import { setToken } from "@/lib/token";

export function useLogin() {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      const token =
        res?.data?.accessToken ??
        res?.accessToken ??
        res?.data?.token ??
        res?.token;

      if (token) setToken(token);
    },
  });
}