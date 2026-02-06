import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export const useShiftTemplates = (outletId?: number) => {
  return useQuery({
    queryKey: ["shifts", outletId],
    queryFn: async () => {
      if (!outletId) return [];
      const { data } = await axiosInstance.get(`/shifts?outletId=${outletId}`);
      return data;
    },
    enabled: !!outletId,
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: res } = await axiosInstance.post("/shifts", data);
      return res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shifts"] }),
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/shifts/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shifts"] }),
  });
};