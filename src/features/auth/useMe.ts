"use client";

import { useQuery } from "@tanstack/react-query";
import { meApi } from "./auth.api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      return await meApi();
    },
    retry: 1,
  });
}