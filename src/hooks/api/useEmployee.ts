import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { Employee } from "@/types/employee";

export const useAvailableUsers = () => {
  return useQuery({
    queryKey: ["available-users"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/employees/available");
      return data;
    },
  });
};

export const useEmployees = () => {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/employees");
      return data;
    },
  });
};

export const useAssignEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      // Payload: { userId, outletId, role, shift }
      const { data: res } = await axiosInstance.post("/employees/assign", data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["available-users"] });
    },
  });
};

export const useUnassignEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.delete(`/employees/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["available-users"] });
    },
  });
};
