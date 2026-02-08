import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import Cookies from "js-cookie";

const safeJsonParse = <T,>(value?: string): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/profile");
      const data = res.data?.data ?? res.data;

      if (typeof window !== "undefined") {
        const isProduction = window.location.protocol === "https:";
        Cookies.set("user_data", JSON.stringify(data), {
          expires: 7,
          secure: isProduction,
          sameSite: "strict",
        });
      }

      return data;
    },
    retry: false,
    staleTime: 60_000,
    initialData: () => {
      if (typeof window === "undefined") return undefined;
      return safeJsonParse<any>(Cookies.get("user_data") ?? undefined) ?? undefined;
    },
  });
}