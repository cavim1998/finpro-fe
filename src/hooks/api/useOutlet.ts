import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export const useOutlets = () => {
  return useQuery({
    queryKey: ["outlets"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/outlets");
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
