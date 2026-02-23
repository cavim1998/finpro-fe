import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export function useAttendanceTodayQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const res = await axiosInstance.get("/attendance/me/today");
      return res.data?.data ?? res.data;
    },
    retry: false,
    staleTime: 2_000,
    enabled: options?.enabled ?? true,
  });
}
