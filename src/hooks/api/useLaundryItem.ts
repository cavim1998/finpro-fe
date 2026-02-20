import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { LaundryItemFormData } from "@/lib/schema/laundry-item.schema";
import { LaundryItemTypes } from "@/types/laundry-item";
import { PageableResponse } from "@/types/pagination";

interface GetItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useLaundryItems = (params?: GetItemsParams) => {
  return useQuery<PageableResponse<LaundryItemTypes>>({
    queryKey: ["laundry-items", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/laundry-items", { params });
      return data;
    },
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LaundryItemFormData) => {
      const { data: response } = await axiosInstance.post(
        "/laundry-items",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laundry-items"] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: LaundryItemFormData;
    }) => {
      const { data: response } = await axiosInstance.patch(
        `/laundry-items/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laundry-items"] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/laundry-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laundry-items"] });
    },
  });
};
