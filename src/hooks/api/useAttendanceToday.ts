import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export function useAttendanceTodayQuery() {
  return useQuery({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const res = await axiosInstance.get("/attendance/me/today");
      return res.data?.data ?? res.data;
    },
    retry: false,
    staleTime: 2_000,
  });
}