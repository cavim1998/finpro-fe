import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginApi } from "./auth.api";
import { setToken } from "@/lib/token";

  export function useLogin() {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res: any) => {
      const token = res?.accessToken || res?.data?.accessToken;
      if (token) setToken(token);
    },
  });
}