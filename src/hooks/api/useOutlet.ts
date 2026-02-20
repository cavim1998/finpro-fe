import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { PageableResponse } from "@/types/pagination";
import { OutletListTypes } from "@/types/outlet";

interface GetOutletsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useOutlets = (params?: GetOutletsParams) => {
  return useQuery<PageableResponse<OutletListTypes>>({
    queryKey: ["outlets", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/outlets", { params });
      return data;
    },
  });
};

export const useCreateOutlet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOutlet: any) => {
      const { data } = await axiosInstance.post("/outlets", newOutlet);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
    },
  });
};

export const useUpdateOutlet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { data: response } = await axiosInstance.patch(
        `/outlets/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
    },
  });
};

export const useDeleteOutlet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/outlets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
    },
  });
};
