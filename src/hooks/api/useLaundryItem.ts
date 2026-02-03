import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { LaundryItemFormData } from "@/lib/schema/laundry-item.schema";
import { LaundryItemTypes } from "@/types/laundry-item";

export const useLaundryItems = () => {
  return useQuery<LaundryItemTypes[]>({
    queryKey: ["laundry-items"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/laundry-items");
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
