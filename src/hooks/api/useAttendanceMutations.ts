import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export function useClockInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/attendance/me/clock-in", {});
      return res.data?.data ?? res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["attendance", "today"] });
    },
  });
}

export function useClockOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/attendance/me/clock-out", {});
      return res.data?.data ?? res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["attendance", "today"] });
    },
  });
}