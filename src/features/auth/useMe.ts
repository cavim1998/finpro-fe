"use client";

import { useQuery } from "@tanstack/react-query";
import { meApi } from "./auth.api";

type UseMeOptions = {
  /**
   * Kalau false, query tidak akan dijalankan.
   * Berguna untuk komponen yang sudah tahu role (mis. BottomNav diberi role dari page).
   */
  enabled?: boolean;
};

export function useMe(options?: UseMeOptions) {
  return useQuery({
    queryKey: ["me"],
    queryFn: meApi,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}