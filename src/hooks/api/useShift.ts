import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { ShiftListTypes } from "@/types/shift";
import { PageableResponse } from "@/types/pagination";

interface ShiftQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  outletId?: number;
}

export const useShiftTemplates = (params: ShiftQueryParams) => {
  return useQuery<PageableResponse<ShiftListTypes>>({
    queryKey: ["shifts", params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params.page) query.append("page", params.page.toString());
      if (params.limit) query.append("limit", params.limit.toString());
      if (params.search) query.append("search", params.search);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.sortOrder) query.append("sortOrder", params.sortOrder);
      if (params.outletId) query.append("outletId", params.outletId.toString());
      const { data } = await axiosInstance.get(`/shifts?${query.toString()}`);
      return data;
    },
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
